from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.dependencies import get_db, get_current_user, get_current_active_admin
from app.db.models.user import User
from app.db.models.daily_summary import DailySummary
from app.schemas.daily_summary import DailySummary as DailySummarySchema, DailySummaryList
from app.services.summary_service import create_daily_summary

router = APIRouter()


@router.post(
    "/generate",
    response_model=DailySummarySchema,
    status_code=status.HTTP_201_CREATED,
    operation_id="generate_daily_summary",
    summary="Generate daily summary (admin only)"
)
async def generate_daily_summary(
    summary_date: Optional[date] = Query(None),
    force_update: bool = Query(False, description="Force update existing summary with latest data"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """Generate a daily summary for testing. If a summary already exists for the date,
    it will be updated with latest data if force_update=True, otherwise the existing summary is returned."""
    import logging
    logger = logging.getLogger(__name__)
    # FastAPI should handle boolean parsing, but ensure it's a boolean
    # Handle both bool and string representations
    if isinstance(force_update, str):
        force_update_bool = force_update.lower() in ('true', '1', 'yes', 'on')
    else:
        force_update_bool = bool(force_update)
    logger.info(f"generate_daily_summary called: summary_date={summary_date}, force_update={force_update} (type: {type(force_update)}) -> {force_update_bool}")
    return create_daily_summary(db, summary_date=summary_date, force_update=force_update_bool)


@router.get("", response_model=DailySummaryList)
async def list_daily_summaries(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List daily summaries with pagination and date filtering."""
    query = db.query(DailySummary)

    if start_date:
        query = query.filter(DailySummary.summary_date >= start_date)

    if end_date:
        query = query.filter(DailySummary.summary_date <= end_date)

    total = query.count()
    summaries = (
        query.order_by(desc(DailySummary.summary_date))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "items": summaries,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("/{summary_id}", response_model=DailySummarySchema)
async def get_daily_summary(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single daily summary by ID."""
    summary = db.query(DailySummary).filter(DailySummary.id == summary_id).first()

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily summary not found"
        )

    return summary
