from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal, List
from app.schemas.user import UserResponse


class IncidentBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=5000)
    severity: Literal["low", "medium", "high", "critical"] = "medium"
    assigned_to_id: Optional[int] = None


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    severity: Optional[Literal["low", "medium", "high", "critical"]] = None
    assigned_to_id: Optional[int] = None


class IncidentStatusUpdate(BaseModel):
    status: Literal["open", "in_progress", "resolved", "closed"]
    resolution_notes: Optional[str] = Field(None, max_length=5000)


class IncidentAssign(BaseModel):
    assigned_to_id: Optional[int] = None


class Incident(IncidentBase):
    id: int
    reported_by_id: int
    status: Literal["open", "in_progress", "resolved", "closed"]
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    reported_by: Optional[UserResponse] = None
    assigned_to: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class IncidentList(BaseModel):
    items: List[Incident]
    total: int
    page: int
    limit: int
