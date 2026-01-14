"""Add decision log and audit trail

Revision ID: 004_decisions
Revises: 003_archived
Create Date: 2024-01-22 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_decisions'
down_revision = '003_archived'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create decisions table
    op.create_table(
        'decisions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_by_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('context', sa.Text(), nullable=False),
        sa.Column('outcome', sa.Text(), nullable=False),
        sa.Column('decision_date', sa.Date(), nullable=False),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for decisions
    op.create_index('idx_decisions_created_by', 'decisions', ['created_by_id'])
    op.create_index('idx_decisions_decision_date', 'decisions', ['decision_date'], postgresql_ops={'decision_date': 'DESC'})
    op.create_index('idx_decisions_tags', 'decisions', ['tags'], postgresql_using='gin')
    op.create_index('idx_decisions_created_at', 'decisions', ['created_at'], postgresql_ops={'created_at': 'DESC'})
    
    # Create full-text search index on title and description
    op.execute("""
        CREATE INDEX idx_decisions_title_description_fts ON decisions 
        USING gin(to_tsvector('english', title || ' ' || description))
    """)
    
    # Create decision_participants table
    op.create_table(
        'decision_participants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('decision_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['decision_id'], ['decisions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('decision_id', 'user_id', name='uq_decision_participants_decision_user')
    )
    
    # Create indexes for decision_participants
    op.create_index('idx_decision_participants_decision', 'decision_participants', ['decision_id'])
    op.create_index('idx_decision_participants_user', 'decision_participants', ['user_id'])
    
    # Create decision_audit_log table
    op.create_table(
        'decision_audit_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('decision_id', sa.Integer(), nullable=False),
        sa.Column('changed_by_id', sa.Integer(), nullable=False),
        sa.Column('change_type', sa.String(length=20), nullable=False),
        sa.Column('field_name', sa.String(length=100), nullable=True),
        sa.Column('old_value', sa.Text(), nullable=True),
        sa.Column('new_value', sa.Text(), nullable=True),
        sa.Column('changed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['decision_id'], ['decisions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['changed_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("change_type IN ('created', 'updated', 'deleted')", name='check_decision_audit_change_type')
    )
    
    # Create indexes for decision_audit_log
    op.create_index('idx_decision_audit_decision', 'decision_audit_log', ['decision_id'])
    op.create_index('idx_decision_audit_changed_by', 'decision_audit_log', ['changed_by_id'])
    op.create_index('idx_decision_audit_changed_at', 'decision_audit_log', ['changed_at'], postgresql_ops={'changed_at': 'DESC'})
    op.create_index('idx_decision_audit_change_type', 'decision_audit_log', ['change_type'])


def downgrade() -> None:
    # Drop decision_audit_log table and indexes
    op.drop_index('idx_decision_audit_change_type', table_name='decision_audit_log')
    op.drop_index('idx_decision_audit_changed_at', table_name='decision_audit_log')
    op.drop_index('idx_decision_audit_changed_by', table_name='decision_audit_log')
    op.drop_index('idx_decision_audit_decision', table_name='decision_audit_log')
    op.drop_table('decision_audit_log')
    
    # Drop decision_participants table and indexes
    op.drop_index('idx_decision_participants_user', table_name='decision_participants')
    op.drop_index('idx_decision_participants_decision', table_name='decision_participants')
    op.drop_table('decision_participants')
    
    # Drop decisions table and indexes
    op.execute('DROP INDEX IF EXISTS idx_decisions_title_description_fts')
    op.drop_index('idx_decisions_created_at', table_name='decisions')
    op.drop_index('idx_decisions_tags', table_name='decisions')
    op.drop_index('idx_decisions_decision_date', table_name='decisions')
    op.drop_index('idx_decisions_created_by', table_name='decisions')
    op.drop_table('decisions')
