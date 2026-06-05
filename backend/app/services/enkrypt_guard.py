"""
FounderOS — EnkryptAI Guardrails (Optional)
Wraps storage and retrieval with safety checks when configured.
Gracefully no-ops if ENKRYPT_API_KEY is not set.
"""

import logging
import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)


def is_enabled() -> bool:
    """Check if EnkryptAI guardrails are configured."""
    return bool(get_settings().enkrypt_api_key)


async def check_content_safety(text: str) -> dict:
    """
    Check text content for safety issues (PII, toxicity, etc).
    Returns: {"safe": bool, "issues": list[str], "filtered_text": str}
    """
    if not is_enabled():
        return {"safe": True, "issues": [], "filtered_text": text}

    settings = get_settings()

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.enkryptai.com/v1/guardrails/check",
                headers={
                    "Authorization": f"Bearer {settings.enkrypt_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "checks": ["pii", "toxicity", "prompt_injection"],
                },
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "safe": data.get("safe", True),
                    "issues": data.get("issues", []),
                    "filtered_text": data.get("filtered_text", text),
                }
    except Exception as e:
        logger.warning(f"EnkryptAI check failed (proceeding without): {e}")

    # Default: pass through if API fails
    return {"safe": True, "issues": [], "filtered_text": text}


async def validate_output(text: str) -> dict:
    """
    Validate agent output before returning to user.
    Checks for hallucination markers and inappropriate content.
    """
    if not is_enabled():
        return {"valid": True, "issues": [], "text": text}

    settings = get_settings()

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.enkryptai.com/v1/guardrails/validate",
                headers={
                    "Authorization": f"Bearer {settings.enkrypt_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "checks": ["toxicity", "hallucination"],
                },
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "valid": data.get("valid", True),
                    "issues": data.get("issues", []),
                    "text": data.get("text", text),
                }
    except Exception as e:
        logger.warning(f"EnkryptAI validation failed (proceeding without): {e}")

    return {"valid": True, "issues": [], "text": text}
