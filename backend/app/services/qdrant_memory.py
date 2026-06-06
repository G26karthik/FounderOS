"""
FounderOS — Qdrant Vector Memory Service
Manages collections, upserts, and semantic search across the founder's memory.
"""

import logging
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
from app.config import get_settings
from app.services.embeddings import get_embedding, get_embeddings, EMBEDDING_DIM

logger = logging.getLogger(__name__)

_client: QdrantClient | None = None

COLLECTIONS = ["decisions", "tasks", "ideas", "patterns"]


def _get_client() -> QdrantClient:
    """Lazy-init Qdrant client."""
    global _client
    if _client is None:
        settings = get_settings()
        kwargs = {"url": settings.qdrant_url}
        if settings.qdrant_api_key:
            kwargs["api_key"] = settings.qdrant_api_key
        _client = QdrantClient(**kwargs)
    return _client


def init_collections():
    """Create all collections if they don't already exist."""
    client = _get_client()
    existing = {c.name for c in client.get_collections().collections}

    for name in COLLECTIONS:
        if name not in existing:
            client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(
                    size=EMBEDDING_DIM,
                    distance=Distance.COSINE,
                ),
            )
            logger.info(f"Created Qdrant collection: {name}")
        else:
            logger.info(f"Qdrant collection already exists: {name}")


def upsert_entries(collection: str, entries: list[dict]) -> list[str]:
    """
    Embed and upsert entries into a Qdrant collection.
    Each entry dict must have a 'text' field used for embedding.
    Returns the list of generated point IDs.
    """
    if not entries:
        return []

    client = _get_client()
    texts = [e.get("text", "") for e in entries]
    vectors = get_embeddings(texts)

    points = []
    ids = []
    for entry, vector in zip(entries, vectors):
        point_id = uuid.uuid4().hex
        ids.append(point_id)
        points.append(
            PointStruct(
                id=point_id,
                vector=vector,
                payload=entry,
            )
        )

    client.upsert(collection_name=collection, points=points)
    logger.info(f"Upserted {len(points)} entries into '{collection}'")
    return ids


def semantic_search(
    query: str,
    collections: list[str] | None = None,
    limit: int = 5,
    score_threshold: float = 0.3,
) -> list[dict]:
    """
    Semantic search across one or more Qdrant collections.
    Returns merged results sorted by relevance score.
    """
    client = _get_client()
    query_vector = get_embedding(query)

    if collections is None:
        collections = COLLECTIONS

    all_results = []

    for col_name in collections:
        try:
            results = client.query_points(
                collection_name=col_name,
                query=query_vector,
                limit=limit,
                with_payload=True,
                score_threshold=score_threshold,
            )
            for point in results.points:
                payload = point.payload or {}
                all_results.append({
                    "id": point.id,
                    "collection": col_name,
                    "score": point.score,
                    "text": payload.get("text", ""),
                    "date": payload.get("date", payload.get("created_at", "")),
                    "entry_type": payload.get("entry_type", col_name.rstrip("s")),
                    "metadata": payload,
                })
        except Exception as e:
            logger.error(f"Search error in '{col_name}': {e}")

    # Sort by score descending
    all_results.sort(key=lambda x: x["score"], reverse=True)
    return all_results[:limit * 2]  # Return top results across all collections


def get_timeline(
    entry_type: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    """
    Fetch entries from Qdrant for the timeline view.
    Scrolls through collections and returns payload data.
    """
    client = _get_client()

    if entry_type and entry_type != "all":
        type_to_collection = {
            "decision": "decisions",
            "task": "tasks",
            "idea": "ideas",
            "pattern": "patterns",
        }
        collections_to_search = [type_to_collection.get(entry_type, "decisions")]
    else:
        collections_to_search = COLLECTIONS

    all_entries = []

    for col_name in collections_to_search:
        try:
            result = client.scroll(
                collection_name=col_name,
                limit=limit,
                offset=offset,
                with_payload=True,
                with_vectors=False,
            )
            points, _next_offset = result
            for point in points:
                payload = point.payload or {}
                all_entries.append({
                    "id": str(point.id),
                    "entry_type": payload.get("entry_type", col_name.rstrip("s")),
                    "text": payload.get("text", ""),
                    "date": payload.get("date", payload.get("created_at", "")),
                    "metadata": payload,
                })
        except Exception as e:
            logger.error(f"Timeline scroll error in '{col_name}': {e}")

    # Sort by date descending
    all_entries.sort(key=lambda x: x.get("date", ""), reverse=True)
    return all_entries[:limit]


def get_collection_info() -> list[dict]:
    """Get info (name + count) for all collections."""
    client = _get_client()
    info = []
    for name in COLLECTIONS:
        try:
            col = client.get_collection(name)
            info.append({"name": name, "count": col.points_count})
        except Exception:
            info.append({"name": name, "count": 0})
    return info


def delete_collection(name: str) -> bool:
    """Delete a collection and recreate it empty."""
    if name not in COLLECTIONS:
        return False
    client = _get_client()
    try:
        client.delete_collection(name)
        # Recreate empty
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(
                size=EMBEDDING_DIM,
                distance=Distance.COSINE,
            ),
        )
        logger.info(f"Deleted and recreated collection: {name}")
        return True
    except Exception as e:
        logger.error(f"Delete collection error: {e}")
        return False


def delete_point(collection: str, point_id: str) -> bool:
    """Delete a specific point from a collection."""
    client = _get_client()
    try:
        client.delete(
            collection_name=collection,
            points_selector=[point_id],
        )
        return True
    except Exception as e:
        logger.error(f"Delete point error: {e}")
        return False


def update_entry_payload(collection: str, point_id: str, payload: dict) -> bool:
    """Update (merge) the payload of a specific entry in a collection."""
    client = _get_client()
    try:
        client.set_payload(
            collection_name=collection,
            payload=payload,
            points=[point_id],
        )
        return True
    except Exception as e:
        logger.error(f"Update payload error: {e}")
        return False


def get_all_entries_for_digest(days: int = 7) -> list[dict]:
    """
    Fetch all recent entries across collections for pattern synthesis.
    In production you'd filter by date; here we just grab everything.
    """
    client = _get_client()
    all_entries = []

    for col_name in ["decisions", "tasks", "ideas"]:
        try:
            result = client.scroll(
                collection_name=col_name,
                limit=200,
                with_payload=True,
                with_vectors=False,
            )
            points, _ = result
            for point in points:
                payload = point.payload or {}
                all_entries.append({
                    "id": str(point.id),
                    "collection": col_name,
                    "entry_type": payload.get("entry_type", col_name.rstrip("s")),
                    "text": payload.get("text", ""),
                    "date": payload.get("date", payload.get("created_at", "")),
                    "metadata": payload,
                })
        except Exception as e:
            logger.error(f"Digest fetch error in '{col_name}': {e}")

    return all_entries
