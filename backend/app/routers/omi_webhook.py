"""
FounderOS — Omi Webhook Router
Receives voice transcripts from the Omi device/app via webhook.
"""

import logging
from fastapi import APIRouter, BackgroundTasks, Request
from app.models import OmiWebhookPayload
from app.services import lyzr_agents, enkrypt_guard

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/omi", tags=["Omi"])


@router.post("/webhook")
async def omi_webhook(payload: OmiWebhookPayload, background_tasks: BackgroundTasks):
    """
    Receive a conversation webhook from Omi.
    Processes the transcript through the Lyzr agent pipeline asynchronously.
    Returns 200 immediately so Omi doesn't timeout.
    """
    transcript = payload.full_transcript

    if not transcript.strip():
        logger.info(f"Empty transcript received from Omi (id={payload.id})")
        return {"status": "skipped", "reason": "empty_transcript"}

    logger.info(
        f"Omi webhook received: id={payload.id}, "
        f"segments={len(payload.transcript_segments)}, "
        f"chars={len(transcript)}"
    )

    # Process in background so we return 200 quickly
    background_tasks.add_task(_process_omi_transcript, transcript, payload.id)

    return {
        "status": "accepted",
        "transcript_id": payload.id,
        "transcript_length": len(transcript),
    }


@router.post("/webhook/test")
async def omi_webhook_test(request: Request):
    """
    Test endpoint that accepts any JSON body — useful for debugging
    the Omi webhook payload format without strict validation.
    """
    body = await request.json()
    logger.info(f"Omi test webhook received: {list(body.keys())}")
    return {"status": "received", "keys": list(body.keys())}


async def _process_omi_transcript(transcript: str, transcript_id: str):
    """Background task to process a transcript through the agent pipeline."""
    try:
        # Optional: EnkryptAI safety check on input
        safety = await enkrypt_guard.check_content_safety(transcript)
        if not safety["safe"]:
            logger.warning(f"Safety issues in transcript {transcript_id}: {safety['issues']}")
            transcript = safety["filtered_text"]

        # Run the extraction pipeline
        counts = await lyzr_agents.process_transcript(transcript, transcript_id)
        logger.info(f"Processed transcript {transcript_id}: {counts}")

    except Exception as e:
        logger.error(f"Failed to process transcript {transcript_id}: {e}")
