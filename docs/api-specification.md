# API Specification

This document describes the REST API for AsyncOps, built with FastAPI. All endpoints return JSON responses and follow RESTful conventions.

## Base URL

- Development: `http://localhost:8000`
- Production: `https://api.asyncops.example.com` (replace with actual domain)

## Authentication

### JWT Token Authentication

Most endpoints require authentication via JWT (JSON Web Token). Include the token in the request header:

```
Authorization: Bearer <token>
```

### Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token in response
3. Client stores token (HTTP-only cookie or localStorage)
4. Client includes token in `Authorization` header for subsequent requests
5. Server validates token on protected endpoints

### Token Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "member",
  "exp": 1234567890
}
```

- `sub`: User ID (subject)
- `email`: User email
- `role`: User role (admin or member)
- `exp`: Expiration timestamp (Unix time)

Token expiration: 24 hours (configurable)

---

## Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### Paginated Response

```json
{
  "items": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

---

## Status Codes

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST (resource created)
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

---

## Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "member",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "message": "User registered successfully"
}
```

**Errors**:
- `400` - Invalid email format or weak password
- `409` - Email already exists
- `422` - Validation errors

---

#### Login

```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "member"
    }
  }
}
```

**Errors**:
- `401` - Invalid credentials
- `422` - Validation errors

---

#### Logout

```http
POST /api/auth/logout
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Note**: For stateless JWT, logout is handled client-side by removing the token. Server-side token blacklist is optional.

---

#### Get Current User

```http
GET /api/auth/me
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "member",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Errors**:
- `401` - Invalid or missing token

---

### Users

#### Get Current User Profile

```http
GET /api/users/me
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "member",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

#### Update Current User Profile

```http
PATCH /api/users/me
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "full_name": "John Smith",
  "email": "newemail@example.com"
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "email": "newemail@example.com",
    "full_name": "John Smith",
    "role": "member",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Errors**:
- `409` - Email already exists (if changing email)

---

#### Change Password

```http
POST /api/users/me/change-password
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "current_password": "OldPassword123",
  "new_password": "NewSecurePassword456"
}
```

**Response**: `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Errors**:
- `400` - Current password incorrect
- `400` - New password doesn't meet requirements

---

#### List Users (Admin Only)

```http
GET /api/users
```

**Headers**: `Authorization: Bearer <token>` (admin role required)

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `role` (string, optional: "admin" or "member")
- `search` (string, optional: search by name or email)

**Response**: `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "member",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

**Errors**:
- `403` - Insufficient permissions (not admin)

---

### Status Updates

#### Create Status Update

```http
POST /api/status
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "Weekly Status Update",
  "content": "Completed feature X, working on feature Y",
  "tags": ["frontend", "progress"]
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Weekly Status Update",
    "content": "Completed feature X, working on feature Y",
    "tags": ["frontend", "progress"],
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "author": {
      "id": 1,
      "full_name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

---

#### List Status Updates

```http
GET /api/status
```

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `author_id` (integer, optional)
- `start_date` (ISO date string, optional)
- `end_date` (ISO date string, optional)
- `tags` (comma-separated strings, optional)
- `search` (string, optional: search in title and content)

**Response**: `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "title": "Weekly Status Update",
      "content": "Completed feature X...",
      "tags": ["frontend"],
      "created_at": "2024-01-15T10:00:00Z",
      "author": {
        "id": 1,
        "full_name": "John Doe"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

---

#### Get Status Update

```http
GET /api/status/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Weekly Status Update",
    "content": "Full content here...",
    "tags": ["frontend"],
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "author": {
      "id": 1,
      "full_name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

**Errors**:
- `404` - Status update not found

---

#### Update Status Update

```http
PATCH /api/status/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["updated"]
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "title": "Updated Title",
    "content": "Updated content",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Errors**:
- `403` - Not the author
- `404` - Status update not found

---

#### Delete Status Update

```http
DELETE /api/status/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

**Errors**:
- `403` - Not the author
- `404` - Status update not found

---

### Incidents

#### Create Incident

```http
POST /api/incidents
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "API Outage",
  "description": "API is returning 500 errors",
  "severity": "critical",
  "assigned_to_id": 2
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": 1,
    "reported_by_id": 1,
    "assigned_to_id": 2,
    "title": "API Outage",
    "description": "API is returning 500 errors",
    "severity": "critical",
    "status": "open",
    "created_at": "2024-01-15T10:00:00Z",
    "reporter": {
      "id": 1,
      "full_name": "John Doe"
    },
    "assigned_to": {
      "id": 2,
      "full_name": "Jane Smith"
    }
  }
}
```

---

#### List Incidents

```http
GET /api/incidents
```

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `status` (string, optional: "open", "in_progress", "resolved", "closed")
- `severity` (string, optional: "low", "medium", "high", "critical")
- `assigned_to_id` (integer, optional)
- `archived` (boolean, optional, default: false) - Filter by archived status
- `reported_by_id` (integer, optional)
- `start_date` (ISO date string, optional)
- `end_date` (ISO date string, optional)

**Response**: `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "title": "API Outage",
      "severity": "critical",
      "status": "open",
      "archived": false,
      "created_at": "2024-01-15T10:00:00Z",
      "reporter": {
        "id": 1,
        "full_name": "John Doe"
      },
      "assigned_to": {
        "id": 2,
        "full_name": "Jane Smith"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

---

#### Get Incident

```http
GET /api/incidents/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "reported_by_id": 1,
    "assigned_to_id": 2,
    "title": "API Outage",
    "description": "Full description...",
    "severity": "critical",
    "status": "open",
    "resolution_notes": null,
    "archived": false,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "resolved_at": null,
    "reporter": {
      "id": 1,
      "full_name": "John Doe"
    },
    "assigned_to": {
      "id": 2,
      "full_name": "Jane Smith"
    }
  }
}
```

---

#### Update Incident Status

```http
PATCH /api/incidents/{id}/status
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "status": "in_progress",
  "resolution_notes": "Investigating the issue"
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "status": "in_progress",
    "resolution_notes": "Investigating the issue",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

