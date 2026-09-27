from sqlalchemy.orm import Session, joinedload

from app.models.project import Project


class ProjectRepository:

    @staticmethod
    def create(
        db: Session,
        project: Project
    ):
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_by_id(
        db: Session,
        project_id: int
    ):
        return (
            db.query(Project)
            .options(
                joinedload(Project.auditor),
                joinedload(Project.creator),
            )
            .filter(Project.id == project_id)
            .first()
        )

    @staticmethod
    def get_by_project_code(
        db: Session,
        project_code: str
    ):
        return (
            db.query(Project)
            .filter(Project.project_code == project_code)
            .first()
        )

    @staticmethod
    def list_all(
        db: Session
    ):
        return (
            db.query(Project)
            .options(joinedload(Project.auditor))
            .order_by(
                Project.created_at.desc(),
                Project.id.desc(),
            )
            .all()
        )

    @staticmethod
    def list_for_user(
        db: Session,
        user_id: int,
    ):
        return (
            db.query(Project)
            .options(joinedload(Project.auditor))
            .filter(
                (Project.assigned_to == user_id)
                | (Project.created_by == user_id)
            )
            .order_by(Project.created_at.desc(), Project.id.desc())
            .all()
        )

    @staticmethod
    def update(
        db: Session,
        project: Project
    ):
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete(
        db: Session,
        project: Project
    ):
        db.delete(project)
        db.commit()
