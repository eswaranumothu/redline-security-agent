"""add_case_label_to_finding_evidence

Revision ID: a1b2c3d4e5f6
Revises: 8db762743927
Create Date: 2026-08-07 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '3af051f94a34'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'finding_evidence',
        sa.Column(
            'case_label',
            sa.String(length=50),
            nullable=False,
            server_default='Case 1',
        ),
    )


def downgrade() -> None:
    op.drop_column('finding_evidence', 'case_label')
