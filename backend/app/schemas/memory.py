from pydantic import BaseModel, Field
from typing import List, Optional, Any


class MemoryRecordResponse(BaseModel):
    id: int
    project_id: int
    project_name: str
    project_code: str
    finding_id: Optional[int] = None
    hindsight_memory_id: Optional[str] = None
    vulnerability_category: Optional[str] = None
    severity: Optional[str] = None
    sanitized_title: str
    sanitized_summary: str
    remediation_notes: Optional[str] = None
    retest_outcome: Optional[str] = None
    retained_by_email: str
    created_at: Optional[str] = None


class SimilarFindingItem(BaseModel):
    id: Optional[int] = None
    project_id: int
    project_name: str
    finding_id: Optional[int] = None
    finding_title: str
    vulnerability_category: str
    severity: str
    remediation_summary: str
    retest_status: str
    similarity_score: float
    explanation: str
    created_at: Optional[str] = None


class SimilarFindingsRequest(BaseModel):
    query: str
    target_project_id: Optional[int] = None
    limit: Optional[int] = 5


class MemoryChatRequest(BaseModel):
    question: str
    project_id: Optional[int] = None


class MemoryCitation(BaseModel):
    project_name: str
    finding_title: str
    severity: str
    retest_status: str
    remediation_summary: Optional[str] = None


class MemoryChatResponse(BaseModel):
    question: str
    answer: str
    has_relevant_memories: bool
    citations: List[MemoryCitation] = []


class RetainMemoryRequest(BaseModel):
    finding_id: int
    remediation_notes: Optional[str] = None
    retest_outcome: Optional[str] = None


class AnalystFeedbackRequest(BaseModel):
    finding_id: int
    suggested_memory_id: Optional[int] = None
    is_relevant: Optional[bool] = None
    remediation_action: Optional[str] = None  # ADOPTED, ADAPTED, REJECTED
    feedback_notes: Optional[str] = None


class RetestStatusUpdateRequest(BaseModel):
    retest_status: str  # PASSED, FAILED, PENDING, NOT_TESTED
    retest_notes: Optional[str] = None


class StepSimilarityCheckRequest(BaseModel):
    project_id: int
    finding_id: Optional[int] = None
    finding_title: str
    finding_description: Optional[str] = ""
    step_caption: Optional[str] = ""


class StepSimilarityCheckResponse(BaseModel):
    has_similarity: bool
    similar_count: int
    similar_memories: List[SimilarFindingItem] = []


class ContextChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ContextChatRequest(BaseModel):
    finding_title: str
    finding_description: Optional[str] = ""
    step_caption: Optional[str] = ""
    similar_memories: List[SimilarFindingItem] = []
    messages: List[ContextChatMessage] = []


class ContextChatResponse(BaseModel):
    answer: str
    references: List[MemoryCitation] = []


class FloatingChatRequest(BaseModel):
    question: str
    messages: List[ContextChatMessage] = []


class FloatingChatResponse(BaseModel):
    question: str
    answer: str
    has_past_memories: bool
    citations: List[MemoryCitation] = []
