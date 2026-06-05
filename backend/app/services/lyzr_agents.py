"""
FounderOS — Lyzr Agent Orchestration Service
Creates and manages the 4 specialized agents using Lyzr ADK.
"""

import json
import logging
import asyncio
from datetime import datetime
from app.config import get_settings
from app.services import qdrant_memory

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════
#  Agent System Prompts
# ═══════════════════════════════════════════════

DECISION_EXTRACTOR_PROMPT = """You are a decision extraction agent for a solo founder's voice transcripts.

Your job: Identify every DECISION made in the transcript. A decision is a clear choice, commitment, or direction the founder has stated.

For each decision found, output a JSON object in an array with these fields:
- "text": The decision statement (concise, 1-2 sentences)
- "domain": One of: product, hiring, pricing, tech, operations, marketing, fundraising, other
- "rationale": Why this decision was made (extract from context, or "not stated")
- "confidence": 0.0 to 1.0 — how clearly this was stated as a firm decision vs. just thinking out loud

Return ONLY a valid JSON object with key "decisions" containing an array. Example:
{"decisions": [{"text": "We're going web-only to ship faster", "domain": "product", "rationale": "Mobile would add 2 months to timeline", "confidence": 0.9}]}

If no decisions are found, return: {"decisions": []}"""

TASK_EXTRACTOR_PROMPT = """You are a task extraction agent for a solo founder's voice transcripts.

Your job: Identify every TASK, to-do, or action item mentioned. Include things the founder commits to doing, needs to do, or assigns.

For each task, output a JSON object in an array with these fields:
- "text": The task description (actionable, specific)
- "status": One of: pending, in_progress, blocked, done
- "blocked_by": What's blocking it (or empty string if not blocked)
- "owner": Usually "founder" unless delegated

Return ONLY a valid JSON object with key "tasks" containing an array. Example:
{"tasks": [{"text": "Send investor update email by Friday", "status": "pending", "blocked_by": "", "owner": "founder"}]}

If no tasks are found, return: {"tasks": []}"""

IDEA_EXTRACTOR_PROMPT = """You are an idea extraction agent for a solo founder's voice transcripts.

Your job: Identify every IDEA, hypothesis, open question, or creative thought. These are explorations, not firm decisions.

For each idea, output a JSON object in an array with these fields:
- "text": The idea or hypothesis (capture the essence)
- "theme": A short theme label (e.g., "distribution", "monetization", "product feature", "partnership")

Return ONLY a valid JSON object with key "ideas" containing an array. Example:
{"ideas": [{"text": "What if we offered a freemium tier to capture SMBs?", "theme": "monetization"}]}

If no ideas are found, return: {"ideas": []}"""

PATTERN_SYNTHESIZER_PROMPT = """You are a pattern recognition agent for a solo founder. You analyze their history of decisions, tasks, and ideas to find recurring themes, contradictions, and blockers.

Given the historical entries below, identify:
1. RECURRING BLOCKERS — things that keep coming up as obstacles
2. DECISION CONFLICTS — places where decisions contradict each other
3. EXECUTION THEMES — patterns in what the founder focuses on vs. avoids

For each pattern found, output a JSON object with:
- "pattern_description": Clear description of the pattern
- "frequency": How many times this pattern appears in the data
- "evidence": Brief quotes or references from the entries

Return ONLY a valid JSON object with key "patterns" containing an array.
If no patterns are found, return: {"patterns": []}"""

SYNTHESIS_AGENT_PROMPT = """You are the founder's AI Chief of Staff. You have perfect memory of everything they've said, decided, and planned.

Given the context below from their history, answer their question conversationally. Follow these rules:
1. Be specific — cite dates and reference actual decisions when possible
2. Connect dots between related items across different categories
3. If you notice contradictions or recurring themes, point them out helpfully
4. Speak like a trusted advisor, not a search engine
5. If the context doesn't contain enough to answer, say so honestly

CONTEXT FROM FOUNDER'S HISTORY:
{context}

Answer the founder's question based on this context."""


