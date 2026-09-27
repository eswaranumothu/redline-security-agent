from sqlalchemy.orm import Session

from app.models.finding_evidence import FindingEvidence


class FindingEvidenceRepository:

    @staticmethod
    def create(
        db: Session,
        evidence: FindingEvidence,
    ):
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def get_by_id(
        db: Session,
        evidence_id: int,
    ):
        return (
            db.query(FindingEvidence)
            .filter(
                FindingEvidence.id == evidence_id
            )
            .first()
        )

    @staticmethod
    def list_by_finding(
        db: Session,
        finding_id: int,
    ):
        return (
            db.query(FindingEvidence)
            .filter(
                FindingEvidence.finding_id == finding_id
            )
            .order_by(
                FindingEvidence.display_order.asc()
            )
            .all()
        )

    @staticmethod
    def update(
        db: Session,
        evidence: FindingEvidence,
    ):
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def delete(
        db: Session,
        evidence: FindingEvidence,
    ):
        db.delete(evidence)
        db.commit()