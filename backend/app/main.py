from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
from app.core.config import settings
from app.api.v1.api import api_router
import logging
import sys
import os

# Configure logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

# Get the base directory for static files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app = FastAPI(
    title="AsyncOps API",
    version="1.0.0",
    description="Async-first operations dashboard API",
    docs_url=None,  # We'll override this with custom endpoint
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

# Mount static files directory for Swagger UI custom CSS
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Override Swagger UI to inject custom CSS
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    html_response = get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
    )
    
    # Inject custom CSS to fix white text on white background
    css_path = os.path.join(STATIC_DIR, "swagger-ui-fix.css")
    if os.path.exists(css_path):
        with open(css_path, "r") as f:
            custom_css = f.read()
        # Inject CSS before closing head tag
        content = html_response.body.decode() if isinstance(html_response.body, bytes) else html_response.body
        content = content.replace(
            "</head>",
            f"<style>{custom_css}</style></head>"
        )
        return HTMLResponse(content=content)
    
    return html_response

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