---

#### Assign Incident

```http
PATCH /api/incidents/{id}/assign
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "assigned_to_id": 3
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "assigned_to_id": 3,
    "assigned_to": {
      "id": 3,
      "full_name": "Bob Johnson"
    }
  }
}
```

---

#### Archive Incident

```http
PATCH /api/incidents/{id}/archive
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "archived": true,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

---

#### Unarchive Incident

```http
PATCH /api/incidents/{id}/unarchive
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "archived": false,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

---

#### Delete Incident (Admin Only)

```http
DELETE /api/incidents/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Authorization**: Admin role required

**Response**: `204 No Content`

**Validation**: Only archived incidents can be permanently deleted. Returns `400 Bad Request` if incident is not archived.

---

### Blockers

#### Create Blocker

```http
POST /api/blockers
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "description": "Waiting on API key from third-party service",
  "impact": "Cannot proceed with integration",
  "related_status_id": 1,
  "related_incident_id": 2
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": 1,
    "reported_by_id": 1,
    "description": "Waiting on API key from third-party service",
    "impact": "Cannot proceed with integration",
    "status": "active",
    "related_status_id": 1,
    "related_incident_id": 2,
    "created_at": "2024-01-15T10:00:00Z",
    "reporter": {
      "id": 1,
      "full_name": "John Doe"
    }
  }
}
```

---

#### List Blockers

```http
GET /api/blockers
```

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `status` (string, optional: "active", "resolved")
- `archived` (boolean, optional, default: false) - Filter by archived status
- `reported_by_id` (integer, optional)
- `start_date` (ISO date string, optional)
- `end_date` (ISO date string, optional)

**Response**: `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "description": "Waiting on API key...",
      "impact": "Cannot proceed...",
      "status": "active",
      "archived": false,
      "created_at": "2024-01-15T10:00:00Z",
      "reporter": {
        "id": 1,
        "full_name": "John Doe"
      }
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 20
}
```

---

#### Get Blocker

```http
GET /api/blockers/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "reported_by_id": 1,
    "description": "Full description...",
    "impact": "Full impact description...",
    "status": "active",
    "resolution_notes": null,
    "archived": false,
    "related_status_id": 1,
    "related_incident_id": 2,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "resolved_at": null,
    "reporter": {
      "id": 1,
      "full_name": "John Doe"
    }
  }
}
```

---

#### Resolve Blocker

```http
PATCH /api/blockers/{id}/resolve
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "resolution_notes": "API key received, issue resolved"
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "status": "resolved",
    "resolution_notes": "API key received, issue resolved",
    "resolved_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

