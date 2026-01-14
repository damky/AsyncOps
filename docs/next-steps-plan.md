# Next Steps Plan - Phase 3: Core Features

## Current Status

✅ **Phase 1**: Foundation & Infrastructure (100% Complete)
✅ **Phase 2**: Authentication & Authorization (100% Complete)
✅ **Phase 3**: Core Features - Status Updates & Tracking (100% Complete)

---

## Phase 3 Implementation Plan

### Overview
Implement the three core features: Status Updates, Incident Tracking, and Blocker Management. This includes database models, API endpoints, and frontend components.

**Estimated Timeline**: 2 weeks (Weeks 4-5)

---

## Task Breakdown

### Step 1: Database Models & Migrations (Backend)

#### 1.1 Create Status Update Model
**File**: `backend/app/db/models/status_update.py`

**Tasks**:
- Create `StatusUpdate` model with fields:
  - `id`, `user_id` (FK), `title`, `content`, `tags` (array), `created_at`, `updated_at`
- Add relationship to `User` model
- Add indexes: `user_id`, `created_at DESC`, `tags` (GIN index)

**Dependencies**: User model exists ✅

**Estimated Time**: 30 minutes

---

#### 1.2 Create Incident Model
**File**: `backend/app/db/models/incident.py`

**Tasks**:
- Create `Incident` model with fields:
  - `id`, `reported_by_id` (FK), `assigned_to_id` (FK, nullable), `title`, `description`
  - `severity` (enum: low, medium, high, critical), `status` (enum: open, in_progress, resolved, closed)
  - `resolution_notes`, `created_at`, `updated_at`, `resolved_at` (nullable)
- Add relationships to `User` model (reported_by, assigned_to)
- Add indexes: `reported_by_id`, `assigned_to_id`, `status`, `severity`, `created_at DESC`
- Add composite index: `(status, severity)`

**Dependencies**: User model exists ✅

**Estimated Time**: 45 minutes

---

#### 1.3 Create Blocker Model
**File**: `backend/app/db/models/blocker.py`

**Tasks**:
- Create `Blocker` model with fields:
  - `id`, `reported_by_id` (FK), `description`, `impact`, `status` (enum: active, resolved)
  - `resolution_notes`, `related_status_id` (FK, nullable), `related_incident_id` (FK, nullable)
  - `created_at`, `updated_at`, `resolved_at` (nullable)
- Add relationships to `User`, `StatusUpdate`, and `Incident` models
- Add indexes: `reported_by_id`, `status`, `created_at DESC`, `related_status_id`, `related_incident_id`

**Dependencies**: User model exists ✅, StatusUpdate model (Step 1.1), Incident model (Step 1.2)

**Estimated Time**: 45 minutes

---

#### 1.4 Update Models `__init__.py`
**File**: `backend/app/db/models/__init__.py`

**Tasks**:
- Import and export all new models
- Ensure Base is properly exported

**Estimated Time**: 5 minutes

---

#### 1.5 Create Database Migration
**File**: `backend/migrations/versions/002_add_core_features.py`

**Tasks**:
- Create Alembic migration for:
  - `status_updates` table
  - `incidents` table
  - `blockers` table
  - All indexes and foreign keys
  - Check constraints for enums

**Dependencies**: All models created (Steps 1.1-1.3)

**Estimated Time**: 1 hour

---

### Step 2: Pydantic Schemas (Backend)

#### 2.1 Status Update Schemas
**File**: `backend/app/schemas/status_update.py`

**Tasks**:
- Create `StatusUpdateBase` (title, content, tags)
- Create `StatusUpdateCreate` (inherits from Base)
- Create `StatusUpdateUpdate` (all fields optional)
- Create `StatusUpdate` (full model with id, user_id, timestamps)
- Create `StatusUpdateList` (for paginated responses)

**Estimated Time**: 30 minutes

---

#### 2.2 Incident Schemas
**File**: `backend/app/schemas/incident.py`

**Tasks**:
- Create `IncidentBase` (title, description, severity, assigned_to_id)
- Create `IncidentCreate` (inherits from Base)
- Create `IncidentUpdate` (all fields optional)
- Create `IncidentStatusUpdate` (status, resolution_notes)
- Create `IncidentAssign` (assigned_to_id)
- Create `Incident` (full model with all fields)
- Create `IncidentList` (for paginated responses)

**Estimated Time**: 45 minutes

---

#### 2.3 Blocker Schemas
**File**: `backend/app/schemas/blocker.py`

**Tasks**:
- Create `BlockerBase` (description, impact, related_status_id, related_incident_id)
- Create `BlockerCreate` (inherits from Base)
- Create `BlockerUpdate` (all fields optional)
- Create `BlockerResolve` (resolution_notes)
- Create `Blocker` (full model with all fields)
- Create `BlockerList` (for paginated responses)

