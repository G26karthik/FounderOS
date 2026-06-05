"""
FounderOS — Pydantic Models
Data schemas for Omi webhooks, Qdrant payloads, API requests/responses.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


# ═══════════════════════════════════════════════
#  Enums
# ═══════════════════════════════════════════════

class EntryType(str, Enum):
    DECISION = "decision"
    TASK = "task"
    IDEA = "idea"
    PATTERN = "pattern"


class Domain(str, Enum):
    PRODUCT = "product"
    HIRING = "hiring"
    PRICING = "pricing"
    TECH = "tech"
    OPERATIONS = "operations"
    MARKETING = "marketing"
    FUNDRAISING = "fundraising"
    OTHER = "other"


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    DONE = "done"


# ═══════════════════════════════════════════════
#  Omi Webhook Payload
# ═══════════════════════════════════════════════

class TranscriptSegment(BaseModel):
    """Single segment of an Omi transcript."""
    text: str
    speaker: str = "SPEAKER_00"
    is_user: bool = True
    start: float = 0.0
    end: float = 0.0


class OmiStructured(BaseModel):
    """Omi's AI-generated conversation summary."""
    title: Optional[str] = None
    overview: Optional[str] = None
    emoji: Optional[str] = None
    category: Optional[str] = None
    action_items: list[dict] = Field(default_factory=list)
    events: list[dict] = Field(default_factory=list)


class OmiWebhookPayload(BaseModel):
    """
    Payload sent by Omi when a conversation completes.
    See: https://docs.omi.me/doc/developer/apps/Integrations
    """
    id: str = ""
    created_at: str = ""
    transcript_segments: list[TranscriptSegment] = Field(default_factory=list)
    structured: Optional[OmiStructured] = None
    source: str = "omi"
    language: Optional[str] = "en"

    @property
    def full_transcript(self) -> str:
        """Combine all transcript segments into a single string."""
        return " ".join(seg.text for seg in self.transcript_segments if seg.text.strip())


# ═══════════════════════════════════════════════
#  Qdrant Entry Payloads
# ═══════════════════════════════════════════════

class Decision(BaseModel):
    """Extracted decision from a founder transcript."""
    text: str
    domain: str = "other"
    rationale: str = ""
    confidence: float = 0.8
    date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    linked_idea_ids: list[str] = Field(default_factory=list)
    transcript_id: str = ""
    entry_type: str = "decision"


class Task(BaseModel):
    """Extracted task from a founder transcript."""
    text: str
    status: str = "pending"
    blocked_by: str = ""
    owner: str = "founder"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    transcript_id: str = ""
    entry_type: str = "task"


class Idea(BaseModel):
    """Extracted idea from a founder transcript."""
    text: str
    theme: str = ""
    referenced_decisions: list[str] = Field(default_factory=list)
    date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    transcript_id: str = ""
    entry_type: str = "idea"


class Pattern(BaseModel):
    """Synthesized pattern across multiple entries."""
    pattern_description: str
    frequency: int = 1
    first_seen: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    last_seen: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    related_ids: list[str] = Field(default_factory=list)
    entry_type: str = "pattern"


# ═══════════════════════════════════════════════
#  API Request / Response Models
# ═══════════════════════════════════════════════

class QueryRequest(BaseModel):
    """User question for semantic Q&A."""
    question: str
    filters: Optional[dict] = None


class SourceReference(BaseModel):
    """A single source referenced in a Q&A answer."""
    collection: str
    text: str
    score: float
    date: Optional[str] = None
    entry_type: Optional[str] = None


class QueryResponse(BaseModel):
    """Response from the Q&A endpoint."""
    answer: str
    sources: list[SourceReference] = Field(default_factory=list)
    confidence: float = 0.0


class DigestResponse(BaseModel):
    """Response from the weekly digest endpoint."""
    summary: str
    patterns_found: int = 0
    patterns: list[dict] = Field(default_factory=list)
    period_days: int = 7


class CollectionInfo(BaseModel):
    """Info about a Qdrant collection."""
    name: str
    count: int = 0


class TimelineEntry(BaseModel):
    """A single entry in the timeline view."""
    id: str
    entry_type: str
    text: str
    date: str
    metadata: dict = Field(default_factory=dict)
