from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.dependencies import get_db, get_current_user, get_current_active_admin
from app.db.models.user import User
from app.db.models.blocker import Blocker
from app.db.models.status_update import StatusUpdate
from app.db.models.incident import Incident
from app.schemas.blocker import (
    BlockerCreate,
    BlockerUpdate,
    BlockerResolve,
    Blocker as BlockerSchema,
    BlockerList
)

router = APIRouter()


@router.post("", response_model=BlockerSchema, status_code=status.HTTP_201_CREATED)
async def create_blocker(
    blocker_data: BlockerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new blocker."""
    # Validate related_status_id if provided
    if blocker_data.related_status_id:
        status_update = db.query(StatusUpdate).filter(StatusUpdate.id == blocker_data.related_status_id).first()
        if not status_update:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Related status update not found"
            )
    
    # Validate related_incident_id if provided
    if blocker_data.related_incident_id:
        incident = db.query(Incident).filter(Incident.id == blocker_data.related_incident_id).first()
        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Related incident not found"
            )
    
    new_blocker = Blocker(
        reported_by_id=current_user.id,
        description=blocker_data.description,
        impact=blocker_data.impact,
        related_status_id=blocker_data.related_status_id,
        related_incident_id=blocker_data.related_incident_id,
        status="active"
    )
    
    db.add(new_blocker)
    db.commit()
    db.refresh(new_blocker)
    
    # Load relationships
    db.refresh(new_blocker, ["reported_by"])
    
    return new_blocker


@router.get("", response_model=BlockerList)
async def get_blockers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    archived: Optional[bool] = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of blockers with pagination and filtering."""
    query = db.query(Blocker)
    
    # Filter by archived status (default to False if not specified)
    query = query.filter(Blocker.archived == archived)
    
    # Apply filters
    if status_filter:
        query = query.filter(Blocker.status == status_filter)
    
    # Get total count
    total = query.count()
    
    # Get all blockers first (we'll sort in Python for status priority)
    all_blockers = query.order_by(desc(Blocker.created_at)).all()
    
    # Sort: active first, then resolved, both by newest first
    all_blockers.sort(key=lambda x: (x.status != "active", x.created_at), reverse=True)
    
    # Apply pagination
    blockers = all_blockers[(page - 1) * limit:page * limit]
    
    # Load relationships
    for blocker in blockers:
        db.refresh(blocker, ["reported_by"])
    
    return {
        "items": blockers,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/{blocker_id}", response_model=BlockerSchema)
async def get_blocker(
    blocker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single blocker by ID."""
    blocker = db.query(Blocker).filter(Blocker.id == blocker_id).first()
    
    if not blocker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blocker not found"
        )
    
    db.refresh(blocker, ["reported_by"])
    
    return blocker


@router.patch("/{blocker_id}", response_model=BlockerSchema)
async def update_blocker(
    blocker_id: int,
    blocker_data: BlockerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a blocker."""
    blocker = db.query(Blocker).filter(Blocker.id == blocker_id).first()
    
    if not blocker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blocker not found"
        )
    
    # Validate related_status_id if provided
    if blocker_data.related_status_id is not None:
        if blocker_data.related_status_id:
            status_update = db.query(StatusUpdate).filter(StatusUpdate.id == blocker_data.related_status_id).first()
            if not status_update:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Related status update not found"
                )
    
    # Validate related_incident_id if provided
    if blocker_data.related_incident_id is not None:
        if blocker_data.related_incident_id:
            incident = db.query(Incident).filter(Incident.id == blocker_data.related_incident_id).first()
            if not incident:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Related incident not found"
                )
    
    # Update fields
    update_data = blocker_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(blocker, field, value)
    
    db.commit()
    db.refresh(blocker)
    db.refresh(blocker, ["reported_by"])
    
    return blocker


@router.patch("/{blocker_id}/resolve", response_model=BlockerSchema)
async def resolve_blocker(
    blocker_id: int,
    resolve_data: BlockerResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resolve a blocker."""
    blocker = db.query(Blocker).filter(Blocker.id == blocker_id).first()
    
    if not blocker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blocker not found"
        )
    
    # Update status and resolution notes
    blocker.status = "resolved"
    if resolve_data.resolution_notes:
        blocker.resolution_notes = resolve_data.resolution_notes
    
    # Set resolved_at if not already set
    if not blocker.resolved_at:
        blocker.resolved_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(blocker)
    db.refresh(blocker, ["reported_by"])
    
    return blocker


@router.patch("/{blocker_id}/reopen", response_model=BlockerSchema)
async def reopen_blocker(
    blocker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reopen a resolved blocker (change status from resolved to active)."""
    blocker = db.query(Blocker).filter(Blocker.id == blocker_id).first()
    
    if not blocker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blocker not found"
        )
    
    if blocker.archived:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reopen archived blockers. Please unarchive first."
        )
    
    if blocker.status != "resolved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only reopen resolved blockers"
        )
    
    # Change status back to active
    blocker.status = "active"
    # Clear resolved_at timestamp
    blocker.resolved_at = None
    
    db.commit()
    db.refresh(blocker)
    db.refresh(blocker, ["reported_by"])
    
    return blocker


@router.patch("/{blocker_id}/archive", response_model=BlockerSchema)
async def archive_blocker(
    blocker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Archive a blocker."""
    blocker = db.query(Blocker).filter(Blocker.id == blocker_id).first()
    
    if not blocker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blocker not found"
        )
    
    blocker.archived = True
    db.commit()
    db.refresh(blocker)
    db.refresh(blocker, ["reported_by"])
    
    return blocker


@router.patch("/{blocker_id}/unarchive", response_model=BlockerSchema)
async def unarchive_blocker(
    blocker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unarchive a blocker."""
    blocker = db.query(Blocker).filter(Blocker.id == blocker_id).first()
    
    if not blocker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blocker not found"
        )
    
    blocker.archived = False
    db.commit()
    db.refresh(blocker)
    db.refresh(blocker, ["reported_by"])
    
    return blocker


@router.delete("/{blocker_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blocker(
    blocker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """Permanently delete an archived blocker (admin only)."""
    blocker = db.query(Blocker).filter(Blocker.id == blocker_id).first()
    
    if not blocker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blocker not found"
        )
    
    if not blocker.archived:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete archived blockers"
        )
    
    db.delete(blocker)
    db.commit()
    
    return None
