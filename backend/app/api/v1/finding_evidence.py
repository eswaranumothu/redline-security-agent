import traceback
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.permissions import (
    require_admin_or_auditor,
)
from app.exceptions.finding_evidence_exceptions import (
    FindingEvidenceNotFoundException,
    ProjectFindingNotFoundException,
)
from app.exceptions.project_exceptions import (
    ProjectAccessDeniedException,
)
from app.schemas.finding_evidence import (
    FindingEvidenceCreate,
    FindingEvidenceResponse,
    FindingEvidenceUpdate,
)
from app.services.finding_evidence_service import (
    FindingEvidenceService,
)
from app.utils.file_validator import FileValidator

router = APIRouter(
    prefix="/finding-evidence",
    tags=["Finding Evidence"],
)


# --------------------------------------------------
# Create Evidence
# --------------------------------------------------

@router.post(
    "",
    response_model=FindingEvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_evidence(
    request: FindingEvidenceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return FindingEvidenceService.create(
            db,
            request,
            current_user,
        )

    except ProjectFindingNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


# --------------------------------------------------
# List Evidence
# --------------------------------------------------

@router.get(
    "/finding/{finding_id}",
    response_model=list[FindingEvidenceResponse],
)
def list_evidence(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return FindingEvidenceService.list_by_finding(
            db,
            finding_id,
            current_user,
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


# --------------------------------------------------
# Get Evidence
# --------------------------------------------------

@router.get(
    "/{evidence_id}",
    response_model=FindingEvidenceResponse,
)
def get_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return FindingEvidenceService.get_by_id(
            db,
            evidence_id,
            current_user,
        )

    except FindingEvidenceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


# --------------------------------------------------
# Update Evidence
# --------------------------------------------------

@router.put(
    "/{evidence_id}",
    response_model=FindingEvidenceResponse,
)
def update_evidence(
    evidence_id: int,
    request: FindingEvidenceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return FindingEvidenceService.update(
            db,
            evidence_id,
            request,
            current_user,
        )

    except FindingEvidenceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


# --------------------------------------------------
# Delete Evidence
# --------------------------------------------------

@router.delete(
    "/{evidence_id}",
)
def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        FindingEvidenceService.delete(
            db,
            evidence_id,
            current_user,
        )

        return {
            "message": "Evidence deleted successfully."
        }

    except FindingEvidenceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


# --------------------------------------------------
# Upload Screenshot
# --------------------------------------------------

@router.post(
    "/{evidence_id}/upload",
    response_model=FindingEvidenceResponse,
)
async def upload_screenshot(
    evidence_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        await FileValidator.validate_image(file)

        return FindingEvidenceService.upload_screenshot(
            db,
            evidence_id,
            file,
            current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except FindingEvidenceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


# --------------------------------------------------
# Generate AI Evidence Description
# --------------------------------------------------

@router.post(
    "/{evidence_id}/generate-description",
    response_model=FindingEvidenceResponse,
)
def generate_description(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return FindingEvidenceService.generate_description(
            db,
            evidence_id,
            current_user,
        )

    except FindingEvidenceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
