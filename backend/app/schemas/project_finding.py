from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel

from app.core.finding_status import FindingStatus
from app.schemas.finding_evidence import FindingEvidenceResponse


class PreviewMasterRequest(BaseModel):
    master_vulnerability_id: int


class ProjectFindingPreviewResponse(BaseModel):
    master_vulnerability_id: int

    title: str

    description: Optional[str] = None

    impact: Optional[str] = None

    recommendation: Optional[str] = None

    solution: Optional[str] = None

    severity: Optional[str] = None

    cvss_score: Optional[Decimal] = None

    cvss_vector: Optional[str] = None

    cwe: Optional[str] = None

    owasp: Optional[str] = None

    references: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectFindingFromMasterCreate(BaseModel):
    project_id: int

    master_vulnerability_id: int

    title: Optional[str] = None

    description: Optional[str] = None

    impact: Optional[str] = None

    recommendation: Optional[str] = None

    solution: Optional[str] = None

    severity: Optional[str] = None

    cvss_score: Optional[Decimal] = None

    cvss_vector: Optional[str] = None

    cwe: Optional[str] = None

    owasp: Optional[str] = None

    references: Optional[str] = None


class ProjectFindingCustomCreate(BaseModel):
    project_id: int

    title: str

    description: Optional[str] = None

    impact: Optional[str] = None

    recommendation: Optional[str] = None

    solution: Optional[str] = None

    severity: Optional[str] = None

    cvss_score: Optional[Decimal] = None

    cvss_vector: Optional[str] = None

    cwe: Optional[str] = None

    owasp: Optional[str] = None

    references: Optional[str] = None


class ProjectFindingUpdate(BaseModel):
    title: Optional[str] = None

    description: Optional[str] = None

    impact: Optional[str] = None

    recommendation: Optional[str] = None

    solution: Optional[str] = None

    severity: Optional[str] = None

    cvss_score: Optional[Decimal] = None

    cvss_vector: Optional[str] = None

    cwe: Optional[str] = None

    owasp: Optional[str] = None

    references: Optional[str] = None

    status: Optional[FindingStatus] = None

    retest_status: Optional[str] = None

    retest_notes: Optional[str] = None


class ProjectFindingResponse(BaseModel):
    id: int

    project_id: int

    master_vulnerability_id: Optional[int] = None

    is_custom: bool

    title: str

    description: Optional[str] = None

    impact: Optional[str] = None

    recommendation: Optional[str] = None

    solution: Optional[str] = None

    severity: Optional[str] = None

    cvss_score: Optional[Decimal] = None

    cvss_vector: Optional[str] = None

    cwe: Optional[str] = None

    owasp: Optional[str] = None

    references: Optional[str] = None

    status: FindingStatus

    retest_status: Optional[str] = "NOT_TESTED"

    retest_notes: Optional[str] = None

    retested_at: Optional[datetime] = None

    retested_by: Optional[int] = None

    created_by: int

    created_at: datetime

    updated_at: datetime

    evidences: List[FindingEvidenceResponse] = []

    class Config:
        from_attributes = True
