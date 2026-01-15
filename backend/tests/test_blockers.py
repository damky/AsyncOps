"""
Tests for blocker endpoints.
"""
import pytest
from fastapi import status


class TestCreateBlocker:
    """Test creating blockers."""
    
    def test_create_blocker_success(self, client, auth_headers):
        """Test successful blocker creation."""
        response = client.post(
            "/api/blockers",
            headers=auth_headers,
            json={
                "description": "Waiting on API documentation",
                "impact": "Cannot proceed with integration work"
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["description"] == "Waiting on API documentation"
        assert data["impact"] == "Cannot proceed with integration work"
        assert data["status"] == "active"
        assert "id" in data
        assert "reported_by" in data
    
    def test_create_blocker_with_related_status(self, client, auth_headers, test_user, db_session):
        """Test creating blocker with related status update."""
        from app.db.models.status_update import StatusUpdate
        
        status_update = StatusUpdate(
            title="Test Status",
            content="Test content",
            user_id=test_user.id
        )
        db_session.add(status_update)
        db_session.commit()
        db_session.refresh(status_update)
        
        response = client.post(
            "/api/blockers",
            headers=auth_headers,
            json={
                "description": "Blocked by status",
                "impact": "Test impact",
                "related_status_id": status_update.id
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["related_status_id"] == status_update.id
    
    def test_create_blocker_with_related_incident(self, client, auth_headers, test_user, db_session):
        """Test creating blocker with related incident."""
        from app.db.models.incident import Incident
        
        incident = Incident(
            title="Test Incident",
            description="Test",
            severity="medium",
            reported_by_id=test_user.id
        )
        db_session.add(incident)
        db_session.commit()
        db_session.refresh(incident)
        
        response = client.post(
            "/api/blockers",
            headers=auth_headers,
            json={
                "description": "Blocked by incident",
                "impact": "Test impact",
                "related_incident_id": incident.id
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["related_incident_id"] == incident.id
    
    def test_create_blocker_invalid_related_status(self, client, auth_headers):
        """Test creating blocker with invalid related status."""
        response = client.post(
            "/api/blockers",
            headers=auth_headers,
            json={
                "description": "Test",
                "impact": "Test",
                "related_status_id": 99999
            }
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_create_blocker_unauthorized(self, client):
        """Test creating blocker without authentication."""
        response = client.post(
            "/api/blockers",
            json={
                "description": "Test",
                "impact": "Test"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_blocker_missing_fields(self, client, auth_headers):
        """Test creating blocker with missing required fields."""
        response = client.post(
            "/api/blockers",
            headers=auth_headers,
            json={
                "description": "Missing impact"
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGetBlockers:
    """Test getting blockers."""
    
    def test_get_blockers_empty(self, client, auth_headers):
        """Test getting blockers when none exist."""
        response = client.get(
            "/api/blockers",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 0
        assert len(data["items"]) == 0
    
    def test_get_blockers_with_data(self, client, auth_headers, test_user, db_session):
        """Test getting blockers with existing data."""
        from app.db.models.blocker import Blocker
        
        # Create test blockers
        for i in range(3):
            blocker = Blocker(
                description=f"Blocker {i}",
                impact=f"Impact {i}",
                reported_by_id=test_user.id
            )
            db_session.add(blocker)
        db_session.commit()
        
        response = client.get(
            "/api/blockers",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 3
        assert len(data["items"]) == 3
    
    def test_get_blockers_filter_by_status(self, client, auth_headers, test_user, db_session):
        """Test filtering blockers by status."""
        from app.db.models.blocker import Blocker
        
        active_blocker = Blocker(
            description="Active",
            impact="Test",
            status="active",
            reported_by_id=test_user.id
        )
        resolved_blocker = Blocker(
            description="Resolved",
            impact="Test",
            status="resolved",
            reported_by_id=test_user.id
        )
        db_session.add(active_blocker)
        db_session.add(resolved_blocker)
        db_session.commit()
        
        # Filter by active status
        response = client.get(
            "/api/blockers?status=active",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["status"] == "active"


class TestGetBlocker:
    """Test getting a single blocker."""
    
    def test_get_blocker_success(self, client, auth_headers, test_user, db_session):
        """Test getting a single blocker."""
        from app.db.models.blocker import Blocker
        
        blocker = Blocker(
            description="Test Blocker",
            impact="Test impact",
            reported_by_id=test_user.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.get(
            f"/api/blockers/{blocker.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["description"] == "Test Blocker"
        assert data["impact"] == "Test impact"
    
    def test_get_blocker_not_found(self, client, auth_headers):
        """Test getting non-existent blocker."""
        response = client.get(
            "/api/blockers/99999",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestUpdateBlocker:
    """Test updating blockers."""
    
    def test_update_blocker_success(self, client, auth_headers, test_user, db_session):
        """Test successful blocker update."""
        from app.db.models.blocker import Blocker
        
        blocker = Blocker(
            description="Original description",
            impact="Original impact",
            reported_by_id=test_user.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.patch(
            f"/api/blockers/{blocker.id}",
            headers=auth_headers,
            json={
                "description": "Updated description",
                "impact": "Updated impact"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["description"] == "Updated description"
        assert data["impact"] == "Updated impact"


class TestResolveBlocker:
    """Test resolving blockers."""
    
    def test_resolve_blocker_success(self, client, auth_headers, test_user, db_session):
        """Test successfully resolving blocker."""
        from app.db.models.blocker import Blocker
        
        blocker = Blocker(
            description="Test",
            impact="Test",
            status="active",
            reported_by_id=test_user.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.patch(
            f"/api/blockers/{blocker.id}/resolve",
            headers=auth_headers,
            json={
                "resolution_notes": "Issue resolved"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "resolved"
        assert data["resolution_notes"] == "Issue resolved"
        assert data["resolved_at"] is not None


class TestReopenBlocker:
    """Test reopening blockers."""
    
    def test_reopen_blocker_success(self, client, auth_headers, test_user, db_session):
        """Test successfully reopening blocker."""
        from app.db.models.blocker import Blocker
        from datetime import datetime, timezone
        
        blocker = Blocker(
            description="Test",
            impact="Test",
            status="resolved",
            resolved_at=datetime.now(timezone.utc),
            reported_by_id=test_user.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.patch(
            f"/api/blockers/{blocker.id}/reopen",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "active"
        assert data["resolved_at"] is None
    
    def test_reopen_archived_blocker_fails(self, client, auth_headers, test_user, db_session):
        """Test that archived blockers cannot be reopened."""
        from app.db.models.blocker import Blocker
        from datetime import datetime, timezone
        
        blocker = Blocker(
            description="Test",
            impact="Test",
            status="resolved",
            archived=True,
            resolved_at=datetime.now(timezone.utc),
            reported_by_id=test_user.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.patch(
            f"/api/blockers/{blocker.id}/reopen",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "archived" in response.json()["detail"].lower()
    
    def test_reopen_active_blocker_fails(self, client, auth_headers, test_user, db_session):
        """Test that active blockers cannot be reopened."""
        from app.db.models.blocker import Blocker
        
        blocker = Blocker(
            description="Test",
            impact="Test",
            status="active",
            reported_by_id=test_user.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.patch(
            f"/api/blockers/{blocker.id}/reopen",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestArchiveBlocker:
    """Test archiving blockers."""
    
    def test_archive_blocker_success(self, client, auth_headers, test_user, db_session):
        """Test successfully archiving blocker."""
        from app.db.models.blocker import Blocker
        
        blocker = Blocker(
            description="Test",
            impact="Test",
            reported_by_id=test_user.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.patch(
            f"/api/blockers/{blocker.id}/archive",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["archived"] is True
    
    def test_unarchive_blocker_success(self, client, auth_headers, test_user, db_session):
        """Test successfully unarchiving blocker."""
        from app.db.models.blocker import Blocker
        
        blocker = Blocker(
            description="Test",
            impact="Test",
            archived=True,
            reported_by_id=test_user.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.patch(
            f"/api/blockers/{blocker.id}/unarchive",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["archived"] is False


class TestDeleteBlocker:
    """Test deleting blockers."""
    
    def test_delete_archived_blocker_as_admin(self, client, admin_headers, test_admin, db_session):
        """Test admin deleting archived blocker."""
        from app.db.models.blocker import Blocker
        
        blocker = Blocker(
            description="Test",
            impact="Test",
            archived=True,
            reported_by_id=test_admin.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.delete(
            f"/api/blockers/{blocker.id}",
            headers=admin_headers
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's deleted
        response = client.get(
            f"/api/blockers/{blocker.id}",
            headers=admin_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_non_archived_blocker_fails(self, client, admin_headers, test_admin, db_session):
        """Test that non-archived blockers cannot be deleted."""
        from app.db.models.blocker import Blocker
        
        blocker = Blocker(
            description="Test",
            impact="Test",
            archived=False,
            reported_by_id=test_admin.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.delete(
            f"/api/blockers/{blocker.id}",
            headers=admin_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "archived" in response.json()["detail"].lower()
    
    def test_delete_blocker_requires_admin(self, client, auth_headers, test_user, db_session):
        """Test that only admins can delete blockers."""
        from app.db.models.blocker import Blocker
        
        blocker = Blocker(
            description="Test",
            impact="Test",
            archived=True,
            reported_by_id=test_user.id
        )
        db_session.add(blocker)
        db_session.commit()
        db_session.refresh(blocker)
        
        response = client.delete(
            f"/api/blockers/{blocker.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
