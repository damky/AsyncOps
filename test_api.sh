#!/bin/bash

# Quick API Testing Script for AsyncOps Phase 3
# This script tests the core features: Status Updates, Incidents, and Blockers

API_BASE="http://localhost:8000/api"
EMAIL="${1:-test@example.com}"
PASSWORD="${2:-testpassword123}"

echo "🧪 AsyncOps Phase 3 API Testing"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print info
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Step 1: Login and get token
info "Step 1: Logging in as $EMAIL..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$EMAIL&password=$PASSWORD")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    error "Login failed. Response: $LOGIN_RESPONSE"
    info "Trying to register first..."
    REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"full_name\":\"Test User\"}")
    
    if echo $REGISTER_RESPONSE | jq -e '.id' > /dev/null 2>&1; then
        success "Registration successful, now logging in..."
        # Login after registration
        LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
          -H "Content-Type: application/x-www-form-urlencoded" \
          -d "username=$EMAIL&password=$PASSWORD")
        TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token // empty')
        if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
            success "Login successful after registration"
        else
            error "Login failed after registration. Response: $LOGIN_RESPONSE"
            exit 1
        fi
    else
        error "Registration failed. Please create an account manually or check credentials."
        error "Response: $REGISTER_RESPONSE"
        exit 1
    fi
else
    success "Login successful"
fi

echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test Status Updates
info "Step 2: Testing Status Updates API..."

# Create status update
STATUS_CREATE=$(curl -s -X POST "$API_BASE/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Status Update",
    "content": "This is a test status update created via API testing script.",
    "tags": ["test", "api", "automation"]
  }')

STATUS_ID=$(echo $STATUS_CREATE | jq -r '.id // empty')

if [ -n "$STATUS_ID" ] && [ "$STATUS_ID" != "null" ]; then
    success "Status update created (ID: $STATUS_ID)"
else
    error "Failed to create status update. Response: $STATUS_CREATE"
    STATUS_ID=""
fi

# Get status updates list
if [ -n "$STATUS_ID" ]; then
    STATUS_LIST=$(curl -s -X GET "$API_BASE/status?page=1&limit=10" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo $STATUS_LIST | jq -e '.items' > /dev/null 2>&1; then
        COUNT=$(echo $STATUS_LIST | jq '.items | length')
        success "Retrieved status updates list ($COUNT items)"
    else
        error "Failed to retrieve status updates list"
    fi
    
    # Get single status update
    STATUS_GET=$(curl -s -X GET "$API_BASE/status/$STATUS_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo $STATUS_GET | jq -e '.id' > /dev/null 2>&1; then
        success "Retrieved single status update"
    else
        error "Failed to retrieve status update"
    fi
fi

echo ""

# Step 3: Test Incidents API
info "Step 3: Testing Incidents API..."

# Create incident
INCIDENT_CREATE=$(curl -s -X POST "$API_BASE/incidents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Incident",
    "description": "This is a test incident created via API testing script.",
    "severity": "medium",
    "status": "open"
  }')

INCIDENT_ID=$(echo $INCIDENT_CREATE | jq -r '.id // empty')

if [ -n "$INCIDENT_ID" ] && [ "$INCIDENT_ID" != "null" ]; then
    success "Incident created (ID: $INCIDENT_ID)"
else
    error "Failed to create incident. Response: $INCIDENT_CREATE"
    INCIDENT_ID=""
fi

# Get incidents list
if [ -n "$INCIDENT_ID" ]; then
    INCIDENT_LIST=$(curl -s -X GET "$API_BASE/incidents?page=1&limit=10" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo $INCIDENT_LIST | jq -e '.items' > /dev/null 2>&1; then
        COUNT=$(echo $INCIDENT_LIST | jq '.items | length')
        success "Retrieved incidents list ($COUNT items)"
    else
        error "Failed to retrieve incidents list"
    fi
    
    # Update incident status
    INCIDENT_UPDATE=$(curl -s -X PATCH "$API_BASE/incidents/$INCIDENT_ID/status" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "status": "in_progress"
      }')
    
    if echo $INCIDENT_UPDATE | jq -e '.status' > /dev/null 2>&1; then
        NEW_STATUS=$(echo $INCIDENT_UPDATE | jq -r '.status')
        success "Updated incident status to: $NEW_STATUS"
    else
        error "Failed to update incident status"
    fi
fi

echo ""

# Step 4: Test Blockers API
info "Step 4: Testing Blockers API..."

# Create blocker
BLOCKER_CREATE=$(curl -s -X POST "$API_BASE/blockers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test Blocker - Waiting on external API documentation",
    "impact": "Cannot proceed with integration work until documentation is available",
    "status": "active"
  }')

BLOCKER_ID=$(echo $BLOCKER_CREATE | jq -r '.id // empty')

if [ -n "$BLOCKER_ID" ] && [ "$BLOCKER_ID" != "null" ]; then
    success "Blocker created (ID: $BLOCKER_ID)"
else
    error "Failed to create blocker. Response: $BLOCKER_CREATE"
    BLOCKER_ID=""
fi

# Get blockers list
if [ -n "$BLOCKER_ID" ]; then
    BLOCKER_LIST=$(curl -s -X GET "$API_BASE/blockers?page=1&limit=10" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo $BLOCKER_LIST | jq -e '.items' > /dev/null 2>&1; then
        COUNT=$(echo $BLOCKER_LIST | jq '.items | length')
        success "Retrieved blockers list ($COUNT items)"
    else
        error "Failed to retrieve blockers list"
    fi
    
    # Resolve blocker
    BLOCKER_RESOLVE=$(curl -s -X POST "$API_BASE/blockers/$BLOCKER_ID/resolve" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "resolution_notes": "Documentation received, blocker resolved"
      }')
    
    if echo $BLOCKER_RESOLVE | jq -e '.status' > /dev/null 2>&1; then
        NEW_STATUS=$(echo $BLOCKER_RESOLVE | jq -r '.status')
        success "Resolved blocker (status: $NEW_STATUS)"
    else
        error "Failed to resolve blocker"
    fi
fi

echo ""
echo "================================"
info "Testing complete!"
echo ""
info "Next steps:"
echo "  1. Visit http://localhost:3000 to test the frontend"
echo "  2. Visit http://localhost:8000/docs to explore the API"
echo "  3. Check TESTING.md for comprehensive testing checklist"
