"""
Tests for status update endpoints.
"""
import pytest
from fastapi import status
from datetime import datetime, timedelta


class TestCreateStatusUpdate:
    """Test creating status updates."""
    
    def test_create_status_update_success(self, client, auth_headers):
        """Test successful status update creation."""
        response = client.post(
            "/api/status",
            headers=auth_headers,
            json={
                "title": "Daily Standup",
                "content": "Completed authentication system",
                "tags": ["frontend", "backend"]
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "Daily Standup"
        assert data["content"] == "Completed authentication system"
        assert "frontend" in data["tags"]
        assert "backend" in data["tags"]
        assert "id" in data
        assert "created_at" in data
    
    def test_create_status_update_unauthorized(self, client):
        """Test creating status update without authentication."""
        response = client.post(
            "/api/status",
            json={
                "title": "Test",
                "content": "Test content"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_status_update_missing_fields(self, client, auth_headers):
        """Test creating status update with missing required fields."""
        response = client.post(
            "/api/status",
            headers=auth_headers,
            json={
                "content": "Missing title"
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGetStatusUpdates:
    """Test getting status updates."""
    
    def test_get_status_updates_empty(self, client, auth_headers):
        """Test getting status updates when none exist."""
        response = client.get(
            "/api/status",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 0
        assert len(data["items"]) == 0
    
    def test_get_status_updates_with_data(self, client, auth_headers, test_user, db_session):
        """Test getting status updates with existing data."""
        from app.db.models.status_update import StatusUpdate
        
        # Create test status updates
        for i in range(3):
            status_update = StatusUpdate(
                title=f"Status Update {i}",
                content=f"Content {i}",
                user_id=test_user.id,
                tags=["test"]
            )
            db_session.add(status_update)
        db_session.commit()
        
        response = client.get(
            "/api/status",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 3
        assert len(data["items"]) == 3
    
    def test_get_status_updates_pagination(self, client, auth_headers, test_user, db_session):
        """Test status updates pagination."""
        from app.db.models.status_update import StatusUpdate
        
        # Create 5 status updates
        for i in range(5):
            status_update = StatusUpdate(
                title=f"Status Update {i}",
                content=f"Content {i}",
                user_id=test_user.id
            )
            db_session.add(status_update)
        db_session.commit()
        
        # Get first page
        response = client.get(
            "/api/status?page=1&limit=2",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 2
        assert data["page"] == 1
        assert data["total"] == 5
    
    def test_get_status_updates_filter_by_author(self, client, auth_headers, test_user, test_admin, db_session):
        """Test filtering status updates by author."""
        from app.db.models.status_update import StatusUpdate
        
        # Create status updates by different authors
        for user in [test_user, test_admin]:
            status_update = StatusUpdate(
                title=f"Status by {user.email}",
                content="Test",
                user_id=user.id
            )
            db_session.add(status_update)
        db_session.commit()
        
        # Filter by test_user
        response = client.get(
            f"/api/status?author_id={test_user.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["user"]["id"] == test_user.id


class TestGetStatusUpdate:
    """Test getting a single status update."""
    
    def test_get_status_update_success(self, client, auth_headers, test_user, db_session):
        """Test getting a single status update."""
        from app.db.models.status_update import StatusUpdate
        
        status_update = StatusUpdate(
            title="Test Status",
            content="Test content",
            user_id=test_user.id
        )
        db_session.add(status_update)
        db_session.commit()
        db_session.refresh(status_update)
        
        response = client.get(
            f"/api/status/{status_update.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Test Status"
        assert data["content"] == "Test content"
    
    def test_get_status_update_not_found(self, client, auth_headers):
        """Test getting non-existent status update."""
        response = client.get(
            "/api/status/99999",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestUpdateStatusUpdate:
    """Test updating status updates."""
    
    def test_update_status_update_success(self, client, auth_headers, test_user, db_session):
        """Test successful status update modification."""
        from app.db.models.status_update import StatusUpdate
        
        status_update = StatusUpdate(
            title="Original Title",
            content="Original content",
            user_id=test_user.id
        )
        db_session.add(status_update)
        db_session.commit()
        db_session.refresh(status_update)
        
        response = client.patch(
            f"/api/status/{status_update.id}",
            headers=auth_headers,
            json={
                "title": "Updated Title",
                "content": "Updated content"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["content"] == "Updated content"
    
    def test_update_status_update_unauthorized(self, client, test_user, test_admin, db_session):
        """Test updating another user's status update."""
        from app.db.models.status_update import StatusUpdate
        from app.core.security import get_password_hash
        
        status_update = StatusUpdate(
            title="Test",
            content="Test",
            user_id=test_user.id
        )
        db_session.add(status_update)
        db_session.commit()
        db_session.refresh(status_update)
        
        # Login as admin
        response = client.post(
            "/api/auth/login",
            data={
                "username": test_admin.email,
                "password": "adminpassword123"
            }
        )
        admin_token = response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Admin should NOT be able to edit (only author can edit status updates)
        response = client.patch(
            f"/api/status/{status_update.id}",
            headers=admin_headers,
            json={"title": "Admin Update"}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestDeleteStatusUpdate:
    """Test deleting status updates."""
    
    def test_delete_status_update_success(self, client, auth_headers, test_user, db_session):
        """Test successful status update deletion."""
        from app.db.models.status_update import StatusUpdate
        
        status_update = StatusUpdate(
            title="To Delete",
            content="Will be deleted",
            user_id=test_user.id
        )
        db_session.add(status_update)
        db_session.commit()
        db_session.refresh(status_update)
        
        response = client.delete(
            f"/api/status/{status_update.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's deleted
        response = client.get(
            f"/api/status/{status_update.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
