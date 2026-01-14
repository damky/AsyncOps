from pydantic import BaseModel
from datetime import datetime, date
from typing import List


class DailySummaryStatusUpdate(BaseModel):
    id: int
    title: str
    author: str
    created_at: datetime


class DailySummaryIncident(BaseModel):
    id: int
    title: str
    severity: str
    status: str


class DailySummaryBlocker(BaseModel):
    id: int
    description: str
    status: str


class DailySummaryDecision(BaseModel):
    id: int
    title: str
    decision_date: date


class DailySummaryStatistics(BaseModel):
    total_status_updates: int
    critical_incidents: int
    active_blockers: int
    decisions_last_7_days: int


class DailySummaryContent(BaseModel):
    status_updates: List[DailySummaryStatusUpdate]
    incidents: List[DailySummaryIncident]
    blockers: List[DailySummaryBlocker]
    recent_decisions: List[DailySummaryDecision]
    statistics: DailySummaryStatistics


class DailySummaryListItem(BaseModel):
    id: int
    summary_date: date
    status_updates_count: int
    incidents_count: int
    blockers_count: int
    decisions_count: int
    generated_at: datetime

    class Config:
        from_attributes = True


class DailySummary(BaseModel):
    id: int
    summary_date: date
    content: DailySummaryContent
    status_updates_count: int
    incidents_count: int
    blockers_count: int
    decisions_count: int
    generated_at: datetime

    class Config:
        from_attributes = True


class DailySummaryList(BaseModel):
    items: List[DailySummaryListItem]
    total: int
    page: int
    limit: int
