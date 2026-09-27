from app.database.base import Base

# Import ALL models so SQLAlchemy registers them

from app.models.user import User
from app.models.project import Project
from app.models.master_vulnerability import MasterVulnerability
from app.models.project_finding import ProjectFinding
from app.models.finding_evidence import FindingEvidence
from app.models.security_memory import SecurityMemory, AnalystFeedback