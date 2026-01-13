"""Add core features - status updates, incidents, blockers

Revision ID: 002_core_features
Revises: 001_initial
Create Date: 2024-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_core_features'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create status_updates table
    op.create_table(
        'status_updates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for status_updates
    op.create_index('idx_status_updates_user_id', 'status_updates', ['user_id'])
    op.create_index('idx_status_updates_created_at', 'status_updates', ['created_at'], postgresql_ops={'created_at': 'DESC'})
    op.create_index('idx_status_updates_tags', 'status_updates', ['tags'], postgresql_using='gin')

    # Create incidents table
    op.create_table(
        'incidents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('reported_by_id', sa.Integer(), nullable=False),
        sa.Column('assigned_to_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='open'),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['reported_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['assigned_to_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("severity IN ('low', 'medium', 'high', 'critical')", name='check_incident_severity'),
        sa.CheckConstraint("status IN ('open', 'in_progress', 'resolved', 'closed')", name='check_incident_status')
    )
    
    # Create indexes for incidents
    op.create_index('idx_incidents_reported_by', 'incidents', ['reported_by_id'])
    op.create_index('idx_incidents_assigned_to', 'incidents', ['assigned_to_id'])
    op.create_index('idx_incidents_status', 'incidents', ['status'])
    op.create_index('idx_incidents_severity', 'incidents', ['severity'])
    op.create_index('idx_incidents_created_at', 'incidents', ['created_at'], postgresql_ops={'created_at': 'DESC'})
    op.create_index('idx_incidents_status_severity', 'incidents', ['status', 'severity'])

    # Create blockers table
    op.create_table(
        'blockers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('reported_by_id', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('impact', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('related_status_id', sa.Integer(), nullable=True),
        sa.Column('related_incident_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['reported_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['related_status_id'], ['status_updates.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['related_incident_id'], ['incidents.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("status IN ('active', 'resolved')", name='check_blocker_status')
    )
    
    # Create indexes for blockers
    op.create_index('idx_blockers_reported_by', 'blockers', ['reported_by_id'])
    op.create_index('idx_blockers_status', 'blockers', ['status'])
    op.create_index('idx_blockers_created_at', 'blockers', ['created_at'], postgresql_ops={'created_at': 'DESC'})
    op.create_index('idx_blockers_related_status', 'blockers', ['related_status_id'])
    op.create_index('idx_blockers_related_incident', 'blockers', ['related_incident_id'])


def downgrade() -> None:
    # Drop blockers table and indexes
    op.drop_index('idx_blockers_related_incident', table_name='blockers')
    op.drop_index('idx_blockers_related_status', table_name='blockers')
    op.drop_index('idx_blockers_created_at', table_name='blockers')
    op.drop_index('idx_blockers_status', table_name='blockers')
    op.drop_index('idx_blockers_reported_by', table_name='blockers')
    op.drop_table('blockers')

    # Drop incidents table and indexes
    op.drop_index('idx_incidents_status_severity', table_name='incidents')
    op.drop_index('idx_incidents_created_at', table_name='incidents')
    op.drop_index('idx_incidents_severity', table_name='incidents')
    op.drop_index('idx_incidents_status', table_name='incidents')
    op.drop_index('idx_incidents_assigned_to', table_name='incidents')
    op.drop_index('idx_incidents_reported_by', table_name='incidents')
    op.drop_table('incidents')

    # Drop status_updates table and indexes
    op.drop_index('idx_status_updates_tags', table_name='status_updates')
    op.drop_index('idx_status_updates_created_at', table_name='status_updates')
    op.drop_index('idx_status_updates_user_id', table_name='status_updates')
    op.drop_table('status_updates')
