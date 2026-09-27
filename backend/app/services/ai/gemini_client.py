import logging
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

# Anchor to backend/.env regardless of working directory
load_dotenv(Path(__file__).resolve().parents[4] / ".env")

logger = logging.getLogger(__name__)


class GeminiAIClient:
    # Configuration constants
    MAX_RETRIES = 3
    RETRY_DELAY = 1  # seconds
    REQUEST_TIMEOUT = 60  # seconds

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not configured."
            )

        self.client = genai.Client(
            api_key=api_key
        )

        self.model = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.5-flash-lite",
        )
        self._prompt_cache = {}

    def generate_text(
        self,
        prompt: str,
        response_schema=None,
        max_output_tokens: int = 768,
    ) -> str:
        cache_key = f"{prompt}_{str(response_schema)}"
        if cache_key in self._prompt_cache:
            logger.info("Returning cached AI response for prompt")
            return self._prompt_cache[cache_key]

        config_kwargs = {
            "max_output_tokens": max_output_tokens,
        }

        if response_schema:
            config_kwargs.update(
                {
                    "response_mime_type": "application/json",
                    "response_schema": response_schema,
                }
            )

        last_error = None

        for attempt in range(self.MAX_RETRIES):
            try:
                logger.info(
                    f"Generating text with model {self.model} (attempt {attempt + 1}/{self.MAX_RETRIES})"
                )

                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        **config_kwargs
                    ),
                )

                if response is None or response.text is None:
                    raise RuntimeError(
                        "API returned empty response"
                    )

                logger.info("Text generation successful")
                res_text = response.text.strip()
                if len(self._prompt_cache) < 100:
                    self._prompt_cache[cache_key] = res_text
                return res_text

            except Exception as e:
                last_error = e
                logger.warning(
                    f"Text generation attempt {attempt + 1} failed: {str(e)}"
                )
                if attempt < self.MAX_RETRIES - 1:
                    wait_time = self.RETRY_DELAY * (2 ** attempt)
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                break

        raise RuntimeError(
            f"Failed to generate text after {self.MAX_RETRIES} attempts: {str(last_error)}"
        )

    def generate_with_image(
        self,
        prompt: str,
        image_path: str,
        response_schema=None,
    ) -> str:

        path = Path(image_path)

        if not path.is_file():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        logger.info(f"Loading image from {image_path}")

        with open(path, "rb") as f:
            image_bytes = f.read()

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=self._get_mime_type(path),
        )

        config_kwargs = {
            "max_output_tokens": 2048,
        }

        if response_schema:
            config_kwargs.update(
                {
                    "response_mime_type": "application/json",
                    "response_schema": response_schema,
                }
            )

        last_error = None

        for attempt in range(self.MAX_RETRIES):
            try:
                logger.info(
                    f"Generating text with image using model {self.model} (attempt {attempt + 1}/{self.MAX_RETRIES})"
                )

                response = self.client.models.generate_content(
                    model=self.model,
                    contents=[
                        image_part,
                        prompt,
                    ],
                    config=types.GenerateContentConfig(
                        **config_kwargs
                    ),
                )

                if response is None or response.text is None:
                    raise RuntimeError(
                        "API returned empty response"
                    )

                logger.info("Text generation with image successful")
                return response.text.strip()

            except Exception as e:
                last_error = e
                logger.warning(
                    f"Text generation with image attempt {attempt + 1} failed: {str(e)}"
                )
                if attempt < self.MAX_RETRIES - 1:
                    wait_time = self.RETRY_DELAY * (2 ** attempt)
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                break

        raise RuntimeError(
            f"Failed to generate text with image after {self.MAX_RETRIES} attempts: {str(last_error)}"
        )

    @staticmethod
    def _get_mime_type(path: Path) -> str:

        mime_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".gif": "image/gif",
        }

        return mime_types.get(
            path.suffix.lower(),
            "application/octet-stream",
        )