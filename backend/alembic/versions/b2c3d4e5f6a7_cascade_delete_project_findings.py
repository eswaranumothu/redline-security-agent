"""cascade_delete_project_findings

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-07 13:00:00.000000

"""
from alembic import op

revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the existing FK, re-add it with ON DELETE CASCADE
    op.drop_constraint(
        'project_findings_project_id_fkey',
        'project_findings',
        type_='foreignkey',
    )
    op.create_foreign_key(
        'project_findings_project_id_fkey',
        'project_findings',
        'projects',
        ['project_id'],
        ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    op.drop_constraint(
        'project_findings_project_id_fkey',
        'project_findings',
        type_='foreignkey',
    )
    op.create_foreign_key(
        'project_findings_project_id_fkey',
        'project_findings',
        'projects',
        ['project_id'],
        ['id'],
    )
