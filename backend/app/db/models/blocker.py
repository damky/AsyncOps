from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Blocker(Base):
    __tablename__ = "blockers"

    id = Column(Integer, primary_key=True, index=True)
    reported_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    impact = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="active", index=True)
    resolution_notes = Column(Text, nullable=True)
    related_status_id = Column(Integer, ForeignKey("status_updates.id", ondelete="SET NULL"), nullable=True, index=True)
    related_incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    reported_by = relationship("User", back_populates="blockers")
    related_status = relationship("StatusUpdate", back_populates="blockers")
    related_incident = relationship("Incident", back_populates="blockers")

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'resolved')",
            name="check_blocker_status"
        ),
    )
