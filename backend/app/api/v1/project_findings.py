from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.permissions import (
    require_admin_or_auditor,
)
from app.exceptions.project_exceptions import (
    ProjectAccessDeniedException,
)
from app.exceptions.project_finding_exceptions import (
    InvalidFindingException,
    MasterVulnerabilityNotFoundException,
    ProjectFindingNotFoundException,
)
from app.schemas.project_finding import (
    PreviewMasterRequest,
    ProjectFindingCustomCreate,
    ProjectFindingFromMasterCreate,
    ProjectFindingPreviewResponse,
    ProjectFindingResponse,
    ProjectFindingUpdate,
)
from app.services.project_finding_service import (
    ProjectFindingService,
)

router = APIRouter(
    prefix="/project-findings",
    tags=["Project Findings"],
)


@router.post(
    "/preview-master",
    response_model=ProjectFindingPreviewResponse,
)
def preview_master(
    request: PreviewMasterRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return ProjectFindingService.preview_master(
            db,
            request.master_vulnerability_id,
        )

    except MasterVulnerabilityNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/from-master",
    response_model=ProjectFindingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_from_master(
    request: ProjectFindingFromMasterCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return ProjectFindingService.create_from_master(
            db,
            request,
            current_user,
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except MasterVulnerabilityNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except InvalidFindingException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/custom",
    response_model=ProjectFindingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_custom(
    request: ProjectFindingCustomCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return ProjectFindingService.create_custom(
            db,
            request,
            current_user,
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except InvalidFindingException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/project/{project_id}",
    response_model=list[ProjectFindingResponse],
)
def list_project_findings(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return ProjectFindingService.list_by_project(
            db,
            project_id,
            current_user,
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.get(
    "/{finding_id}",
    response_model=ProjectFindingResponse,
)
def get_finding(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return ProjectFindingService.get_by_id(
            db,
            finding_id,
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


@router.put(
    "/{finding_id}",
    response_model=ProjectFindingResponse,
)
def update_finding(
    finding_id: int,
    request: ProjectFindingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        return ProjectFindingService.update(
            db,
            finding_id,
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


@router.delete(
    "/{finding_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_finding(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        ProjectFindingService.delete(
            db,
            finding_id,
            current_user,
        )

        return Response(
            status_code=status.HTTP_204_NO_CONTENT
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