# ═══════════════════════════════════════════════
#  Agent Management (Lyzr ADK)
# ═══════════════════════════════════════════════

# Cache for created agent IDs
_agent_ids: dict[str, str] = {}


async def _create_agent(name: str, system_prompt: str) -> str:
    """Create a Lyzr agent and return its agent_id."""
    import httpx
    settings = get_settings()

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await client.post(
                "https://agent-prod.studio.lyzr.ai/v3/agents/",
                headers={
                    "x-api-key": settings.lyzr_api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "name": name,
                    "system_prompt": system_prompt,
                    "agent_description": f"FounderOS {name} agent",
                    "provider_id": "openai",
                    "model": settings.lyzr_model,
                    "top_p": 1.0,
                    "temperature": 0.7,
                },
            )
            response.raise_for_status()
            data = response.json()
            # The v3 API returns the created agent info
            agent_id = data.get("agent_id", data.get("id", ""))
            if not agent_id and isinstance(data, dict):
                # Check for alternative keys
                agent_id = data.get("_id", "")
            logger.info(f"Created Lyzr agent '{name}': {agent_id}")
            return agent_id
        except httpx.HTTPStatusError as e:
            logger.error(f"Lyzr Agent Creation HTTP Error: {e.response.status_code} - {e.response.text}")
            raise e


async def _chat_with_agent(agent_id: str, message: str) -> str:
    """Send a message to a Lyzr agent and get the response."""
    import httpx
    settings = get_settings()

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            "https://agent-prod.studio.lyzr.ai/v3/inference/chat/",
            headers={
                "x-api-key": settings.lyzr_api_key,
                "Content-Type": "application/json",
            },
            json={
                "agent_id": agent_id,
                "message": message,
                "user_id": "founder",
                "session_id": f"session_{datetime.utcnow().strftime('%Y%m%d')}",
            },
        )
        response.raise_for_status()
        data = response.json()
        return data.get("response", data.get("message", "{}"))


async def init_agents():
    """Create all 4 agents on startup."""
    global _agent_ids

    agents_to_create = {
        "DecisionExtractor": DECISION_EXTRACTOR_PROMPT,
        "TaskExtractor": TASK_EXTRACTOR_PROMPT,
        "IdeaExtractor": IDEA_EXTRACTOR_PROMPT,
        "PatternSynthesizer": PATTERN_SYNTHESIZER_PROMPT,
        "SynthesisAgent": SYNTHESIS_AGENT_PROMPT.replace("{context}", "{{context}}"),
    }

    for name, prompt in agents_to_create.items():
        try:
            agent_id = await _create_agent(name, prompt)
            _agent_ids[name] = agent_id
        except Exception as e:
            logger.error(f"Failed to create agent '{name}': {e}")
            _agent_ids[name] = ""

    logger.info(f"Initialized {len(_agent_ids)} Lyzr agents")


def _parse_json_response(response: str, key: str) -> list[dict]:
    """Safely parse JSON from agent response, extracting the array by key."""
    try:
        # Try direct JSON parse
        data = json.loads(response)
        if isinstance(data, dict):
            if key in data:
                return data[key]
            # Fallback: return first list found
            for k, v in data.items():
                if isinstance(v, list):
                    return v
        if isinstance(data, list):
            return data
    except json.JSONDecodeError:
        pass

    # Try to find JSON in the response text
    try:
        start = response.find("[")
        if start == -1 or (response.find("{") != -1 and response.find("{") < start):
            start = response.find("{")
        
        end = max(response.rfind("]"), response.rfind("}")) + 1
        if start >= 0 and end > start:
            data = json.loads(response[start:end])
            if isinstance(data, dict):
                if key in data:
                    return data[key]
                for k, v in data.items():
                    if isinstance(v, list):
                        return v
            if isinstance(data, list):
                return data
    except (json.JSONDecodeError, ValueError):
        pass

    logger.warning(f"Could not parse JSON for key '{key}' from response: {response[:200]}")
    return []


# ═══════════════════════════════════════════════
#  Pipeline Execution
# ═══════════════════════════════════════════════

