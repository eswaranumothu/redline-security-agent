from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.permissions import require_admin
from app.schemas.ai import (
    GenerateVulnerabilityRequest,
    GenerateVulnerabilityResponse,
)
from app.services.ai.vulnerability_ai_service import (
    VulnerabilityAIService,
)

router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.post(
    "/generate-vulnerability",
    response_model=GenerateVulnerabilityResponse,
)
def generate_vulnerability(
    request: GenerateVulnerabilityRequest,
    current_user=Depends(require_admin),
):
    try:
        return VulnerabilityAIService.generate(
            request.title,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
