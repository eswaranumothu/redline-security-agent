from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class ProjectFinding(Base):
    __tablename__ = "project_findings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )

    master_vulnerability_id = Column(
        Integer,
        ForeignKey("master_vulnerabilities.id"),
        nullable=True,
    )

    is_custom = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    impact = Column(
        Text,
        nullable=True,
    )

    recommendation = Column(
        Text,
        nullable=True,
    )

    solution = Column(
        Text,
        nullable=True,
    )

    severity = Column(
        String(20),
        nullable=True,
    )

    cvss_score = Column(
        Numeric(3, 1),
        nullable=True,
    )

    cvss_vector = Column(
        String(255),
        nullable=True,
    )

    cwe = Column(
        String(255),
        nullable=True,
    )

    owasp = Column(
        String(100),
        nullable=True,
    )

    references = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String(30),
        default="OPEN",
        nullable=False,
    )

    retest_status = Column(
        String(30),
        default="NOT_TESTED",
        nullable=False,
    )

    retest_notes = Column(
        Text,
        nullable=True,
    )

    retested_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    retested_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    project = relationship(
        "Project",
        back_populates="findings",
    )

    master_vulnerability = relationship(
        "MasterVulnerability"
    )

    creator = relationship(
        "User",
        foreign_keys=[created_by],
    )

    retester = relationship(
        "User",
        foreign_keys=[retested_by],
    )

    evidences = relationship(
        "FindingEvidence",
        back_populates="finding",
        cascade="all, delete-orphan",
    )