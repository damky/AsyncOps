from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_, func
from sqlalchemy.dialects.postgresql import array
from app.core.dependencies import get_db, get_current_user, get_current_active_admin
from app.db.models.user import User
from app.db.models.decision import Decision, DecisionParticipant, DecisionAuditLog
from app.schemas.decision import (
    DecisionCreate,
    DecisionUpdate,
    Decision as DecisionSchema,
    DecisionList,
    DecisionAuditLogEntry,
    DecisionAuditLogResponse
)

router = APIRouter()


def _log_audit_entry(
    db: Session,
    decision_id: int,
    changed_by_id: int,
    change_type: str,
    field_name: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None
):
    """Helper function to log audit trail entries."""
    audit_entry = DecisionAuditLog(
        decision_id=decision_id,
        changed_by_id=changed_by_id,
        change_type=change_type,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value
    )
    db.add(audit_entry)
    db.flush()


@router.post(
    "",
    response_model=DecisionSchema,
    status_code=status.HTTP_201_CREATED,
    operation_id="create_decision",
    summary="Create a new decision"
)
async def create_decision(
    decision_data: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new decision with participants."""
    # Validate participant IDs if provided
    participant_ids = decision_data.participant_ids or []
    if participant_ids:
        participant_users = db.query(User).filter(User.id.in_(participant_ids)).all()
        if len(participant_users) != len(participant_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more participant users not found"
            )
    
    # Create decision
    new_decision = Decision(
        created_by_id=current_user.id,
        title=decision_data.title,
        description=decision_data.description,
        context=decision_data.context,
        outcome=decision_data.outcome,
        decision_date=decision_data.decision_date,
        tags=decision_data.tags
    )
    
    db.add(new_decision)
    db.flush()  # Flush to get the ID
    
    # Create participants
    for user_id in participant_ids:
        participant = DecisionParticipant(
            decision_id=new_decision.id,
            user_id=user_id
        )
        db.add(participant)
    
    # Log creation in audit trail
    _log_audit_entry(
        db=db,
        decision_id=new_decision.id,
        changed_by_id=current_user.id,
        change_type="created"
    )
    
    db.commit()
    db.refresh(new_decision)
    
    # Load relationships
    db.refresh(new_decision, ["created_by", "participants"])
    for participant in new_decision.participants:
        db.refresh(participant, ["user"])
    
    return new_decision


@router.get("", response_model=DecisionList)
async def get_decisions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    participant_id: Optional[int] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of decisions with filtering and search."""
    query = db.query(Decision)
    
    # Apply filters
    if start_date:
        query = query.filter(Decision.decision_date >= start_date)
    
    if end_date:
        query = query.filter(Decision.decision_date <= end_date)
    
    if participant_id:
        query = query.join(DecisionParticipant).filter(
            DecisionParticipant.user_id == participant_id
        ).distinct()
    
    if tag:
        query = query.filter(Decision.tags.contains([tag]))
    
    if search:
        # Full-text search on title and description
        search_filter = or_(
            Decision.title.ilike(f"%{search}%"),
            Decision.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count
    total = query.count()
    
    # Apply ordering: decision_date DESC (newest first)
    query = query.order_by(desc(Decision.decision_date))
    
    # Apply pagination
    decisions = query.offset((page - 1) * limit).limit(limit).all()
    
    # Load relationships
    for decision in decisions:
        db.refresh(decision, ["created_by", "participants"])
        for participant in decision.participants:
            db.refresh(participant, ["user"])
    
    return {
        "items": decisions,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/{decision_id}", response_model=DecisionSchema)
async def get_decision(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single decision by ID."""
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Decision not found"
        )
    
    db.refresh(decision, ["created_by", "participants"])
    for participant in decision.participants:
        db.refresh(participant, ["user"])
    
    return decision


@router.patch(
    "/{decision_id}",
    response_model=DecisionSchema,
    operation_id="update_decision",
    summary="Update an existing decision"
)
async def update_decision(
    decision_id: int,
    decision_data: DecisionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a decision. Only creator or admin can update."""
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Decision not found"
        )
    
    # Check authorization: only creator or admin can update
    if decision.created_by_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the decision creator or admin can update decisions"
        )
    
    # Validate participant IDs if provided
    if decision_data.participant_ids is not None:
        participant_ids = decision_data.participant_ids
        if participant_ids:
            participant_users = db.query(User).filter(User.id.in_(participant_ids)).all()
            if len(participant_users) != len(participant_ids):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="One or more participant users not found"
                )
    
    # Track changes for audit trail
    update_data = decision_data.model_dump(exclude_unset=True)
    participant_ids_to_update = update_data.pop("participant_ids", None)
    
    # Log field changes
    for field, new_value in update_data.items():
        old_value = getattr(decision, field)
        if old_value != new_value:
            # Convert to string for storage
            old_str = str(old_value) if old_value is not None else None
            new_str = str(new_value) if new_value is not None else None
            _log_audit_entry(
                db=db,
                decision_id=decision.id,
                changed_by_id=current_user.id,
                change_type="updated",
                field_name=field,
                old_value=old_str,
                new_value=new_str
            )
            setattr(decision, field, new_value)
    
    # Update participants if provided
    if participant_ids_to_update is not None:
        # Remove existing participants
        db.query(DecisionParticipant).filter(
            DecisionParticipant.decision_id == decision.id
        ).delete()
        
        # Add new participants
        for user_id in participant_ids_to_update:
            participant = DecisionParticipant(
                decision_id=decision.id,
                user_id=user_id
            )
            db.add(participant)
        
        # Log participant change
        _log_audit_entry(
            db=db,
            decision_id=decision.id,
            changed_by_id=current_user.id,
            change_type="updated",
            field_name="participants",
            old_value=None,  # Could track old participants if needed
            new_value=str(participant_ids_to_update)
        )
    
    db.commit()
    db.refresh(decision)
    db.refresh(decision, ["created_by", "participants"])
    for participant in decision.participants:
        db.refresh(participant, ["user"])
    
    return decision


@router.delete(
    "/{decision_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="delete_decision",
    summary="Delete a decision"
)
async def delete_decision(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a decision. Only creator or admin can delete."""
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Decision not found"
        )
    
    # Check authorization: only creator or admin can delete
    if decision.created_by_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the decision creator or admin can delete decisions"
        )
    
    # Log deletion in audit trail
    _log_audit_entry(
        db=db,
        decision_id=decision.id,
        changed_by_id=current_user.id,
        change_type="deleted"
    )
    
    # Delete the decision (cascade will handle participants and audit logs)
    db.delete(decision)
    db.commit()
    
    return None


@router.get(
    "/{decision_id}/audit",
    response_model=DecisionAuditLogResponse,
    operation_id="get_decision_audit",
    summary="Get audit trail for a decision"
)
async def get_decision_audit(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the audit trail for a decision."""
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Decision not found"
        )
    
    # Get audit log entries
    audit_entries = db.query(DecisionAuditLog).filter(
        DecisionAuditLog.decision_id == decision_id
    ).order_by(desc(DecisionAuditLog.changed_at)).all()
    
    # Load relationships
    for entry in audit_entries:
        db.refresh(entry, ["changed_by"])
    
    return {
        "items": audit_entries
    }
