from decimal import Decimal
from pydantic import BaseModel, Field


class GenerateVulnerabilityRequest(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        max_length=255,
    )


class GenerateVulnerabilityResponse(BaseModel):
    title: str = Field(min_length=3, max_length=255)

    description: str = Field(min_length=10)

    impact: str = Field(min_length=10)

    recommendation: str = Field(min_length=10)

    solution: str = Field(min_length=10)

    severity: str = Field(min_length=3)

    cvss_score: Decimal = Field(ge=0, le=10)

    cvss_vector: str = Field(min_length=3)

    cwe: str = Field(min_length=3)

    owasp: str = Field(min_length=3)

class GenerateEvidenceResponse(BaseModel):
    evidence_description: str
