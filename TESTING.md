# Testing Guide for AsyncOps Phase 3

This document provides a comprehensive testing checklist for the Phase 3 core features: Status Updates, Incidents, and Blockers.

## Prerequisites

✅ **Migrations Applied**: Database migrations have been run
✅ **Services Running**: All Docker containers are up and healthy
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Database: PostgreSQL on port 5432

## Testing Checklist

### 1. Authentication Setup

Before testing core features, ensure you have a user account:

#### Option A: Use Existing Account
- Login at http://localhost:3000/login

#### Option B: Create New Account
1. Navigate to http://localhost:3000/register
2. Fill in registration form:
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Password: `testpassword123`
   - Confirm Password: `testpassword123`
3. Submit and login

#### Option C: Create Admin User (via CLI)
```bash
docker-compose exec backend python -m app.scripts.create_admin
```

---

### 2. Status Updates Testing

#### 2.1 Frontend Testing

**Navigate to**: http://localhost:3000/status

**Test Cases**:
- [ ] **Create Status Update**
  - Click "Create Status Update" button
  - Fill in:
    - Title: "Daily Standup - Monday"
    - Content: "Completed authentication system. Working on status updates feature."
    - Tags: Add tags like "frontend", "backend", "progress"
  - Submit and verify it appears in the list

- [ ] **View Status Updates List**
  - Verify your status update appears
  - Check that author name is displayed
  - Verify tags are shown
  - Check timestamp formatting

- [ ] **Edit Status Update**
  - Click edit button on your status update
  - Modify title, content, or tags
  - Save and verify changes

- [ ] **Delete Status Update**
  - Click delete button on your status update
  - Confirm deletion
  - Verify it's removed from the list

- [ ] **Pagination**
  - Create multiple status updates (5+)
  - Verify pagination controls appear
  - Test next/previous page navigation

- [ ] **Filtering** (if implemented in UI)
  - Filter by date range
  - Filter by author

#### 2.2 API Testing (via Swagger)

**Navigate to**: http://localhost:8000/docs

**Test Endpoints**:

1. **POST /api/status**
   - Click "Try it out"
   - Use this payload:
     ```json
     {
       "title": "API Test Status",
       "content": "Testing status update via API",
       "tags": ["api", "test"]
     }
     ```
   - Authorize first (click "Authorize" button, enter token)
   - Execute and verify 201 response

2. **GET /api/status**
   - Test with query parameters:
     - `page=1`
     - `limit=10`
     - `author_id=<your_user_id>` (optional)
     - `start_date=2024-01-01` (optional)
     - `end_date=2024-12-31` (optional)
   - Verify response includes pagination metadata

3. **GET /api/status/{id}**
   - Use ID from previous create
   - Verify full status update details returned

4. **PATCH /api/status/{id}**
   - Update title or content
   - Verify 200 response with updated data

5. **DELETE /api/status/{id}**
   - Delete the status update
   - Verify 204 response
   - Try GET again to confirm deletion

---

### 3. Incidents Testing

#### 3.1 Frontend Testing

**Navigate to**: http://localhost:3000/incidents

**Test Cases**:
- [ ] **Create Incident**
  - Click "Create Incident" button
  - Fill in:
    - Title: "Database Connection Timeout"
    - Description: "Users experiencing intermittent connection timeouts"
    - Severity: Select "high"
    - Status: "open" (default)
  - Submit and verify it appears

- [ ] **View Incidents List**
  - Verify incident appears with severity badge
  - Check status indicator
  - Verify reported by information

- [ ] **Filter Incidents**
  - Filter by status: "open", "in_progress", "resolved", "closed"
  - Filter by severity: "low", "medium", "high", "critical"
  - Verify filters work correctly

- [ ] **Update Incident Status**
  - Click on an incident
  - Change status to "in_progress" or "resolved"
  - Add resolution notes if resolving
  - Save and verify status update

- [ ] **Assign Incident** (if you have multiple users)
  - Assign incident to another user
  - Verify assignment is reflected

- [ ] **Edit Incident**
  - Modify title, description, or severity
  - Save and verify changes

- [ ] **Delete Incident**
  - Delete an incident
  - Verify removal

#### 3.2 API Testing

**Test Endpoints**:

1. **POST /api/incidents**
   ```json
   {
     "title": "API Test Incident",
     "description": "Testing incident creation via API",
     "severity": "medium",
     "status": "open"
   }
   ```

2. **GET /api/incidents**
   - Test filters:
     - `status=open`
     - `severity=high`
     - `assigned_to_id=<user_id>`

3. **PATCH /api/incidents/{id}**
   - Update status, severity, or description

4. **PATCH /api/incidents/{id}/status**
   - Change status to "resolved"
   - Include `resolution_notes`

