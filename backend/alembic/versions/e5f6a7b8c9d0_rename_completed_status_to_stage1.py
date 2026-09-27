"""rename completed project status to stage1

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-08-12 00:00:00.000000
"""
from alembic import op


revision = "e5f6a7b8c9d0"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("UPDATE projects SET status = 'STAGE1' WHERE status = 'COMPLETED'")


def downgrade() -> None:
    op.execute("UPDATE projects SET status = 'COMPLETED' WHERE status = 'STAGE1'")
