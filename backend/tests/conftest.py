"""
Pytest configuration and fixtures for backend tests.
"""
import pytest
import json
from sqlalchemy import create_engine, event, TypeDecorator, String
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.types import JSON
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
# Import all models to ensure they're registered with Base
from app.db.models import user, status_update, incident, blocker, decision, daily_summary
from app.db.models.user import User
from app.core.security import get_password_hash
from app.core.dependencies import get_db


# Use in-memory SQLite for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# SQLite compatibility: Enable foreign keys
@event.listens_for(engine, "connect", insert=True)
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Enable foreign keys in SQLite."""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

# Replace PostgreSQL-specific types with SQLite-compatible ones
# Import models first to ensure metadata is populated
from sqlalchemy import ARRAY
from sqlalchemy.dialects.postgresql import JSONB

# Modify metadata tables to replace PostgreSQL types with SQLite-compatible ones
# This must happen after all models are imported but before table creation
def patch_metadata_for_sqlite():
    """Replace PostgreSQL-specific types with SQLite-compatible JSON."""
    for table in Base.metadata.tables.values():
        for column in list(table.columns):
            original_type = column.type
            # Replace ARRAY with JSON
            if isinstance(original_type, ARRAY):
                column.type = JSON()
            # Replace JSONB with JSON  
            elif isinstance(original_type, JSONB):
                column.type = JSON()

# Apply the patch
patch_metadata_for_sqlite()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpassword123"),
        full_name="Test User",
        role="member",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session):
    """Create a test admin user."""
    admin = User(
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword123"),
        full_name="Admin User",
        role="admin",
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.email,
            "password": "testpassword123"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client, test_admin):
    """Get authentication headers for admin user."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_admin.email,
            "password": "adminpassword123"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
