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


class FindingEvidence(Base):
    __tablename__ = "finding_evidence"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    finding_id = Column(
        Integer,
        ForeignKey("project_findings.id"),
        nullable=False,
    )

    display_order = Column(
        Integer,
        nullable=False,
        default=1,
    )

    screenshot_path = Column(
        String(500),
        nullable=True,
    )

    original_filename = Column(
        String(255),
        nullable=True,
    )

    # AI-generated evidence description
    caption = Column(
        Text,
        nullable=True,
    )

    case_label = Column(
        String(50),
        nullable=False,
        server_default="Case 1",
    )

    action_performed = Column(
        Text,
        nullable=True,
    )

    expected_result = Column(
        Text,
        nullable=True,
    )

    ai_generated = Column(
        Boolean,
        default=False,
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

    # Relationships
    finding = relationship(
        "ProjectFinding",
        back_populates="evidences",
    )