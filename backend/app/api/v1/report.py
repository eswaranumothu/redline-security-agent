from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.permissions import (
    require_admin_or_auditor,
)
from app.exceptions.project_exceptions import (
    ProjectAccessDeniedException,
    ProjectNotFoundException,
)
from app.services.report.report_service import (
    ReportService,
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.post(
    "/projects/{project_id}/generate",
)
def generate_report(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_auditor),
):
    try:
        pdf_path = ReportService.generate(
            db,
            project_id,
            current_user,
        )

        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=pdf_path.split("\\")[-1].split("/")[-1],
        )

    except ProjectNotFoundException as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

    except ProjectAccessDeniedException as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
