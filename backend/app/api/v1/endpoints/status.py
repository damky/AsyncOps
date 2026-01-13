from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from app.core.dependencies import get_db, get_current_user
from app.db.models.user import User
from app.db.models.status_update import StatusUpdate
from app.schemas.status_update import (
    StatusUpdateCreate,
    StatusUpdateUpdate,
    StatusUpdate as StatusUpdateSchema,
    StatusUpdateList
)

router = APIRouter()


@router.post("", response_model=StatusUpdateSchema, status_code=status.HTTP_201_CREATED)
async def create_status_update(
    status_data: StatusUpdateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new status update."""
    new_status = StatusUpdate(
        user_id=current_user.id,
        title=status_data.title,
        content=status_data.content,
        tags=status_data.tags
    )
    
    db.add(new_status)
    db.commit()
    db.refresh(new_status)
    
    # Load user relationship
    db.refresh(new_status, ["user"])
    
    return new_status


@router.get("", response_model=StatusUpdateList)
async def get_status_updates(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    author_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of status updates with pagination and filtering."""
    query = db.query(StatusUpdate)
    
    # Apply filters
    if author_id:
        query = query.filter(StatusUpdate.user_id == author_id)
    
    if start_date:
        query = query.filter(StatusUpdate.created_at >= start_date)
    
    if end_date:
        query = query.filter(StatusUpdate.created_at <= end_date)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    status_updates = query.order_by(desc(StatusUpdate.created_at)).offset((page - 1) * limit).limit(limit).all()
    
    # Load user relationships
    for status_update in status_updates:
        db.refresh(status_update, ["user"])
    
    return {
        "items": status_updates,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/{status_id}", response_model=StatusUpdateSchema)
async def get_status_update(
    status_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single status update by ID."""
    status_update = db.query(StatusUpdate).filter(StatusUpdate.id == status_id).first()
    
    if not status_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status update not found"
        )
    
    db.refresh(status_update, ["user"])
    
    return status_update


@router.patch("/{status_id}", response_model=StatusUpdateSchema)
async def update_status_update(
    status_id: int,
    status_data: StatusUpdateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a status update (author only)."""
    status_update = db.query(StatusUpdate).filter(StatusUpdate.id == status_id).first()
    
    if not status_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status update not found"
        )
    
    # Check authorization
    if status_update.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this status update"
        )
    
    # Update fields
    update_data = status_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(status_update, field, value)
    
    db.commit()
    db.refresh(status_update)
    db.refresh(status_update, ["user"])
    
    return status_update


@router.delete("/{status_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_status_update(
    status_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a status update (author only)."""
    status_update = db.query(StatusUpdate).filter(StatusUpdate.id == status_id).first()
    
    if not status_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status update not found"
        )
    
    # Check authorization
    if status_update.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this status update"
        )
    
    db.delete(status_update)
    db.commit()
    
    return None