async def process_transcript(transcript: str, transcript_id: str = "") -> dict:
    """
    Run the full extraction pipeline on a transcript.
    Sends to DecisionExtractor, TaskExtractor, and IdeaExtractor in parallel.
    Returns counts of extracted items.
    """
    if not transcript.strip():
        return {"decisions": 0, "tasks": 0, "ideas": 0}

    now = datetime.utcnow().isoformat()

    # Run all 3 extractors in parallel
    results = await asyncio.gather(
        _run_extractor("DecisionExtractor", transcript, "decisions"),
        _run_extractor("TaskExtractor", transcript, "tasks"),
        _run_extractor("IdeaExtractor", transcript, "ideas"),
        return_exceptions=True,
    )

    counts = {"decisions": 0, "tasks": 0, "ideas": 0}

    # Process decisions
    if not isinstance(results[0], Exception) and results[0]:
        entries = []
        for d in results[0]:
            if not isinstance(d, dict):
                continue
            text = d.get("text") or d.get("decision") or d.get("statement") or ""
            rationale = d.get("rationale") or d.get("reason") or d.get("why") or ""
            domain = d.get("domain") or d.get("category") or "other"
            try:
                confidence = float(d.get("confidence", 0.8))
            except (ValueError, TypeError):
                confidence = 0.8
            if text:
                entries.append({
                    "text": text,
                    "domain": domain,
                    "rationale": rationale,
                    "confidence": confidence,
                    "date": now,
                    "linked_idea_ids": [],
                    "transcript_id": transcript_id,
                    "entry_type": "decision",
                })
        if entries:
            qdrant_memory.upsert_entries("decisions", entries)
            counts["decisions"] = len(entries)

    # Process tasks
    if not isinstance(results[1], Exception) and results[1]:
        entries = []
        for t in results[1]:
            if not isinstance(t, dict):
                continue
            text = t.get("text") or t.get("task") or t.get("description") or t.get("action_item") or ""
            status = t.get("status") or "pending"
            blocked_by = t.get("blocked_by") or ""
            owner = t.get("owner") or "founder"
            if text:
                entries.append({
                    "text": text,
                    "status": status,
                    "blocked_by": blocked_by,
                    "owner": owner,
                    "created_at": now,
                    "transcript_id": transcript_id,
                    "entry_type": "task",
                })
        if entries:
            qdrant_memory.upsert_entries("tasks", entries)
            counts["tasks"] = len(entries)

    # Process ideas
    if not isinstance(results[2], Exception) and results[2]:
        entries = []
        for i in results[2]:
            if not isinstance(i, dict):
                continue
            text = i.get("text") or i.get("idea") or i.get("concept") or i.get("thought") or ""
            theme = i.get("theme") or i.get("category") or ""
            if text:
                entries.append({
                    "text": text,
                    "theme": theme,
                    "referenced_decisions": [],
                    "date": now,
                    "transcript_id": transcript_id,
                    "entry_type": "idea",
                })
        if entries:
            qdrant_memory.upsert_entries("ideas", entries)
            counts["ideas"] = len(entries)

    logger.info(f"Pipeline complete: {counts}")
    return counts


async def _run_extractor(agent_name: str, transcript: str, key: str) -> list[dict]:
    """Run a single extraction agent on a transcript."""
    agent_id = _agent_ids.get(agent_name, "")
    if not agent_id:
        logger.error(f"Agent '{agent_name}' not initialized")
        return []

    # Reinforce JSON instructions in the inference message
    prompt = f"""[TRANSCRIPT]
{transcript}
[/TRANSCRIPT]

Please extract the {key} from the transcript above and format them as the JSON object specified in your system prompt.
Return ONLY valid JSON. No markdown code block wraps (like ```json), no conversational chatter, and no explanatory text."""

    try:
        response = await _chat_with_agent(agent_id, prompt)
        return _parse_json_response(response, key)
    except Exception as e:
        logger.error(f"Extractor '{agent_name}' failed: {e}")
        return []


