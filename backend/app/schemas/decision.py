from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List
from app.schemas.user import UserResponse


class DecisionBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=5000)
    context: str = Field(..., max_length=5000)
    outcome: str = Field(..., max_length=5000)
    decision_date: date
    tags: Optional[List[str]] = None
    participant_ids: Optional[List[int]] = None


class DecisionCreate(DecisionBase):
    pass


class DecisionUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    context: Optional[str] = Field(None, max_length=5000)
    outcome: Optional[str] = Field(None, max_length=5000)
    decision_date: Optional[date] = None
    tags: Optional[List[str]] = None
    participant_ids: Optional[List[int]] = None


class DecisionParticipantResponse(BaseModel):
    id: int
    user_id: int
    user: Optional[UserResponse] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class Decision(DecisionBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UserResponse] = None
    participants: Optional[List[DecisionParticipantResponse]] = None
    
    class Config:
        from_attributes = True


class DecisionList(BaseModel):
    items: List[Decision]
    total: int
    page: int
    limit: int


class DecisionAuditLogEntry(BaseModel):
    id: int
    decision_id: int
    changed_by_id: int
    change_type: str
    field_name: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    changed_at: datetime
    changed_by: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class DecisionAuditLogResponse(BaseModel):
    items: List[DecisionAuditLogEntry]