5. **PATCH /api/incidents/{id}/assign**
   - Assign to a user (if multiple users exist)

---

### 4. Blockers Testing

#### 4.1 Frontend Testing

**Navigate to**: http://localhost:3000/blockers

**Test Cases**:
- [ ] **Create Blocker**
  - Click "Create Blocker" button
  - Fill in:
    - Description: "Waiting on API documentation from external team"
    - Impact: "Cannot proceed with integration work"
    - Status: "active" (default)
  - Optionally link to a status update or incident
  - Submit and verify it appears

- [ ] **View Blockers List**
  - Verify blocker appears with status badge
  - Check that active blockers appear first
  - Verify resolved blockers are shown separately

- [ ] **Filter Blockers**
  - Filter by status: "active" or "resolved"
  - Verify filter works

- [ ] **Resolve Blocker**
  - Click "Resolve" button on active blocker
  - Add resolution notes
  - Verify status changes to "resolved"
  - Verify `resolved_at` timestamp is set

- [ ] **Edit Blocker**
  - Modify description or impact
  - Save and verify changes

- [ ] **Delete Blocker**
  - Delete a blocker
  - Verify removal

#### 4.2 API Testing

**Test Endpoints**:

1. **POST /api/blockers**
   ```json
   {
     "description": "API Test Blocker",
     "impact": "Testing blocker creation",
     "status": "active"
   }
   ```

2. **GET /api/blockers**
   - Test filter: `status=active`
   - Verify active blockers appear first in results

3. **PATCH /api/blockers/{id}**
   - Update description or impact

4. **POST /api/blockers/{id}/resolve**
   ```json
   {
     "resolution_notes": "Issue resolved by updating API endpoint"
   }
   ```
   - Verify status changes to "resolved"
   - Verify `resolved_at` is set

---

### 5. Integration Testing

#### 5.1 Cross-Feature Relationships

- [ ] **Link Blocker to Status Update**
  - Create a status update
  - Create a blocker and link it to the status update
  - Verify relationship is displayed

- [ ] **Link Blocker to Incident**
  - Create an incident
  - Create a blocker and link it to the incident
  - Verify relationship is displayed

#### 5.2 Dashboard Navigation

- [ ] **Navigate from Dashboard**
  - Go to http://localhost:3000/dashboard
  - Click on "Status Updates" card → should navigate to `/status`
  - Click on "Incidents" card → should navigate to `/incidents`
  - Click on "Blockers" card → should navigate to `/blockers`
  - Verify all links work

#### 5.3 Authorization Testing

- [ ] **Unauthorized Access**
  - Try accessing API endpoints without token
  - Verify 401 Unauthorized responses

- [ ] **Edit/Delete Permissions**
  - Create status update as User A
  - Login as User B
  - Try to edit/delete User A's status update
  - Verify 403 Forbidden or appropriate error

---

### 6. Error Handling Testing

- [ ] **Invalid Data**
  - Try creating status update with empty title
  - Try creating incident with invalid severity
  - Try creating blocker with empty description
  - Verify appropriate error messages

- [ ] **Not Found**
  - Try accessing non-existent status update/incident/blocker
  - Verify 404 response

- [ ] **Network Errors**
  - Stop backend container
  - Try frontend operations
  - Verify error messages are displayed

---

### 7. Performance Testing

- [ ] **Pagination Performance**
  - Create 50+ status updates
  - Verify pagination works smoothly
  - Check page load times

- [ ] **Filter Performance**
  - Test filters with large datasets
  - Verify response times are acceptable

---

## Quick Test Script

You can use this curl script to quickly test the API (replace `YOUR_TOKEN` with actual JWT token):

```bash
# Get token first (login)
TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}' \
  | jq -r '.access_token')

# Create status update
curl -X POST "http://localhost:8000/api/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Status","content":"Testing","tags":["test"]}'

# Create incident
curl -X POST "http://localhost:8000/api/incidents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Incident","description":"Testing","severity":"medium"}'

# Create blocker
curl -X POST "http://localhost:8000/api/blockers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test Blocker","impact":"Testing"}'
```

---

## Known Issues to Watch For

- [ ] Check browser console for any JavaScript errors
- [ ] Check backend logs for any Python errors
- [ ] Verify CORS is working (no CORS errors in console)
- [ ] Verify timestamps are displayed correctly
- [ ] Verify tags are displayed and editable correctly

---

## Reporting Issues

If you find any issues during testing:

1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check backend logs: `docker-compose logs backend`
4. Check frontend logs: `docker-compose logs frontend`
5. Document the expected vs actual behavior

---

## Next Steps After Testing

Once testing is complete:
- Fix any bugs found
- Update PROGRESS.md to reflect Phase 3 completion
- Consider adding automated tests
- Proceed to Phase 4 (Decision Log & Audit Trail)
