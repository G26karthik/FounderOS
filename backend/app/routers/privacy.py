"""
FounderOS — Privacy Controls Router
Collection management and data deletion endpoints.
"""

import logging
from fastapi import APIRouter, HTTPException
from app.services import qdrant_memory

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Privacy"])


@router.get("/collections")
async def list_collections():
    """List all Qdrant collections with their entry counts."""
    info = qdrant_memory.get_collection_info()
    return {"collections": info}


@router.delete("/collections/{name}")
async def clear_collection(name: str):
    """Delete all entries in a collection (resets it)."""
    if name not in qdrant_memory.COLLECTIONS:
        raise HTTPException(
            status_code=404,
            detail=f"Collection '{name}' not found. Valid: {qdrant_memory.COLLECTIONS}",
        )

    success = qdrant_memory.delete_collection(name)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to clear collection")

    return {"status": "cleared", "collection": name}


@router.delete("/entries/{collection}/{point_id}")
async def delete_entry(collection: str, point_id: str):
    """Delete a specific entry from a collection."""
    if collection not in qdrant_memory.COLLECTIONS:
        raise HTTPException(status_code=404, detail=f"Collection '{collection}' not found")

    success = qdrant_memory.delete_point(collection, point_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete entry")

    return {"status": "deleted", "collection": collection, "id": point_id}
