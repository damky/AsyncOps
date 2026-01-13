from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.user import UserResponse


class StatusUpdateBase(BaseModel):
    title: str = Field(..., max_length=200)
    content: str = Field(..., max_length=10000)
    tags: Optional[List[str]] = None


class StatusUpdateCreate(StatusUpdateBase):
    pass


class StatusUpdateUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, max_length=10000)
    tags: Optional[List[str]] = None


class StatusUpdate(StatusUpdateBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class StatusUpdateList(BaseModel):
    items: List[StatusUpdate]
    total: int
    page: int
    limit: int
