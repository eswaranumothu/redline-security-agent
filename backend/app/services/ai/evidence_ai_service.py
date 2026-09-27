from app.schemas.ai import GenerateEvidenceResponse
from app.services.ai.gemini_client import GeminiAIClient
from app.services.ai.prompts.evidence_prompt import (
    build_evidence_prompt,
)


class EvidenceAIService:

    _client = None

    @classmethod
    def _get_client(cls) -> GeminiAIClient:
        if cls._client is None:
            cls._client = GeminiAIClient()
        return cls._client

    @staticmethod
    def generate(
        vulnerability_name: str,
        image_path: str,
    ) -> GenerateEvidenceResponse:
        prompt = build_evidence_prompt(
            vulnerability_name
        )

        response = EvidenceAIService._get_client().generate_with_image(
            prompt,
            image_path,
        )

        return GenerateEvidenceResponse(
            evidence_description=response.strip()
        )
