"""Add archived field to incidents and blockers

Revision ID: 003_archived
Revises: 002_core_features
Create Date: 2024-01-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_archived'
down_revision = '002_core_features'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add archived column to incidents table
    op.add_column('incidents', sa.Column('archived', sa.Boolean(), nullable=False, server_default='false'))
    op.create_index('ix_incidents_archived', 'incidents', ['archived'])
    
    # Add archived column to blockers table
    op.add_column('blockers', sa.Column('archived', sa.Boolean(), nullable=False, server_default='false'))
    op.create_index('ix_blockers_archived', 'blockers', ['archived'])


def downgrade() -> None:
    # Remove indexes
    op.drop_index('ix_blockers_archived', table_name='blockers')
    op.drop_index('ix_incidents_archived', table_name='incidents')
    
    # Remove archived columns
    op.drop_column('blockers', 'archived')
    op.drop_column('incidents', 'archived')
