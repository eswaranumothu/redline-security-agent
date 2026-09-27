import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


class StorageService:
    """
    Handles all file storage operations.
    """

    PROJECT_ROOT = Path(__file__).resolve().parents[4]

    ROOT_FOLDER = PROJECT_ROOT / "uploads"

    @staticmethod
    def save_file(
        folder: Path,
        file: UploadFile,
    ):
        destination = (
            StorageService.ROOT_FOLDER / folder
        )

        destination.mkdir(
            parents=True,
            exist_ok=True,
        )

        extension = Path(
            file.filename
        ).suffix

        filename = (
            f"{uuid4()}{extension}"
        )

        filepath = (
            destination / filename
        )

        with open(
            filepath,
            "wb",
        ) as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        relative_path = filepath.relative_to(
            StorageService.PROJECT_ROOT
        )

        return (
            str(relative_path),
            file.filename,
        )

    @staticmethod
    def delete_file(
        relative_path: str,
    ):
        """
        Delete a previously uploaded file.
        """

        if not relative_path:
            return

        filepath = (
            StorageService.PROJECT_ROOT
            / relative_path
        )

        if filepath.exists():
            filepath.unlink()

    @staticmethod
    def screenshot_folder(
        project_code: str,
        finding_id: int,
    ):
        return (
            Path("projects")
            / project_code
            / f"finding_{finding_id}"
        )

    @staticmethod
    def report_folder(
        project_code: str,
    ):
        return (
            Path("reports")
            / project_code
        )

    @staticmethod
    def logo_folder():
        return Path("logos")