from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class SecurityMemory(Base):
    __tablename__ = "security_memories"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    finding_id = Column(
        Integer,
        ForeignKey("project_findings.id", ondelete="SET NULL"),
        nullable=True,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    memory_bank_id = Column(
        String(100),
        nullable=False,
        index=True,
    )

    hindsight_memory_id = Column(
        String(255),
        nullable=True,
    )

    vulnerability_category = Column(
        String(100),
        nullable=True,
        index=True,
    )

    severity = Column(
        String(30),
        nullable=True,
    )

    sanitized_title = Column(
        String(255),
        nullable=False,
    )

    sanitized_summary = Column(
        Text,
        nullable=False,
    )

    remediation_notes = Column(
        Text,
        nullable=True,
    )

    retest_outcome = Column(
        String(50),
        nullable=True,
    )

    retained_by = Column(
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

    project = relationship("Project")
    finding = relationship("ProjectFinding")
    retainer = relationship("User")


class AnalystFeedback(Base):
    __tablename__ = "analyst_feedback"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    finding_id = Column(
        Integer,
        ForeignKey("project_findings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    suggested_memory_id = Column(
        Integer,
        ForeignKey("security_memories.id", ondelete="CASCADE"),
        nullable=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    is_relevant = Column(
        Boolean,
        nullable=True,
    )

    remediation_action = Column(
        String(50),
        nullable=True,
    )

    feedback_notes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    finding = relationship("ProjectFinding")
    suggested_memory = relationship("SecurityMemory")
    user = relationship("User")
