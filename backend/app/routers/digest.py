"""
FounderOS — Digest Router
Triggers the PatternSynthesizer agent for weekly insight generation.
"""

import logging
from fastapi import APIRouter, Query
from app.models import DigestResponse
from app.services import lyzr_agents

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Digest"])


@router.post("/digest", response_model=DigestResponse)
async def generate_digest(
    days: int = Query(7, ge=1, le=90, description="Days of history to analyze"),
):
    """
    Generate a weekly digest by running the PatternSynthesizer agent
    over recent decisions, tasks, and ideas.
    """
    logger.info(f"Generating digest for last {days} days")

    result = await lyzr_agents.run_pattern_synthesis(days=days)

    return DigestResponse(
        summary=result.get("summary", "No patterns found."),
        patterns_found=result.get("patterns_found", 0),
        patterns=result.get("patterns", []),
        period_days=days,
    )
