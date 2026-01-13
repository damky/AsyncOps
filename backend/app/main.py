from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AsyncOps API",
    version="1.0.0",
    description="Async-first operations dashboard API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Log CORS origins for debugging
logger.info(f"CORS origins configured: {settings.CORS_ORIGINS}")
print(f"CORS origins configured: {settings.CORS_ORIGINS}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {"status": "healthy", "service": "asyncops-api"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AsyncOps API",
        "version": "1.0.0",
        "docs": "/docs",
    }
