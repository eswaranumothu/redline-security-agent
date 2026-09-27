from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_admin
from app.exceptions.master_vulnerability_exceptions import (
    MasterVulnerabilityAlreadyExistsException,
    MasterVulnerabilityNotFoundException,
)
from app.schemas.master_vulnerability import (
    MasterVulnerabilityCreate,
    MasterVulnerabilityResponse,
    MasterVulnerabilityUpdate,
)
from app.services.master_vulnerability_service import (
    MasterVulnerabilityService,
)

router = APIRouter(
    prefix="/master-vulnerabilities",
    tags=["Master Vulnerabilities"],
)


@router.post(
    "",
    response_model=MasterVulnerabilityResponse,
)
def create_master_vulnerability(
    request: MasterVulnerabilityCreate,
    allow_duplicate: bool = Query(False),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    try:
        return MasterVulnerabilityService.create_vulnerability(
            db=db,
            request=request,
            created_by=current_user.id,
            allow_duplicate=allow_duplicate,
        )

    except MasterVulnerabilityAlreadyExistsException as e:
        raise HTTPException(
            status_code=409,
            detail=str(e),
        )


@router.get(
    "",
    response_model=list[MasterVulnerabilityResponse],
)
def list_master_vulnerabilities(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return MasterVulnerabilityService.list_vulnerabilities(db)


@router.get(
    "/{vulnerability_id}",
    response_model=MasterVulnerabilityResponse,
)
def get_master_vulnerability(
    vulnerability_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return MasterVulnerabilityService.get_vulnerability(
            db,
            vulnerability_id,
        )

    except MasterVulnerabilityNotFoundException as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.put(
    "/{vulnerability_id}",
    response_model=MasterVulnerabilityResponse,
)
def update_master_vulnerability(
    vulnerability_id: int,
    request: MasterVulnerabilityUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    try:
        return MasterVulnerabilityService.update_vulnerability(
            db,
            vulnerability_id,
            request,
        )

    except MasterVulnerabilityNotFoundException as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.delete(
    "/{vulnerability_id}",
)
def delete_master_vulnerability(
    vulnerability_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    try:
        MasterVulnerabilityService.delete_vulnerability(
            db,
            vulnerability_id,
        )

        return {
            "message": "Master vulnerability deleted successfully."
        }

    except MasterVulnerabilityNotFoundException as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
