from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="member")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    status_updates = relationship("StatusUpdate", back_populates="user", cascade="all, delete-orphan")
    reported_incidents = relationship("Incident", foreign_keys="Incident.reported_by_id", back_populates="reported_by")
    assigned_incidents = relationship("Incident", foreign_keys="Incident.assigned_to_id", back_populates="assigned_to")
    blockers = relationship("Blocker", back_populates="reported_by", cascade="all, delete-orphan")
    decisions = relationship("Decision", foreign_keys="Decision.created_by_id", back_populates="created_by", cascade="all, delete-orphan")
    decision_participations = relationship("DecisionParticipant", foreign_keys="DecisionParticipant.user_id", back_populates="user", cascade="all, delete-orphan")
    decision_audit_logs = relationship("DecisionAuditLog", foreign_keys="DecisionAuditLog.changed_by_id", back_populates="changed_by", cascade="all, delete-orphan")
