"""
FounderOS — FastAPI Application
Main entrypoint with CORS, lifespan, and route registration.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import omi_webhook, query, timeline, digest, privacy
from app.services import qdrant_memory, lyzr_agents

# ── Logging ───────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-24s │ %(levelname)-7s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("founderos")


# ── Lifespan ──────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    logger.info("═" * 50)
    logger.info("  FounderOS — Starting up")
    logger.info("═" * 50)

    # Initialize Qdrant collections
    try:
        qdrant_memory.init_collections()
        logger.info("✓ Qdrant collections ready")
    except Exception as e:
        logger.error(f"✗ Qdrant initialization failed: {e}")
        logger.error("  Make sure Qdrant is running at the configured URL")

    # Initialize Lyzr agents
    settings = get_settings()
    if settings.lyzr_api_key:
        try:
            await lyzr_agents.init_agents()
            logger.info("✓ Lyzr agents initialized")
        except Exception as e:
            logger.error(f"✗ Lyzr agent initialization failed: {e}")
    else:
        logger.warning("⚠ LYZR_API_KEY not set — agents will not work")

    logger.info("═" * 50)
    logger.info("  FounderOS — Ready")
    logger.info("═" * 50)

    yield

    logger.info("FounderOS — Shutting down")


# ── App ───────────────────────────────────────
app = FastAPI(
    title="FounderOS",
    description="Voice-first AI Chief of Staff for solo founders",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────
settings = get_settings()
origins = [o.strip() for o in settings.cors_origins.split(",")]
logger.info(f"Configured CORS origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────
app.include_router(omi_webhook.router)
app.include_router(query.router)
app.include_router(timeline.router)
app.include_router(digest.router)
app.include_router(privacy.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "FounderOS",
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root redirect with API info."""
    return {
        "service": "FounderOS API",
        "docs": "/docs",
        "health": "/api/health",
    }