**Estimated Time**: 30 minutes

---

### Step 3: API Endpoints (Backend)

#### 3.1 Status Update Endpoints
**File**: `backend/app/api/v1/endpoints/status.py`

**Tasks**:
- `POST /api/status` - Create status update
- `GET /api/status` - List status updates (with pagination, filtering by author, date range)
- `GET /api/status/{id}` - Get single status update
- `PATCH /api/status/{id}` - Update status update (author only)
- `DELETE /api/status/{id}` - Delete status update (author only)

**Features**:
- Authentication required for all endpoints
- Authorization check for update/delete (author only)
- Pagination support
- Filtering by `author_id`, `start_date`, `end_date`
- Tag filtering (optional)

**Estimated Time**: 2 hours

---

#### 3.2 Incident Endpoints
**File**: `backend/app/api/v1/endpoints/incidents.py`

**Tasks**:
- `POST /api/incidents` - Create incident
- `GET /api/incidents` - List incidents (with pagination, filtering)
- `GET /api/incidents/{id}` - Get single incident
- `PATCH /api/incidents/{id}` - Update incident
- `PATCH /api/incidents/{id}/status` - Update incident status
- `PATCH /api/incidents/{id}/assign` - Assign incident to user

**Features**:
- Authentication required for all endpoints
- Filtering by `status`, `severity`, `assigned_to_id`
- Default sort: severity (critical first), then created_at (newest first)
- Status transition validation
- Auto-populate `resolved_at` when status changes to resolved/closed

**Estimated Time**: 3 hours

---

#### 3.3 Blocker Endpoints
**File**: `backend/app/api/v1/endpoints/blockers.py`

**Tasks**:
- `POST /api/blockers` - Create blocker
- `GET /api/blockers` - List blockers (with pagination, filtering)
- `GET /api/blockers/{id}` - Get single blocker
- `PATCH /api/blockers/{id}` - Update blocker
- `PATCH /api/blockers/{id}/resolve` - Resolve blocker

**Features**:
- Authentication required for all endpoints
- Filtering by `status`
- Default sort: status (active first), then created_at (newest first)
- Auto-populate `resolved_at` when resolved

**Estimated Time**: 2 hours

---

#### 3.4 Register Routes
**File**: `backend/app/api/v1/api.py`

**Tasks**:
- Import and register all new routers
- Add appropriate prefixes and tags

**Estimated Time**: 10 minutes

---

### Step 4: Frontend Types (TypeScript)

#### 4.1 Status Update Types
**File**: `frontend/src/types/statusUpdate.ts`

**Tasks**:
- Define `StatusUpdate`, `StatusUpdateCreate`, `StatusUpdateUpdate` interfaces
- Match backend schemas

**Estimated Time**: 15 minutes

---

#### 4.2 Incident Types
**File**: `frontend/src/types/incident.ts`

**Tasks**:
- Define `Incident`, `IncidentCreate`, `IncidentUpdate`, `IncidentStatus`, `IncidentSeverity` interfaces
- Match backend schemas

**Estimated Time**: 15 minutes

---

#### 4.3 Blocker Types
**File**: `frontend/src/types/blocker.ts`

**Tasks**:
- Define `Blocker`, `BlockerCreate`, `BlockerUpdate`, `BlockerStatus` interfaces
- Match backend schemas

**Estimated Time**: 15 minutes

---

### Step 5: Frontend Services (API Clients)

#### 5.1 Status Update Service
**File**: `frontend/src/services/statusService.ts`

**Tasks**:
- Create functions: `createStatusUpdate`, `getStatusUpdates`, `getStatusUpdate`, `updateStatusUpdate`, `deleteStatusUpdate`
- Handle authentication headers
- Error handling

**Estimated Time**: 30 minutes

---

#### 5.2 Incident Service
**File**: `frontend/src/services/incidentService.ts`

**Tasks**:
- Create functions: `createIncident`, `getIncidents`, `getIncident`, `updateIncident`, `updateIncidentStatus`, `assignIncident`
- Handle authentication headers
- Error handling

**Estimated Time**: 45 minutes

---

#### 5.3 Blocker Service
**File**: `frontend/src/services/blockerService.ts`

**Tasks**:
- Create functions: `createBlocker`, `getBlockers`, `getBlocker`, `updateBlocker`, `resolveBlocker`
- Handle authentication headers
- Error handling

**Estimated Time**: 30 minutes

---

### Step 6: Frontend Components

#### 6.1 Status Updates Components
**Files**: 
- `frontend/src/components/StatusUpdateList.tsx`
- `frontend/src/components/StatusUpdateForm.tsx`
- `frontend/src/components/StatusUpdateCard.tsx`