---

#### Reopen Blocker

```http
PATCH /api/blockers/{id}/reopen
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "status": "active",
    "resolved_at": null,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

**Validation**: 
- Blocker must be in "resolved" status
- Blocker must not be archived
- Returns `400 Bad Request` if validation fails

---

#### Archive Blocker

```http
PATCH /api/blockers/{id}/archive
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "archived": true,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

---

#### Unarchive Blocker

```http
PATCH /api/blockers/{id}/unarchive
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "archived": false,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

---

#### Delete Blocker (Admin Only)

```http
DELETE /api/blockers/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Authorization**: Admin role required

**Response**: `204 No Content`

**Validation**: Only archived blockers can be permanently deleted. Returns `400 Bad Request` if blocker is not archived.

---

### Decisions

#### Create Decision

```http
POST /api/decisions
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "Adopt FastAPI for Backend",
  "description": "Decision to use FastAPI instead of Express",
  "context": "Need async support and Python ecosystem",
  "outcome": "Improved development velocity",
  "decision_date": "2024-01-15",
  "participant_ids": [1, 2, 3],
  "tags": ["technology", "backend"]
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": 1,
    "created_by_id": 1,
    "title": "Adopt FastAPI for Backend",
    "description": "Decision to use FastAPI...",
    "context": "Need async support...",
    "outcome": "Improved development velocity",
    "decision_date": "2024-01-15",
    "tags": ["technology", "backend"],
    "created_at": "2024-01-15T10:00:00Z",
    "creator": {
      "id": 1,
      "full_name": "John Doe"
    },
    "participants": [
      {
        "id": 1,
        "full_name": "John Doe"
      },
      {
        "id": 2,
        "full_name": "Jane Smith"
      }
    ]
  }
}
```

---

#### List Decisions

```http
GET /api/decisions
```

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `start_date` (ISO date string, optional)
- `end_date` (ISO date string, optional)
- `participant_id` (integer, optional)
- `tag` (string, optional)
- `search` (string, optional: full-text search)

**Response**: `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "title": "Adopt FastAPI for Backend",
      "decision_date": "2024-01-15",
      "tags": ["technology"],
      "created_at": "2024-01-15T10:00:00Z",
      "creator": {
        "id": 1,
        "full_name": "John Doe"
      },
      "participants": [
        {
          "id": 1,
          "full_name": "John Doe"
        }
      ]
    }
  ],
  "total": 30,
  "page": 1,
  "limit": 20
}
```

---

#### Get Decision

```http
GET /api/decisions/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "created_by_id": 1,
    "title": "Adopt FastAPI for Backend",
    "description": "Full description...",
    "context": "Full context...",
    "outcome": "Full outcome...",
    "decision_date": "2024-01-15",
    "tags": ["technology", "backend"],
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "creator": {
      "id": 1,
      "full_name": "John Doe"
    },
    "participants": [
      {
        "id": 1,
        "full_name": "John Doe"
      }
    ]
  }
}
```

---

#### Update Decision

