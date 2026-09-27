from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FindingEvidenceBase(BaseModel):
    finding_id: int
    display_order: int = 1
    case_label: str = "Case 1"

    screenshot_path: Optional[str] = None
    original_filename: Optional[str] = None
    caption: Optional[str] = None

    action_performed: Optional[str] = None
    expected_result: Optional[str] = None

    ai_generated: bool = False


class FindingEvidenceCreate(FindingEvidenceBase):
    pass


class FindingEvidenceUpdate(BaseModel):
    display_order: Optional[int] = None
    case_label: Optional[str] = None

    screenshot_path: Optional[str] = None
    original_filename: Optional[str] = None
    caption: Optional[str] = None

    action_performed: Optional[str] = None
    expected_result: Optional[str] = None

    ai_generated: Optional[bool] = None


class FindingEvidenceResponse(FindingEvidenceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
