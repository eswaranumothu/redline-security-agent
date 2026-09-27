from sqlalchemy.orm import Session

from app.core.finding_status import FindingStatus
from app.core.roles import UserRole
from app.exceptions.project_finding_exceptions import (
    InvalidFindingException,
    MasterVulnerabilityNotFoundException,
    ProjectFindingNotFoundException,
)
from app.models.project_finding import ProjectFinding
from app.models.user import User
from app.repositories.master_vulnerability_repository import (
    MasterVulnerabilityRepository,
)
from app.repositories.project_finding_repository import (
    ProjectFindingRepository,
)
from app.schemas.project_finding import (
    ProjectFindingCustomCreate,
    ProjectFindingFromMasterCreate,
    ProjectFindingPreviewResponse,
    ProjectFindingUpdate,
)
from app.services.project_service import ProjectService
from app.services.memory_service import memory_service


class ProjectFindingService:

    @staticmethod
    def preview_master(
        db: Session,
        master_vulnerability_id: int,
    ):
        master = MasterVulnerabilityRepository.get_by_id(
            db,
            master_vulnerability_id,
        )

        if not master:
            raise MasterVulnerabilityNotFoundException(
                "Master vulnerability not found."
            )

        return ProjectFindingPreviewResponse(
            master_vulnerability_id=master.id,
            title=master.title,
            description=master.description,
            impact=master.impact,
            recommendation=master.recommendation,
            solution=master.solution,
            severity=master.severity,
            cvss_score=master.cvss_score,
            cvss_vector=master.cvss_vector,
            cwe=master.cwe,
            owasp=master.owasp,
            references=master.references,
        )

    @staticmethod
    def create_from_master(
        db: Session,
        request: ProjectFindingFromMasterCreate,
        current_user: User,
    ):
        # Verify project exists and user has access
        project = ProjectService.ensure_project_access(
            db,
            request.project_id,
            current_user,
        )

        master = MasterVulnerabilityRepository.get_by_id(
            db,
            request.master_vulnerability_id,
        )

        if not master:
            raise MasterVulnerabilityNotFoundException(
                "Master vulnerability not found."
            )

        title = request.title if request.title is not None else master.title

        if ProjectFindingRepository.exists_by_title(
            db, request.project_id, title
        ):
            raise InvalidFindingException(
                f'A finding titled "{title}" already exists in this project.'
            )

        finding = ProjectFinding(
            project_id=request.project_id,
            master_vulnerability_id=master.id,
            is_custom=False,

            title=title,
            description=request.description if request.description is not None else master.description,
            impact=request.impact if request.impact is not None else master.impact,
            recommendation=request.recommendation if request.recommendation is not None else master.recommendation,
            solution=request.solution if request.solution is not None else master.solution,
            severity=request.severity if request.severity is not None else master.severity,
            cvss_score=request.cvss_score if request.cvss_score is not None else master.cvss_score,
            cvss_vector=request.cvss_vector if request.cvss_vector is not None else master.cvss_vector,
            cwe=request.cwe if request.cwe is not None else master.cwe,
            owasp=request.owasp if request.owasp is not None else master.owasp,
            references=request.references if request.references is not None else master.references,

            status=FindingStatus.OPEN.value,
            created_by=current_user.id,
        )

        created = ProjectFindingRepository.create(
            db,
            finding,
        )

        memory_service.auto_retain_finding_sync(db, current_user, created)

        # Reload with evidences
        return ProjectFindingRepository.get_by_id(
            db,
            created.id,
        )

    @staticmethod
    def create_custom(
        db: Session,
        request: ProjectFindingCustomCreate,
        current_user: User,
    ):
        # Verify project exists and user has access
        ProjectService.ensure_project_access(
            db,
            request.project_id,
            current_user,
        )

        if ProjectFindingRepository.exists_by_title(
            db, request.project_id, request.title
        ):
            raise InvalidFindingException(
                f'A finding titled "{request.title}" already exists in this project.'
            )

        finding = ProjectFinding(
            project_id=request.project_id,
            master_vulnerability_id=None,
            is_custom=True,

            title=request.title,
            description=request.description,
            impact=request.impact,
            recommendation=request.recommendation,
            solution=request.solution,
            severity=request.severity,
            cvss_score=request.cvss_score,
            cvss_vector=request.cvss_vector,
            cwe=request.cwe,
            owasp=request.owasp,
            references=request.references,

            status=FindingStatus.OPEN.value,
            created_by=current_user.id,
        )

        created = ProjectFindingRepository.create(
            db,
            finding,
        )

        memory_service.auto_retain_finding_sync(db, current_user, created)

        # Reload with evidences
        return ProjectFindingRepository.get_by_id(
            db,
            created.id,
        )

    @staticmethod
    def list_by_project(
        db: Session,
        project_id: int,
        current_user: User,
    ):
        # Verify project exists and user has access
        ProjectService.ensure_project_access(
            db,
            project_id,
            current_user,
        )

        return ProjectFindingRepository.list_by_project(
            db,
            project_id,
        )

    @staticmethod
    def get_by_id(
        db: Session,
        finding_id: int,
        current_user: User,
    ):
        finding = ProjectFindingRepository.get_by_id(
            db,
            finding_id,
        )

        if not finding:
            raise ProjectFindingNotFoundException(
                "Finding not found."
            )

        # Verify user has access to the parent project
        ProjectService.ensure_project_access(
            db,
            finding.project_id,
            current_user,
        )

        return finding

    @staticmethod
    def update(
        db: Session,
        finding_id: int,
        request: ProjectFindingUpdate,
        current_user: User,
    ):
        finding = ProjectFindingRepository.get_by_id(
            db,
            finding_id,
        )

        if not finding:
            raise ProjectFindingNotFoundException(
                "Finding not found."
            )

        # Verify user has access to the parent project
        ProjectService.ensure_project_access(
            db,
            finding.project_id,
            current_user,
        )

        update_data = request.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            if isinstance(value, FindingStatus):
                setattr(finding, field, value.value)
            else:
                setattr(finding, field, value)

        if "retest_status" in update_data:
            from datetime import datetime, timezone
            finding.retested_at = datetime.now(timezone.utc)
            finding.retested_by = current_user.id

        updated = ProjectFindingRepository.update(
            db,
            finding,
        )

        memory_service.auto_retain_finding_sync(db, current_user, updated)
        return updated

    @staticmethod
    def delete(
        db: Session,
        finding_id: int,
        current_user: User,
    ):
        finding = ProjectFindingRepository.get_by_id(
            db,
            finding_id,
        )

        if not finding:
            raise ProjectFindingNotFoundException(
                "Finding not found."
            )

        # Verify user has access to the parent project
        ProjectService.ensure_project_access(
            db,
            finding.project_id,
            current_user,
        )

        ProjectFindingRepository.delete(
            db,
            finding,
        )
