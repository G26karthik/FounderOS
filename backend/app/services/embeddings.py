"""
FounderOS — OpenAI Embeddings Service
Thin wrapper around OpenAI's text-embedding-3-small model.
"""

import logging
from openai import OpenAI
from app.config import get_settings

logger = logging.getLogger(__name__)

_client: OpenAI | None = None
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        settings = get_settings()
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


def get_embedding(text: str) -> list[float]:
    """Get embedding vector for a single text string."""
    client = _get_client()
    text = text.replace("\n", " ").strip()
    if not text:
        return [0.0] * EMBEDDING_DIM

    try:
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text,
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        return [0.0] * EMBEDDING_DIM


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Get embedding vectors for a batch of texts."""
    client = _get_client()
    cleaned = [t.replace("\n", " ").strip() for t in texts]
    cleaned = [t if t else "empty" for t in cleaned]

    try:
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=cleaned,
        )
        return [item.embedding for item in response.data]
    except Exception as e:
        logger.error(f"Batch embedding error: {e}")
        return [[0.0] * EMBEDDING_DIM for _ in texts]
