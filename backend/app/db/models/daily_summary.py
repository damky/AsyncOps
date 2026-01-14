from sqlalchemy import Column, Integer, Date, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.base import Base


class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id = Column(Integer, primary_key=True, index=True)
    summary_date = Column(Date, nullable=False, unique=True, index=True)
    content = Column(JSONB, nullable=False)
    status_updates_count = Column(Integer, nullable=False, server_default="0")
    incidents_count = Column(Integer, nullable=False, server_default="0")
    blockers_count = Column(Integer, nullable=False, server_default="0")
    decisions_count = Column(Integer, nullable=False, server_default="0")
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
