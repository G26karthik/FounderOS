"""
FounderOS — Timeline Router
Chronological view of all captured entries.
"""

import logging
from fastapi import APIRouter, Query
from app.services import qdrant_memory

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Timeline"])


@router.get("/timeline")
async def get_timeline(
    type: str = Query("all", description="Filter: all, decision, task, idea, pattern"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """
    Fetch timeline entries from Qdrant.
    Returns chronologically sorted entries with metadata.
    """
    entries = qdrant_memory.get_timeline(
        entry_type=type if type != "all" else None,
        limit=limit,
        offset=offset,
    )

    return {
        "entries": entries,
        "count": len(entries),
        "type": type,
    }
