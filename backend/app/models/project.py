from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    project_code = Column(
        String(30),
        unique=True,
        nullable=False,
        index=True
    )

    project_name = Column(
        String(255),
        nullable=False
    )

    client_name = Column(
        String(255),
        nullable=False
    )

    application_name = Column(
        String(255),
        nullable=False
    )

    application_url = Column(
        String(500),
        nullable=True
    )

    ip_address = Column(
        String(255),
        nullable=True
    )

    operating_system = Column(
        String(255),
        nullable=True
    )

    language = Column(
        String(255),
        nullable=True
    )

    web_server = Column(
        String(255),
        nullable=True
    )

    ports_scanned = Column(
        Text,
        nullable=True
    )

    project_type = Column(
        String(30),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    scope = Column(
        Text,
        nullable=True
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=True
    )

    status = Column(
        String(30),
        nullable=False,
        default="DRAFT"
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Set only after the PDF is successfully created. This is independent of
    # the project workflow status and does not depend on a browser download.
    report_generated_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    creator = relationship(
        "User",
        foreign_keys=[created_by]
    )

    auditor = relationship(
        "User",
        foreign_keys=[assigned_to]
    )

    findings = relationship(
        "ProjectFinding",
        foreign_keys="ProjectFinding.project_id",
        cascade="all, delete-orphan",
    )
