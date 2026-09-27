"""add redline security memory and retest tables

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-09-27 16:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6a7b8c9d0e1'
down_revision: Union[str, None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add retest fields to project_findings
    op.add_column('project_findings', sa.Column('retest_status', sa.String(length=30), nullable=False, server_default='NOT_TESTED'))
    op.add_column('project_findings', sa.Column('retest_notes', sa.Text(), nullable=True))
    op.add_column('project_findings', sa.Column('retested_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('project_findings', sa.Column('retested_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))

    # 2. Create security_memories table
    op.create_table(
        'security_memories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('finding_id', sa.Integer(), sa.ForeignKey('project_findings.id', ondelete='SET NULL'), nullable=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('memory_bank_id', sa.String(length=100), nullable=False),
        sa.Column('hindsight_memory_id', sa.String(length=255), nullable=True),
        sa.Column('vulnerability_category', sa.String(length=100), nullable=True),
        sa.Column('severity', sa.String(length=30), nullable=True),
        sa.Column('sanitized_title', sa.String(length=255), nullable=False),
        sa.Column('sanitized_summary', sa.Text(), nullable=False),
        sa.Column('remediation_notes', sa.Text(), nullable=True),
        sa.Column('retest_outcome', sa.String(length=50), nullable=True),
        sa.Column('retained_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_security_memories_id'), 'security_memories', ['id'], unique=False)
    op.create_index(op.f('ix_security_memories_project_id'), 'security_memories', ['project_id'], unique=False)
    op.create_index(op.f('ix_security_memories_memory_bank_id'), 'security_memories', ['memory_bank_id'], unique=False)

    # 3. Create analyst_feedback table
    op.create_table(
        'analyst_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('finding_id', sa.Integer(), sa.ForeignKey('project_findings.id', ondelete='CASCADE'), nullable=False),
        sa.Column('suggested_memory_id', sa.Integer(), sa.ForeignKey('security_memories.id', ondelete='CASCADE'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('is_relevant', sa.Boolean(), nullable=True),
        sa.Column('remediation_action', sa.String(length=50), nullable=True),
        sa.Column('feedback_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_analyst_feedback_id'), 'analyst_feedback', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_analyst_feedback_id'), table_name='analyst_feedback')
    op.drop_table('analyst_feedback')
    op.drop_index(op.f('ix_security_memories_memory_bank_id'), table_name='security_memories')
    op.drop_index(op.f('ix_security_memories_project_id'), table_name='security_memories')
    op.drop_index(op.f('ix_security_memories_id'), table_name='security_memories')
    op.drop_table('security_memories')
    op.drop_column('project_findings', 'retested_by')
    op.drop_column('project_findings', 'retested_at')
    op.drop_column('project_findings', 'retest_notes')
    op.drop_column('project_findings', 'retest_status')
