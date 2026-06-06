import os
import sys
import logging
from dotenv import load_dotenv

# Load env with override
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_apis")

from app.config import get_settings
from app.services import embeddings, qdrant_memory

def test_qdrant():
    logger.info("Testing Qdrant connection...")
    try:
        qdrant_memory.init_collections()
        info = qdrant_memory.get_collection_info()
        logger.info(f"Qdrant Collections Info: {info}")
        return True
    except Exception as e:
        logger.error(f"Qdrant test failed: {e}", exc_info=True)
        return False

def test_openai():
    logger.info("Testing OpenAI embedding...")
    try:
        emb = embeddings.get_embedding("Hello from FounderOS test script")
        logger.info(f"OpenAI embedding generated. Vector length: {len(emb)}")
        return len(emb) == embeddings.EMBEDDING_DIM
    except Exception as e:
        logger.error(f"OpenAI test failed: {e}", exc_info=True)
        return False

async def test_lyzr():
    logger.info("Testing Lyzr agents...")
    from app.services import lyzr_agents
    try:
        await lyzr_agents.init_agents()
        logger.info(f"Lyzr agents initialized: {lyzr_agents._agent_ids}")
        # Test basic synthesis
        transcript = "I decided today that we will build our app in React. It's much faster to prototype."
        res = await lyzr_agents.process_transcript(transcript)
        logger.info(f"Transcript processing result: {res}")
        return True
    except Exception as e:
        logger.error(f"Lyzr test failed: {e}", exc_info=True)
        return False

if __name__ == "__main__":
    import asyncio
    
    settings = get_settings()
    logger.info(f"Settings loaded. QDRANT_URL={settings.qdrant_url}")
    
    q_ok = test_qdrant()
    o_ok = test_openai()
    
    if q_ok and o_ok:
        logger.info("Basic services OK. Running Lyzr test...")
        asyncio.run(test_lyzr())
    else:
        logger.error("Skipping Lyzr test since basic services failed.")
