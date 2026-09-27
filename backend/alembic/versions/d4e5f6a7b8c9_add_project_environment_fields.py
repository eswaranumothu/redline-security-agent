"""add project environment fields

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-08-11 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "d4e5f6a7b8c9"
down_revision = "c3d4e5f6a7b8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Existing projects may use statuses that were retired from the workflow.
    # Normalize them before API responses are validated against the new enum.
    op.execute("UPDATE projects SET status = 'DRAFT' WHERE status = 'IN_PROGRESS'")
    op.execute("UPDATE projects SET status = 'COMPLETED' WHERE status = 'ARCHIVED'")
    op.add_column("projects", sa.Column("ip_address", sa.String(length=255), nullable=True))
    op.add_column("projects", sa.Column("operating_system", sa.String(length=255), nullable=True))
    op.add_column("projects", sa.Column("language", sa.String(length=255), nullable=True))
    op.add_column("projects", sa.Column("web_server", sa.String(length=255), nullable=True))
    op.add_column("projects", sa.Column("ports_scanned", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("projects", "ports_scanned")
    op.drop_column("projects", "web_server")
    op.drop_column("projects", "language")
    op.drop_column("projects", "operating_system")
    op.drop_column("projects", "ip_address")