```http
PATCH /api/decisions/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "Updated Title",
  "outcome": "Updated outcome"
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "title": "Updated Title",
    "outcome": "Updated outcome",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Errors**:
- `403` - Not the creator or admin

---

#### Get Decision Audit Trail

```http
GET /api/decisions/{id}/audit
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "decision_id": 1,
      "changed_by_id": 1,
      "change_type": "created",
      "field_name": null,
      "old_value": null,
      "new_value": null,
      "changed_at": "2024-01-15T10:00:00Z",
      "changed_by": {
        "id": 1,
        "full_name": "John Doe"
      }
    },
    {
      "id": 2,
      "decision_id": 1,
      "changed_by_id": 1,
      "change_type": "updated",
      "field_name": "title",
      "old_value": "Old Title",
      "new_value": "New Title",
      "changed_at": "2024-01-15T11:00:00Z",
      "changed_by": {
        "id": 1,
        "full_name": "John Doe"
      }
    }
  ]
}
```

---

### Daily Summaries

#### Generate Daily Summary (Admin Only)

```http
POST /api/summaries/generate
```

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `summary_date` (ISO date string, optional)

**Response**: `201 Created`
```json
{
  "data": {
    "id": 1,
    "summary_date": "2024-01-15",
    "content": {
      "status_updates": [
        {
          "id": 1,
          "title": "Weekly Update",
          "author": "John Doe",
          "created_at": "2024-01-15T10:00:00Z"
        }
      ],
      "incidents": [
        {
          "id": 1,
          "title": "API Outage",
          "severity": "critical",
          "status": "open"
        }
      ],
      "blockers": [
        {
          "id": 1,
          "description": "Waiting on API key",
          "status": "active"
        }
      ],
      "recent_decisions": [
        {
          "id": 1,
          "title": "Adopt FastAPI",
          "decision_date": "2024-01-14"
        }
      ],
      "statistics": {
        "total_status_updates": 5,
        "critical_incidents": 1,
        "active_blockers": 2,
        "decisions_last_7_days": 3
      }
    },
    "status_updates_count": 5,
    "incidents_count": 2,
    "blockers_count": 3,
    "decisions_count": 1,
    "generated_at": "2024-01-15T09:00:00Z"
  }
}
```

**Errors**:
- `403 Forbidden` - User is not an admin

---

#### List Daily Summaries

```http
GET /api/summaries
```

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `start_date` (ISO date string, optional)
- `end_date` (ISO date string, optional)

**Response**: `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "summary_date": "2024-01-15",
      "status_updates_count": 5,
      "incidents_count": 2,
      "blockers_count": 3,
      "decisions_count": 1,
      "generated_at": "2024-01-15T09:00:00Z"
    }
  ],
  "total": 30,
  "page": 1,
  "limit": 20
}
```

---

#### Get Daily Summary

```http
GET /api/summaries/{id}
```

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "data": {
    "id": 1,
    "summary_date": "2024-01-15",
    "content": {
      "status_updates": [
        {
          "id": 1,
          "title": "Weekly Update",
          "author": "John Doe",
          "created_at": "2024-01-15T10:00:00Z"
        }
      ],
      "incidents": [
        {
          "id": 1,
          "title": "API Outage",
          "severity": "critical",
          "status": "open"
        }
      ],
      "blockers": [
        {
          "id": 1,
          "description": "Waiting on API key",
          "status": "active"
        }
      ],
      "recent_decisions": [
        {
          "id": 1,
          "title": "Adopt FastAPI",
          "decision_date": "2024-01-14"
        }
      ],
      "statistics": {
        "total_status_updates": 5,
        "critical_incidents": 1,
        "active_blockers": 2,
        "decisions_last_7_days": 3
      }
    },
    "status_updates_count": 5,
    "incidents_count": 2,
    "blockers_count": 3,
    "decisions_count": 1,
    "generated_at": "2024-01-15T09:00:00Z"
  }
}
```

---

### Search

#### Global Search

```http
GET /api/search
```

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `q` (string, required: search query)
- `types` (comma-separated string, optional: "status,incidents,blockers,decisions")
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)

**Response**: `200 OK`
```json
{
  "data": {
    "status_updates": {
      "items": [ ... ],
      "total": 5
    },
    "incidents": {
      "items": [ ... ],
      "total": 2
    },
    "blockers": {
      "items": [ ... ],
      "total": 1
    },
    "decisions": {
      "items": [ ... ],
      "total": 3
    }
  }
}
```

---

## Error Handling

### Validation Errors

When request validation fails, return `422 Unprocessable Entity`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Authentication Errors

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### Authorization Errors

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### Not Found Errors

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

---

## Rate Limiting

### Limits (Production)
- Authentication endpoints: 5 requests per minute per IP
- All other endpoints: 100 requests per minute per user
- Global limit: 1000 requests per minute per IP

### Headers
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

### Response (429 Too Many Requests)
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

---

## OpenAPI/Swagger Documentation

FastAPI automatically generates OpenAPI documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

All endpoints are documented with request/response schemas, validation rules, and examples.

---

## Webhooks (Future Enhancement)

Webhooks will allow external systems to receive notifications about events:

- Status update created
- Incident created/updated
- Blocker resolved
- Decision created
- Daily summary generated

Endpoint: `POST /api/webhooks` (admin only for configuration)

---

## Versioning

Current version: `v1`

API versioning strategy (future):
- Include version in URL: `/api/v1/status`
- Or use header: `API-Version: v1`
- Maintain backward compatibility for at least one major version
