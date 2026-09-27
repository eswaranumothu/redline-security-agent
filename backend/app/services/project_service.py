from datetime import datetime

from sqlalchemy.orm import Session

from app.core.roles import UserRole
from app.exceptions.project_exceptions import (
    ProjectAccessDeniedException,
    ProjectNotFoundException,
)
from app.models.project import Project
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)


class ProjectService:

    @staticmethod
    def _normalize_legacy_status(status: str) -> str:
        """Map removed workflow values so existing projects remain usable."""
        return {
            "IN_PROGRESS": "DRAFT",
            "ARCHIVED": "STAGE1",
            "COMPLETED": "STAGE1",
        }.get(status, status)

    @staticmethod
    def _can_access_project(
        project: Project,
        current_user: User,
    ) -> bool:
        # All authenticated users can access all projects
        return True

    @staticmethod
    def _serialize_project(
        project: Project,
    ) -> ProjectResponse:
        return ProjectResponse(
            id=project.id,
            project_code=project.project_code,
            project_name=project.project_name,
            client_name=project.client_name,
            application_name=project.application_name,
            application_url=project.application_url,
            ip_address=project.ip_address,
            operating_system=project.operating_system,
            language=project.language,
            web_server=project.web_server,
            ports_scanned=project.ports_scanned,
            project_type=project.project_type,
            description=project.description,
            scope=project.scope,
            start_date=project.start_date,
            end_date=project.end_date,
            status=ProjectService._normalize_legacy_status(project.status),
            assigned_to=project.assigned_to,
            created_by=project.created_by,
            created_at=project.created_at,
            updated_at=project.updated_at,
            report_generated_at=project.report_generated_at,
            assigned_user_name=(
                project.auditor.full_name if project.auditor else None
            ),
            assigned_user_email=(
                project.auditor.email if project.auditor else None
            ),
            created_by_name=(
                project.creator.full_name if project.creator else None
            ),
        )

    @staticmethod
    def generate_project_code(
        db: Session
    ) -> str:
        current_year = datetime.now().year

        latest_project = (
            db.query(Project)
            .order_by(Project.id.desc())
            .first()
        )

        if latest_project:
            last_number = int(
                latest_project.project_code.split("-")[-1]
            )
            next_number = last_number + 1
        else:
            next_number = 1

        return (
            f"PRJ-{current_year}-{next_number:04d}"
        )

    @staticmethod
    def create_project(
        db: Session,
        request: ProjectCreate,
        created_by: int,
        current_user: User,
    ):
        assigned_to = request.assigned_to

        if current_user.role == UserRole.AUDITOR.value:
            assigned_to = current_user.id

        project = Project(
            project_code=ProjectService.generate_project_code(db),
            project_name=request.project_name,
            client_name=request.client_name,
            application_name=request.application_name,
            application_url=request.application_url,
            ip_address=request.ip_address,
            operating_system=request.operating_system,
            language=request.language,
            web_server=request.web_server,
            ports_scanned=request.ports_scanned,
            project_type=request.project_type.value,
            description=request.description,
            scope=request.scope,
            start_date=request.start_date,
            end_date=request.end_date,
            status=request.status.value,
            assigned_to=assigned_to,
            created_by=created_by,
        )

        created = ProjectRepository.create(
            db,
            project
        )

        return ProjectService._serialize_project(
            ProjectRepository.get_by_id(db, created.id)
        )

    @staticmethod
    def list_projects(
        db: Session,
        current_user: User,
    ):
        # All users see all projects
        projects = ProjectRepository.list_all(db)

        return [
            ProjectService._serialize_project(project)
            for project in projects
        ]

    @staticmethod
    def get_project(
        db: Session,
        project_id: int,
        current_user: User,
    ):
        project = ProjectRepository.get_by_id(
            db,
            project_id
        )

        if not project:
            raise ProjectNotFoundException(
                "Project not found."
            )

        if not ProjectService._can_access_project(
            project,
            current_user,
        ):
            raise ProjectAccessDeniedException(
                "You do not have access to this project."
            )

        return ProjectService._serialize_project(project)

    @staticmethod
    def update_project(
        db: Session,
        project_id: int,
        request: ProjectUpdate,
        current_user: User,
    ):
        project = ProjectRepository.get_by_id(
            db,
            project_id
        )

        if not project:
            raise ProjectNotFoundException(
                "Project not found."
            )

        if not ProjectService._can_access_project(
            project,
            current_user,
        ):
            raise ProjectAccessDeniedException(
                "You do not have access to this project."
            )

        if request.project_name is not None:
            project.project_name = request.project_name

        if request.client_name is not None:
            project.client_name = request.client_name

        if request.application_name is not None:
            project.application_name = request.application_name

        if request.application_url is not None:
            project.application_url = request.application_url

        if request.ip_address is not None:
            project.ip_address = request.ip_address

        if request.operating_system is not None:
            project.operating_system = request.operating_system

        if request.language is not None:
            project.language = request.language

        if request.web_server is not None:
            project.web_server = request.web_server

        if request.ports_scanned is not None:
            project.ports_scanned = request.ports_scanned

        if request.project_type is not None:
            project.project_type = request.project_type.value

        if request.description is not None:
            project.description = request.description

        if request.scope is not None:
            project.scope = request.scope

        if request.start_date is not None:
            project.start_date = request.start_date

        if request.end_date is not None:
            project.end_date = request.end_date

        if request.status is not None:
            project.status = request.status.value

        if (
            request.assigned_to is not None
            and current_user.role == UserRole.ADMIN.value
        ):
            project.assigned_to = request.assigned_to

        updated = ProjectRepository.update(
            db,
            project
        )

        return ProjectService._serialize_project(updated)

    @staticmethod
    def delete_project(
        db: Session,
        project_id: int,
        current_user: User,
    ):
        project = ProjectRepository.get_by_id(
            db,
            project_id
        )

        if not project:
            raise ProjectNotFoundException(
                "Project not found."
            )

        if not ProjectService._can_access_project(
            project,
            current_user,
        ):
            raise ProjectAccessDeniedException(
                "You do not have access to this project."
            )

        ProjectRepository.delete(
            db,
            project
        )

    @staticmethod
    def ensure_project_access(
        db: Session,
        project_id: int,
        current_user: User,
    ) -> Project:
        project = ProjectRepository.get_by_id(
            db,
            project_id,
        )

        if not project:
            raise ProjectNotFoundException(
                "Project not found."
            )

        if not ProjectService._can_access_project(
            project,
            current_user,
        ):
            raise ProjectAccessDeniedException(
                "You do not have access to this project."
            )

        return project
