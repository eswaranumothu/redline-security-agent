from app.services.ai.gemini_client import GeminiAIClient
from app.services.ai.prompts.evidence_prompt import (
    build_evidence_prompt,
)
from app.services.ai.prompts.vulnerability_prompt import (
    build_vulnerability_prompt,
)


class AIService:

    _client = None

    @classmethod
    def _get_client(cls) -> GeminiAIClient:
        if cls._client is None:
            cls._client = GeminiAIClient()
        return cls._client

    @staticmethod
    def generate_vulnerability(
        vulnerability_name: str,
    ) -> str:

        prompt = build_vulnerability_prompt(
            vulnerability_name
        )

        return AIService._get_client().generate_text(
            prompt
        )

    @staticmethod
    def generate_evidence(
        vulnerability_name: str,
        image_path: str,
    ) -> str:

        prompt = build_evidence_prompt(
            vulnerability_name
        )

        return AIService._get_client().generate_with_image(
            prompt,
            image_path,
        )