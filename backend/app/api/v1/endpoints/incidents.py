from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from app.core.dependencies import get_db, get_current_user, get_current_active_admin
from app.db.models.user import User
from app.db.models.incident import Incident
from app.schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
    IncidentStatusUpdate,
    IncidentAssign,
    Incident as IncidentSchema,
    IncidentList
)

router = APIRouter()


@router.post(
    "", 
    response_model=IncidentSchema, 
    status_code=status.HTTP_201_CREATED, 
    operation_id="create_incident",
    summary="Create a new incident"
)
async def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new incident. POST to /api/incidents (no ID in path)."""
    # Validate assigned_to_id if provided
    if incident_data.assigned_to_id:
        assigned_user = db.query(User).filter(User.id == incident_data.assigned_to_id).first()
        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )
    
    new_incident = Incident(
        reported_by_id=current_user.id,
        assigned_to_id=incident_data.assigned_to_id,
        title=incident_data.title,
        description=incident_data.description,
        severity=incident_data.severity,
        status="open"
    )
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    
    # Load relationships
    db.refresh(new_incident, ["reported_by", "assigned_to"])
    
    return new_incident


@router.get("", response_model=IncidentList)
async def get_incidents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = Query(None),
    assigned_to_id: Optional[int] = Query(None),
    archived: Optional[bool] = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of incidents with pagination and filtering."""
    query = db.query(Incident)
    
    # Filter by archived status (default to False if not specified)
    query = query.filter(Incident.archived == archived)
    
    # Apply filters
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    
    if severity:
        query = query.filter(Incident.severity == severity)
    
    if assigned_to_id:
        query = query.filter(Incident.assigned_to_id == assigned_to_id)
    
    # Get total count
    total = query.count()
    
    # Apply ordering: severity (critical first), then created_at (newest first)
    # Map severity to numeric order for sorting
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    
    incidents = query.all()
    incidents.sort(key=lambda x: (severity_order.get(x.severity, 99), x.created_at), reverse=True)
    
    # Apply pagination
    incidents = incidents[(page - 1) * limit:page * limit]
    
    # Load relationships
    for incident in incidents:
        db.refresh(incident, ["reported_by", "assigned_to"])
    
    return {
        "items": incidents,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/{incident_id}", response_model=IncidentSchema)
async def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single incident by ID."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    db.refresh(incident, ["reported_by", "assigned_to"])
    
    return incident


@router.patch(
    "/{incident_id}", 
    response_model=IncidentSchema, 
    operation_id="update_incident",
    summary="Update an existing incident"
)
async def update_incident(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an incident by ID. Use PATCH method to /api/incidents/{incident_id}, not POST."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    # Validate assigned_to_id if provided
    if incident_data.assigned_to_id is not None:
        if incident_data.assigned_to_id:
            assigned_user = db.query(User).filter(User.id == incident_data.assigned_to_id).first()
            if not assigned_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assigned user not found"
                )
    
    # Update fields
    update_data = incident_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(incident, field, value)
    
    db.commit()
    db.refresh(incident)
    db.refresh(incident, ["reported_by", "assigned_to"])
    
    return incident


@router.patch("/{incident_id}/status", response_model=IncidentSchema)
async def update_incident_status(
    incident_id: int,
    status_data: IncidentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update incident status."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    # Update status
    incident.status = status_data.status
    if status_data.resolution_notes:
        incident.resolution_notes = status_data.resolution_notes
    
    # Set resolved_at if status is resolved or closed
    if status_data.status in ["resolved", "closed"] and not incident.resolved_at:
        incident.resolved_at = datetime.now(timezone.utc)
    elif status_data.status not in ["resolved", "closed"]:
        incident.resolved_at = None
    
    db.commit()
    db.refresh(incident)
    db.refresh(incident, ["reported_by", "assigned_to"])
    
    return incident


@router.patch("/{incident_id}/assign", response_model=IncidentSchema)
async def assign_incident(
    incident_id: int,
    assign_data: IncidentAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assign or unassign an incident to a user."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    # Validate assigned_to_id if provided
    if assign_data.assigned_to_id is not None:
        if assign_data.assigned_to_id:
            assigned_user = db.query(User).filter(User.id == assign_data.assigned_to_id).first()
            if not assigned_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assigned user not found"
                )
        incident.assigned_to_id = assign_data.assigned_to_id
    
    db.commit()
    db.refresh(incident)
    db.refresh(incident, ["reported_by", "assigned_to"])
    
    return incident


@router.patch("/{incident_id}/archive", response_model=IncidentSchema)
async def archive_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Archive an incident."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    incident.archived = True
    db.commit()
    db.refresh(incident)
    db.refresh(incident, ["reported_by", "assigned_to"])
    
    return incident


@router.patch("/{incident_id}/unarchive", response_model=IncidentSchema)
async def unarchive_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unarchive an incident."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    incident.archived = False
    db.commit()
    db.refresh(incident)
    db.refresh(incident, ["reported_by", "assigned_to"])
    
    return incident


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """Permanently delete an archived incident (admin only)."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    if not incident.archived:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete archived incidents"
        )
    
    db.delete(incident)
    db.commit()
    
    return None
