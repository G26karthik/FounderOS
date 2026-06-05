"""
FounderOS — Application Configuration
Loads all settings from environment variables / .env file.
"""

import os
from pydantic_settings import BaseSettings
from functools import lru_cache
from dotenv import load_dotenv

# Force load .env with override
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"), override=True)


class Settings(BaseSettings):
    """Central configuration loaded from .env"""

    # ── Lyzr Agent Orchestration ───────────────
    lyzr_api_key: str = ""
    lyzr_model: str = "gpt-4o-mini"

    # ── Qdrant Vector Memory ──────────────────
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""

    # ── OpenAI Embeddings ─────────────────────
    openai_api_key: str = ""

    # ── Omi Voice Integration ─────────────────
    omi_webhook_secret: str = ""

    # ── EnkryptAI Guardrails (optional) ───────
    enkrypt_api_key: str = ""

    # ── Application ───────────────────────────
    cors_origins: str = "http://localhost:5173"
    log_level: str = "info"

    # ── Collection names ──────────────────────
    @property
    def collection_names(self) -> dict[str, str]:
        return {
            "decisions": "decisions",
            "tasks": "tasks",
            "ideas": "ideas",
            "patterns": "patterns",
        }

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
