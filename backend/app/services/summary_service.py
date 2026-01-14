from datetime import datetime, timedelta, timezone, date
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.db.models.daily_summary import DailySummary
from app.db.models.status_update import StatusUpdate
from app.db.models.incident import Incident
from app.db.models.blocker import Blocker
from app.db.models.decision import Decision
from app.db.models.user import User


def _build_summary_content(db: Session, now: datetime) -> Dict[str, Any]:
    since = now - timedelta(hours=24)
    decisions_since = (now.date() - timedelta(days=7))

    status_updates = (
        db.query(StatusUpdate)
        .join(User)
        .filter(StatusUpdate.created_at >= since)
        .order_by(desc(StatusUpdate.created_at))
        .all()
    )
    incidents = (
        db.query(Incident)
        .filter(
            Incident.archived.is_(False),
            Incident.status.in_(["open", "in_progress"])
        )
        .order_by(desc(Incident.severity), desc(Incident.created_at))
        .all()
    )
    blockers = (
        db.query(Blocker)
        .filter(Blocker.archived.is_(False), Blocker.status == "active")
        .order_by(desc(Blocker.created_at))
        .all()
    )
    decisions = (
        db.query(Decision)
        .filter(Decision.decision_date >= decisions_since)
        .order_by(desc(Decision.decision_date))
        .all()
    )

    critical_incidents = (
        db.query(func.count(Incident.id))
        .filter(
            Incident.archived.is_(False),
            Incident.status.in_(["open", "in_progress"]),
            Incident.severity == "critical"
        )
        .scalar()
        or 0
    )

    content = {
        "status_updates": [
            {
                "id": update.id,
                "title": update.title,
                "author": update.user.full_name if update.user else "Unknown",
                "created_at": update.created_at.isoformat(),
            }
            for update in status_updates
        ],
        "incidents": [
            {
                "id": incident.id,
                "title": incident.title,
                "severity": incident.severity,
                "status": incident.status,
            }
            for incident in incidents
        ],
        "blockers": [
            {
                "id": blocker.id,
                "description": blocker.description,
                "status": blocker.status,
            }
            for blocker in blockers
        ],
        "recent_decisions": [
            {
                "id": decision.id,
                "title": decision.title,
                "decision_date": decision.decision_date.isoformat(),
            }
            for decision in decisions
        ],
        "statistics": {
            "total_status_updates": len(status_updates),
            "critical_incidents": critical_incidents,
            "active_blockers": len(blockers),
            "decisions_last_7_days": len(decisions),
        },
    }

    return {
        "content": content,
        "status_updates_count": len(status_updates),
        "incidents_count": len(incidents),
        "blockers_count": len(blockers),
        "decisions_count": len(decisions),
    }


def create_daily_summary(
    db: Session,
    summary_date: Optional[date] = None
) -> DailySummary:
    now = datetime.now(timezone.utc)
    summary_date = summary_date or now.date()

    existing = db.query(DailySummary).filter(
        DailySummary.summary_date == summary_date
    ).first()
    if existing:
        return existing

    summary_payload = _build_summary_content(db, now)

    summary = DailySummary(
        summary_date=summary_date,
        content=summary_payload["content"],
        status_updates_count=summary_payload["status_updates_count"],
        incidents_count=summary_payload["incidents_count"],
        blockers_count=summary_payload["blockers_count"],
        decisions_count=summary_payload["decisions_count"],
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    return summary
