from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, CheckConstraint, ARRAY, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    context = Column(Text, nullable=False)
    outcome = Column(Text, nullable=False)
    decision_date = Column(Date, nullable=False, index=True)
    tags = Column(ARRAY(String), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id], back_populates="decisions")
    participants = relationship("DecisionParticipant", back_populates="decision", cascade="all, delete-orphan")
    audit_logs = relationship("DecisionAuditLog", back_populates="decision", cascade="all, delete-orphan")


class DecisionParticipant(Base):
    __tablename__ = "decision_participants"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    decision = relationship("Decision", back_populates="participants")
    user = relationship("User", foreign_keys=[user_id], back_populates="decision_participations")

    # Unique constraint to prevent duplicate participants
    __table_args__ = (
        UniqueConstraint('decision_id', 'user_id', name='uq_decision_participants_decision_user'),
    )


class DecisionAuditLog(Base):
    __tablename__ = "decision_audit_log"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    changed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=False, index=True)
    change_type = Column(String(20), nullable=False, index=True)
    field_name = Column(String(100), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    decision = relationship("Decision", back_populates="audit_logs")
    changed_by = relationship("User", foreign_keys=[changed_by_id], back_populates="decision_audit_logs")

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "change_type IN ('created', 'updated', 'deleted')",
            name="check_decision_audit_change_type"
        ),
    )
