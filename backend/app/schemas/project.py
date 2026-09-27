from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.core.project_status import ProjectStatus
from app.core.project_type import ProjectType


class ProjectBase(BaseModel):
    project_name: str
    client_name: str
    application_name: str
    application_url: Optional[str] = None
    ip_address: Optional[str] = None
    operating_system: Optional[str] = None
    language: Optional[str] = None
    web_server: Optional[str] = None
    ports_scanned: Optional[str] = None
    project_type: ProjectType
    description: Optional[str] = None
    scope: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    status: ProjectStatus = ProjectStatus.DRAFT
    assigned_to: Optional[int] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    client_name: Optional[str] = None
    application_name: Optional[str] = None
    application_url: Optional[str] = None
    ip_address: Optional[str] = None
    operating_system: Optional[str] = None
    language: Optional[str] = None
    web_server: Optional[str] = None
    ports_scanned: Optional[str] = None
    project_type: Optional[ProjectType] = None
    description: Optional[str] = None
    scope: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[ProjectStatus] = None
    assigned_to: Optional[int] = None


class ProjectResponse(ProjectBase):
    id: int
    project_code: str
    created_by: int
    created_at: datetime
    updated_at: datetime
    report_generated_at: Optional[datetime] = None
    assigned_user_name: Optional[str] = None
    assigned_user_email: Optional[str] = None
    created_by_name: Optional[str] = None

    class Config:
        from_attributes = True