**Tasks**:
- List component with pagination
- Form component for create/edit
- Card component for display
- Filtering UI (author, date range, tags)
- Loading and error states

**Estimated Time**: 3 hours

---

#### 6.2 Incidents Components
**Files**:
- `frontend/src/components/IncidentList.tsx`
- `frontend/src/components/IncidentForm.tsx`
- `frontend/src/components/IncidentCard.tsx`
- `frontend/src/components/IncidentDetail.tsx`

**Tasks**:
- List component with filtering (status, severity, assigned_to)
- Form component for create/edit
- Card component for display
- Detail view component
- Status update UI
- Assignment UI
- Loading and error states

**Estimated Time**: 4 hours

---

#### 6.3 Blockers Components
**Files**:
- `frontend/src/components/BlockerList.tsx`
- `frontend/src/components/BlockerForm.tsx`
- `frontend/src/components/BlockerCard.tsx`

**Tasks**:
- List component with filtering (status)
- Form component for create/edit
- Card component for display
- Resolve blocker UI
- Loading and error states

**Estimated Time**: 2.5 hours

---

### Step 7: Frontend Pages

#### 7.1 Status Updates Page
**File**: `frontend/src/pages/StatusUpdates.tsx`

**Tasks**:
- Integrate StatusUpdateList and StatusUpdateForm
- Handle routing
- Manage state

**Estimated Time**: 1 hour

---

#### 7.2 Incidents Page
**File**: `frontend/src/pages/Incidents.tsx`

**Tasks**:
- Integrate IncidentList and IncidentForm
- Handle routing
- Manage state

**Estimated Time**: 1 hour

---

#### 7.3 Blockers Page
**File**: `frontend/src/pages/Blockers.tsx`

**Tasks**:
- Integrate BlockerList and BlockerForm
- Handle routing
- Manage state

**Estimated Time**: 1 hour

---

#### 7.4 Update Navigation
**File**: `frontend/src/App.tsx` (or navigation component)

**Tasks**:
- Add routes for new pages
- Update navigation menu
- Add links to dashboard

**Estimated Time**: 30 minutes

---

### Step 8: Testing & Validation

#### 8.1 Backend Testing
**Tasks**:
- Test all API endpoints manually via `/docs`
- Verify authentication/authorization
- Test pagination
- Test filtering
- Test validation errors
- Test edge cases

**Estimated Time**: 2 hours

---

#### 8.2 Frontend Testing
**Tasks**:
- Test all components render correctly
- Test form submissions
- Test error handling
- Test loading states
- Test filtering and pagination
- Test responsive design

**Estimated Time**: 2 hours

---

#### 8.3 Integration Testing
**Tasks**:
- Test full user flows:
  - Create status update → View in list → Edit → Delete
  - Create incident → Assign → Update status → Resolve
  - Create blocker → Resolve
- Test cross-feature relationships (blockers linked to incidents/status)

**Estimated Time**: 1 hour

---

## Implementation Order

### Week 1: Backend Foundation
1. ✅ Step 1: Database Models & Migrations (2.5 hours)
2. ✅ Step 2: Pydantic Schemas (1.75 hours)
3. ✅ Step 3: API Endpoints (7 hours)
4. ✅ Step 8.1: Backend Testing (2 hours)

**Week 1 Total**: ~13 hours

### Week 2: Frontend Implementation
5. ✅ Step 4: Frontend Types (45 minutes)
6. ✅ Step 5: Frontend Services (1.75 hours)
7. ✅ Step 6: Frontend Components (9.5 hours)
8. ✅ Step 7: Frontend Pages (3.5 hours)
9. ✅ Step 8.2-8.3: Frontend & Integration Testing (3 hours)

**Week 2 Total**: ~18 hours

---

## Priority Order (If Time-Constrained)

### Must Have (MVP):
1. Status Updates (full CRUD)
2. Incidents (create, list, update status)
3. Blockers (create, list, resolve)

### Nice to Have (Can Defer):
- Advanced filtering
- Tag search
- Related items linking (blockers to incidents/status)
- Detailed incident assignment UI

---

## Success Criteria

✅ All three core features implemented
✅ Database models created and migrated
✅ API endpoints functional and tested
✅ Frontend components built and integrated
✅ Basic filtering working
✅ Pagination working
✅ Authentication/authorization enforced
✅ Error handling in place
✅ Responsive design

---

## Next Phase Preview

After Phase 4 completion:
- ✅ **Phase 4**: Decision Log & Audit Trail (COMPLETE)
- **Phase 5**: Daily Summary Automation
- **Phase 6**: Polish & Production Readiness

---

## Notes

- Follow existing code patterns from Phase 2 (auth implementation)
- Use TypeScript strict mode
- Ensure proper error handling throughout
- Add loading states for all async operations
- Test with multiple users to verify authorization
- Document any deviations from the plan
