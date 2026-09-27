from sqlalchemy.orm import Session, joinedload

from app.models.project_finding import ProjectFinding


class ProjectFindingRepository:

    @staticmethod
    def exists_by_title(
        db: Session,
        project_id: int,
        title: str,
    ) -> bool:
        title = title.strip()
        if not title:
            return False
        existing = (
            db.query(ProjectFinding.title)
            .filter(ProjectFinding.project_id == project_id)
            .all()
        )
        titles_lower = {row.title.lower() for row in existing}
        return title.lower() in titles_lower

    @staticmethod
    def create(
        db: Session,
        finding: ProjectFinding,
    ):
        db.add(finding)
        db.commit()
        db.refresh(finding)
        return finding

    @staticmethod
    def get_by_id(
        db: Session,
        finding_id: int,
    ):
        return (
            db.query(ProjectFinding)
            .options(joinedload(ProjectFinding.evidences))
            .filter(
                ProjectFinding.id == finding_id
            )
            .first()
        )

    @staticmethod
    def list_by_project(
        db: Session,
        project_id: int,
    ):
        return (
            db.query(ProjectFinding)
            .options(joinedload(ProjectFinding.evidences))
            .filter(
                ProjectFinding.project_id == project_id
            )
            .order_by(ProjectFinding.id)
            .all()
        )

    @staticmethod
    def update(
        db: Session,
        finding: ProjectFinding,
    ):
        db.commit()
        db.refresh(finding)
        return finding

    @staticmethod
    def delete(
        db: Session,
        finding: ProjectFinding,
    ):
        db.delete(finding)
        db.commit()
