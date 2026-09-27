from pathlib import Path
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.project_repository import (
    ProjectRepository,
)
from app.repositories.project_finding_repository import (
    ProjectFindingRepository,
)
from app.services.project_service import ProjectService
from app.services.report.report_builder import (
    ReportBuilder,
)
from app.services.report.pdf_generator import (
    PDFGenerator,
)


class ReportService:

    @staticmethod
    def generate(
        db: Session,
        project_id: int,
        current_user: User,
    ) -> str:

        # Verify project exists and user has access
        project = ProjectService.ensure_project_access(
            db,
            project_id,
            current_user,
        )

        # Load Findings
        findings = ProjectFindingRepository.list_by_project(
            db,
            project_id,
        )

        # Build Report Model
        report_data = ReportBuilder.build(
            project,
            findings,
        )

        # Output File
        project_root = Path(__file__).resolve().parents[3]

        output_folder = project_root / "generated_reports"
        output_folder.mkdir(exist_ok=True)

        output_file = output_folder / f"{project.project_code}.pdf"

        # Generate PDF
        PDFGenerator.generate(
            report_data,
            str(output_file),
        )

        # Record successful generation server-side. The dashboard can then
        # count real reports even when the user never downloads the PDF.
        project.report_generated_at = datetime.now(timezone.utc)
        db.commit()

        return str(output_file)
