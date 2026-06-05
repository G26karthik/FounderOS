"""
FounderOS — Query Router
Voice Q&A endpoint: semantic search + Lyzr synthesis agent.
"""

import logging
from fastapi import APIRouter
from app.models import QueryRequest, QueryResponse, SourceReference
from app.services import qdrant_memory, lyzr_agents, enkrypt_guard

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Query"])


@router.post("/query", response_model=QueryResponse)
async def query_memory(request: QueryRequest):
    """
    Answer a founder's question by searching semantic memory
    and synthesizing an answer via the Lyzr synthesis agent.
    """
    question = request.question.strip()
    if not question:
        return QueryResponse(answer="Please ask a question.", sources=[], confidence=0.0)

    logger.info(f"Query received: '{question[:80]}...'")

    # Step 1: Semantic search across all collections
    search_results = qdrant_memory.semantic_search(
        query=question,
        collections=None,  # Search all
        limit=8,
        score_threshold=0.25,
    )

    if not search_results:
        return QueryResponse(
            answer="I don't have enough context in your history to answer that yet. "
                   "Keep logging your thoughts and decisions, and I'll build up the picture.",
            sources=[],
            confidence=0.1,
        )

    # Step 2: Synthesize answer using Lyzr agent
    answer = await lyzr_agents.synthesize_answer(question, search_results)

    # Step 3: Optional output validation
    validation = await enkrypt_guard.validate_output(answer)
    if not validation["valid"]:
        logger.warning(f"Output validation issues: {validation['issues']}")

    # Step 4: Build source references
    sources = []
    for result in search_results[:5]:  # Top 5 sources
        sources.append(SourceReference(
            collection=result["collection"],
            text=result["text"][:200],
            score=round(result["score"], 3),
            date=result.get("date", ""),
            entry_type=result.get("entry_type", ""),
        ))

    avg_score = sum(r["score"] for r in search_results) / len(search_results) if search_results else 0

    return QueryResponse(
        answer=answer,
        sources=sources,
        confidence=round(avg_score, 2),
    )
