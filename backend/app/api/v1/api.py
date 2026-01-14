from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, status, incidents, blockers, decisions, summaries

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(status.router, prefix="/status", tags=["status updates"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
api_router.include_router(blockers.router, prefix="/blockers", tags=["blockers"])
api_router.include_router(decisions.router, prefix="/decisions", tags=["decisions"])
api_router.include_router(summaries.router, prefix="/summaries", tags=["daily summaries"])