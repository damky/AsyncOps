"""Add daily summaries table

Revision ID: 005_daily_summaries
Revises: 004_decisions
Create Date: 2026-01-14 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005_daily_summaries'
down_revision = '004_decisions'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'daily_summaries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('summary_date', sa.Date(), nullable=False),
        sa.Column('content', postgresql.JSONB(), nullable=False),
        sa.Column('status_updates_count', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('incidents_count', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('blockers_count', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('decisions_count', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index(
        'idx_daily_summaries_date',
        'daily_summaries',
        ['summary_date'],
        unique=True,
        postgresql_ops={'summary_date': 'DESC'}
    )
    op.create_index(
        'idx_daily_summaries_generated_at',
        'daily_summaries',
        ['generated_at'],
        postgresql_ops={'generated_at': 'DESC'}
    )


def downgrade() -> None:
    op.drop_index('idx_daily_summaries_generated_at', table_name='daily_summaries')
    op.drop_index('idx_daily_summaries_date', table_name='daily_summaries')
    op.drop_table('daily_summaries')
