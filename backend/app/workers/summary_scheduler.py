"""
Background worker for generating daily summaries.
"""
import time
import logging
from datetime import datetime, timezone

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.summary_service import create_daily_summary

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _should_run_today(now: datetime) -> bool:
    run_hour = settings.DAILY_SUMMARY_RUN_HOUR_UTC
    run_minute = settings.DAILY_SUMMARY_RUN_MINUTE_UTC
    return (now.hour, now.minute) >= (run_hour, run_minute)


def main():
    """Main worker loop."""
    logger.info("Summary scheduler worker started")
    last_run_date = None

    while True:
        now = datetime.now(timezone.utc)
        if _should_run_today(now) and last_run_date != now.date():
            db = None
            try:
                db = SessionLocal()
                summary = create_daily_summary(db, summary_date=now.date())
                last_run_date = summary.summary_date
                logger.info("Daily summary generated for %s", summary.summary_date)
            except Exception:
                logger.exception("Daily summary generation failed")
                time.sleep(settings.DAILY_SUMMARY_RETRY_INTERVAL_SECONDS)
                continue
            finally:
                if db:
                    db.close()

        time.sleep(settings.DAILY_SUMMARY_POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
