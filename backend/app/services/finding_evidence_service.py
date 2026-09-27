from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.exceptions.finding_evidence_exceptions import (
    FindingEvidenceNotFoundException,
    ProjectFindingNotFoundException,
)
from app.models.finding_evidence import FindingEvidence
from app.models.user import User
from app.repositories.finding_evidence_repository import (
    FindingEvidenceRepository,
)
from app.repositories.project_finding_repository import (
    ProjectFindingRepository,
)
from app.repositories.project_repository import (
    ProjectRepository,
)
from app.schemas.finding_evidence import (
    FindingEvidenceCreate,
    FindingEvidenceUpdate,
)
from app.services.ai.evidence_ai_service import (
    EvidenceAIService,
)
from app.services.project_service import ProjectService
from app.services.storage.storage_service import (
    StorageService,
)


def _get_finding_and_verify_access(
    db: Session,
    finding_id: int,
    current_user: User,
):
    """Load a ProjectFinding and verify the current user has access
    to its parent project.  Raises appropriate exceptions on failure."""
    finding = ProjectFindingRepository.get_by_id(db, finding_id)

    if not finding:
        raise ProjectFindingNotFoundException("Project finding not found.")

    # This raises ProjectAccessDeniedException / ProjectNotFoundException
    ProjectService.ensure_project_access(db, finding.project_id, current_user)

    return finding


class FindingEvidenceService:

    @staticmethod
    def create(
        db: Session,
        request: FindingEvidenceCreate,
        current_user: User,
    ):
        _get_finding_and_verify_access(
            db,
            request.finding_id,
            current_user,
        )

        evidence = FindingEvidence(
            finding_id=request.finding_id,
            display_order=request.display_order,
            case_label=request.case_label,
            screenshot_path=request.screenshot_path,
            original_filename=request.original_filename,
            caption=request.caption,
            action_performed=request.action_performed,
            expected_result=request.expected_result,
            ai_generated=request.ai_generated,
        )

        return FindingEvidenceRepository.create(
            db,
            evidence,
        )

    @staticmethod
    def list_by_finding(
        db: Session,
        finding_id: int,
        current_user: User,
    ):
        _get_finding_and_verify_access(
            db,
            finding_id,
            current_user,
        )

        return FindingEvidenceRepository.list_by_finding(
            db,
            finding_id,
        )

    @staticmethod
    def get_by_id(
        db: Session,
        evidence_id: int,
        current_user: User,
    ):
        evidence = FindingEvidenceRepository.get_by_id(
            db,
            evidence_id,
        )

        if not evidence:
            raise FindingEvidenceNotFoundException(
                "Evidence not found."
            )

        _get_finding_and_verify_access(
            db,
            evidence.finding_id,
            current_user,
        )

        return evidence

    @staticmethod
    def update(
        db: Session,
        evidence_id: int,
        request: FindingEvidenceUpdate,
        current_user: User,
    ):
        evidence = FindingEvidenceRepository.get_by_id(
            db,
            evidence_id,
        )

        if not evidence:
            raise FindingEvidenceNotFoundException(
                "Evidence not found."
            )

        _get_finding_and_verify_access(
            db,
            evidence.finding_id,
            current_user,
        )

        update_data = request.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(evidence, field, value)

        return FindingEvidenceRepository.update(
            db,
            evidence,
        )

    @staticmethod
    def delete(
        db: Session,
        evidence_id: int,
        current_user: User,
    ):
        evidence = FindingEvidenceRepository.get_by_id(
            db,
            evidence_id,
        )

        if not evidence:
            raise FindingEvidenceNotFoundException(
                "Evidence not found."
            )

        _get_finding_and_verify_access(
            db,
            evidence.finding_id,
            current_user,
        )

        if evidence.screenshot_path:
            StorageService.delete_file(evidence.screenshot_path)

        FindingEvidenceRepository.delete(db, evidence)

    @staticmethod
    def upload_screenshot(
        db: Session,
        evidence_id: int,
        file: UploadFile,
        current_user: User,
    ):
        evidence = FindingEvidenceRepository.get_by_id(
            db,
            evidence_id,
        )

        if not evidence:
            raise FindingEvidenceNotFoundException(
                "Evidence not found."
            )

        finding = _get_finding_and_verify_access(
            db,
            evidence.finding_id,
            current_user,
        )

        project = ProjectRepository.get_by_id(
            db,
            finding.project_id,
        )

        if not project:
            raise Exception("Project not found.")

        # Delete previous screenshot if replacing
        if evidence.screenshot_path:
            StorageService.delete_file(evidence.screenshot_path)

        folder = StorageService.screenshot_folder(
            project.project_code,
            finding.id,
        )

        screenshot_path, original_filename = StorageService.save_file(
            folder,
            file,
        )

        evidence.screenshot_path = screenshot_path
        evidence.original_filename = original_filename

        # Reset AI generated content when a new image is uploaded
        evidence.caption = None
        evidence.action_performed = None
        evidence.expected_result = None
        evidence.ai_generated = False

        return FindingEvidenceRepository.update(db, evidence)

    @staticmethod
    def generate_description(
        db: Session,
        evidence_id: int,
        current_user: User,
    ):
        """Generate AI evidence description using the uploaded screenshot."""

        evidence = FindingEvidenceRepository.get_by_id(
            db,
            evidence_id,
        )

        if not evidence:
            raise FindingEvidenceNotFoundException(
                "Evidence not found."
            )

        if not evidence.screenshot_path:
            raise ValueError("Please upload a screenshot first.")

        finding = _get_finding_and_verify_access(
            db,
            evidence.finding_id,
            current_user,
        )

        # Resolve vulnerability name for the prompt
        if finding.is_custom:
            vulnerability_name = finding.title
        else:
            if not finding.master_vulnerability:
                raise ValueError("Master Vulnerability not found.")
            vulnerability_name = finding.master_vulnerability.title

        # Build absolute image path
        project_root = Path(__file__).resolve().parents[3]
        image_path = project_root / evidence.screenshot_path

        if not image_path.exists():
            raise ValueError(
                f"Screenshot not found at path: {image_path}"
            )

        ai_response = EvidenceAIService.generate(
            vulnerability_name=vulnerability_name,
            image_path=str(image_path),
        )

        evidence.caption = ai_response.evidence_description
        evidence.ai_generated = True

        db.commit()
        db.refresh(evidence)

        return evidence
