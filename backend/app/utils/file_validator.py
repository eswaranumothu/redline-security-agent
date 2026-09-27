from pathlib import Path
from fastapi import UploadFile


class FileValidator:

    ALLOWED_EXTENSIONS = {
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
    }

    MAX_SIZE = 10 * 1024 * 1024  # 10 MB

    @staticmethod
    async def validate_image(file: UploadFile):
        # Validate extension
        extension = Path(file.filename).suffix.lower()

        if extension not in FileValidator.ALLOWED_EXTENSIONS:
            raise ValueError(
                "Only PNG, JPG, JPEG and WEBP images are allowed."
            )

        # Validate size
        contents = await file.read()

        if len(contents) > FileValidator.MAX_SIZE:
            raise ValueError(
                "Maximum upload size is 10 MB."
            )

        # Reset stream so it can be saved later
        await file.seek(0)