async def synthesize_answer(question: str, context_entries: list[dict]) -> str:
    """Use the SynthesisAgent to answer a question given context."""
    agent_id = _agent_ids.get("SynthesisAgent", "")
    if not agent_id:
        return "I'm not fully initialized yet. Please try again in a moment."

    # Build context string from search results
    context_parts = []
    for entry in context_entries:
        entry_type = entry.get("entry_type", "entry")
        text = entry.get("text", "")
        date = entry.get("date", "")
        meta = entry.get("metadata", {})

        if entry_type == "decision":
            domain = meta.get("domain", "")
            context_parts.append(f"[DECISION — {domain}] ({date}): {text}")
        elif entry_type == "task":
            status = meta.get("status", "")
            context_parts.append(f"[TASK — {status}] ({date}): {text}")
        elif entry_type == "idea":
            theme = meta.get("theme", "")
            context_parts.append(f"[IDEA — {theme}] ({date}): {text}")
        elif entry_type == "pattern":
            context_parts.append(f"[PATTERN]: {text}")
        else:
            context_parts.append(f"[{entry_type.upper()}] ({date}): {text}")

    context_str = "\n".join(context_parts) if context_parts else "No relevant history found."

    prompt = f"""CONTEXT FROM FOUNDER'S HISTORY:
{context_str}

FOUNDER'S QUESTION: {question}

Answer based on the context above. Be specific, cite dates, and connect related items."""

    try:
        response = await _chat_with_agent(agent_id, prompt)
        return response
    except Exception as e:
        logger.error(f"Synthesis failed: {e}")
        return "I had trouble processing that question. Please try again."


async def run_pattern_synthesis(days: int = 7) -> dict:
    """Run the PatternSynthesizer agent on recent history."""
    agent_id = _agent_ids.get("PatternSynthesizer", "")
    if not agent_id:
        return {"summary": "Pattern agent not initialized", "patterns": []}

    # Fetch all recent entries
    entries = qdrant_memory.get_all_entries_for_digest(days=days)

    if not entries:
        return {"summary": "No entries found for analysis.", "patterns": []}

    # Build input for pattern agent
    entry_lines = []
    for e in entries:
        entry_type = e.get("entry_type", "")
        text = e.get("text", "")
        date = e.get("date", "")
        meta = e.get("metadata", {})
        extra = ""
        if entry_type == "decision":
            extra = f" (domain: {meta.get('domain', '')})"
        elif entry_type == "task":
            extra = f" (status: {meta.get('status', '')}, blocked_by: {meta.get('blocked_by', '')})"
        entry_lines.append(f"[{entry_type.upper()}] ({date}){extra}: {text}")

    entries_text = "\n".join(entry_lines)
    prompt = f"Analyze these {len(entries)} entries from the last {days} days:\n\n{entries_text}"

    try:
        response = await _chat_with_agent(agent_id, prompt)
        patterns = _parse_json_response(response, "patterns")

        # Upsert discovered patterns into Qdrant
        now = datetime.utcnow().isoformat()
        pattern_entries = []
        for p in patterns:
            pattern_entries.append({
                "text": p.get("pattern_description", p.get("text", "")),
                "pattern_description": p.get("pattern_description", ""),
                "frequency": p.get("frequency", 1),
                "first_seen": now,
                "last_seen": now,
                "related_ids": [],
                "entry_type": "pattern",
            })

        if pattern_entries:
            qdrant_memory.upsert_entries("patterns", pattern_entries)

        # Build summary
        summary_parts = [f"Found {len(patterns)} patterns across {len(entries)} entries:"]
        for p in patterns:
            desc = p.get("pattern_description", "")
            freq = p.get("frequency", "")
            summary_parts.append(f"• {desc} (frequency: {freq})")

        return {
            "summary": "\n".join(summary_parts),
            "patterns": patterns,
            "patterns_found": len(patterns),
            "entries_analyzed": len(entries),
        }
    except Exception as e:
        logger.error(f"Pattern synthesis failed: {e}")
        return {"summary": f"Analysis failed: {str(e)}", "patterns": []}
