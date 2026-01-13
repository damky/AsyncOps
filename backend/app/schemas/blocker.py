from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal, List
from app.schemas.user import UserResponse


class BlockerBase(BaseModel):
    description: str = Field(..., max_length=2000)
    impact: str = Field(..., max_length=1000)
    related_status_id: Optional[int] = None
    related_incident_id: Optional[int] = None


class BlockerCreate(BlockerBase):
    pass


class BlockerUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=2000)
    impact: Optional[str] = Field(None, max_length=1000)
    related_status_id: Optional[int] = None
    related_incident_id: Optional[int] = None


class BlockerResolve(BaseModel):
    resolution_notes: Optional[str] = Field(None, max_length=1000)


class Blocker(BlockerBase):
    id: int
    reported_by_id: int
    status: Literal["active", "resolved"]
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    reported_by: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class BlockerList(BaseModel):
    items: List[Blocker]
    total: int
    page: int
    limit: int
