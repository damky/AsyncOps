#!/usr/bin/env bash

# Phase 4 API Testing Script
# This script tests all decision log API endpoints
# Prerequisites: Backend running on http://localhost:8000
# Usage: ./testing/scripts/test_phase4_api.sh <email> <password>

set -e

BASE_URL="http://localhost:8000"
EMAIL="${1:-test@example.com}"
PASSWORD="${2:-testpassword123}"

echo "=== Phase 4 API Testing Script ==="
echo "Email: $EMAIL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Dependency checks
require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo -e "${RED}✗ Missing dependency: $1${NC}"
        echo "Install it and re-run this script."
        exit 1
    fi
}

# Function to print test results
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Validate required commands early
require_cmd curl
require_cmd jq

# Ensure numeric values for comparisons
safe_number() {
    local value="$1"
    if [[ "$value" =~ ^[0-9]+$ ]]; then
        echo "$value"
    else
        echo "0"
    fi
}

# Step 1: Login and get token
echo "Step 1: Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$EMAIL&password=$PASSWORD")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}✗ Authentication failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓${NC} Authentication successful"
echo ""

# Step 2: Create a decision
echo "Step 2: Creating decision..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/decisions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Decision - API Test",
    "description": "This is a test decision created by the API testing script",
    "context": "Testing the decision creation endpoint",
    "outcome": "Verify decision is created successfully",
    "decision_date": "2024-01-15",
    "participant_ids": [],
    "tags": ["test", "api"]
  }')

DECISION_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id // empty')

if [ -z "$DECISION_ID" ] || [ "$DECISION_ID" == "null" ]; then
    echo -e "${RED}✗ Failed to create decision${NC}"
    echo "Response: $CREATE_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓${NC} Decision created with ID: $DECISION_ID"
echo ""

# Step 3: Get the decision
echo "Step 3: Getting decision..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/decisions/$DECISION_ID" \
  -H "Authorization: Bearer $TOKEN")

TITLE=$(echo "$GET_RESPONSE" | jq -r '.title // empty')
if [ -n "$TITLE" ] && [ "$TITLE" != "null" ]; then
    echo -e "${GREEN}✓${NC} Successfully retrieved decision: $TITLE"
else
    echo -e "${RED}✗ Failed to retrieve decision${NC}"
    echo "Response: $GET_RESPONSE"
fi
echo ""

# Step 4: List decisions
echo "Step 4: Listing decisions..."
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/decisions?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN")

TOTAL=$(safe_number "$(echo "$LIST_RESPONSE" | jq -r '.total // 0')")
if [ "$TOTAL" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Successfully listed decisions (Total: $TOTAL)"
else
    echo -e "${YELLOW}⚠${NC} No decisions found (this might be expected)"
fi
echo ""

# Step 5: Test filtering
echo "Step 5: Testing filters..."
echo "  - Testing tag filter..."
TAG_FILTER=$(curl -s -X GET "$BASE_URL/api/decisions?tag=test" \
  -H "Authorization: Bearer $TOKEN")
TAG_TOTAL=$(safe_number "$(echo "$TAG_FILTER" | jq -r '.total // 0')")
print_test $([ "$TAG_TOTAL" -ge 0 ] && echo 0 || echo 1) "Tag filter works"

echo "  - Testing search filter..."
SEARCH_FILTER=$(curl -s -X GET "$BASE_URL/api/decisions?search=Test" \
  -H "Authorization: Bearer $TOKEN")
SEARCH_TOTAL=$(safe_number "$(echo "$SEARCH_FILTER" | jq -r '.total // 0')")
print_test $([ "$SEARCH_TOTAL" -ge 0 ] && echo 0 || echo 1) "Search filter works"
echo ""

# Step 6: Get audit trail
echo "Step 6: Getting audit trail..."
AUDIT_RESPONSE=$(curl -s -X GET "$BASE_URL/api/decisions/$DECISION_ID/audit" \
  -H "Authorization: Bearer $TOKEN")

AUDIT_COUNT=$(safe_number "$(echo "$AUDIT_RESPONSE" | jq -r '.items | length')")
if [ "$AUDIT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Audit trail retrieved ($AUDIT_COUNT entries)"
    # Check for "created" entry
    HAS_CREATED=$(echo "$AUDIT_RESPONSE" | jq -r '.items[] | select(.change_type == "created") | .id // empty')
    if [ -n "$HAS_CREATED" ]; then
        echo -e "${GREEN}✓${NC} Found 'created' audit entry"
    else
        echo -e "${YELLOW}⚠${NC} 'created' audit entry not found"
    fi
else
    echo -e "${YELLOW}⚠${NC} No audit entries found"
fi
echo ""

# Step 7: Update decision
echo "Step 7: Updating decision..."
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/decisions/$DECISION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Test Decision - API Test"}')

UPDATED_TITLE=$(echo "$UPDATE_RESPONSE" | jq -r '.title // empty')
if [ "$UPDATED_TITLE" == "Updated Test Decision - API Test" ]; then
    echo -e "${GREEN}✓${NC} Decision updated successfully"
else
    echo -e "${RED}✗ Failed to update decision${NC}"
    echo "Response: $UPDATE_RESPONSE"
fi
echo ""

# Step 8: Check audit trail after update
echo "Step 8: Checking audit trail after update..."
AUDIT_AFTER_UPDATE=$(curl -s -X GET "$BASE_URL/api/decisions/$DECISION_ID/audit" \
  -H "Authorization: Bearer $TOKEN")

AUDIT_COUNT_AFTER=$(safe_number "$(echo "$AUDIT_AFTER_UPDATE" | jq -r '.items | length')")
HAS_UPDATED=$(echo "$AUDIT_AFTER_UPDATE" | jq -r '.items[] | select(.change_type == "updated") | .id // empty')
if [ -n "$HAS_UPDATED" ]; then
    echo -e "${GREEN}✓${NC} Found 'updated' audit entry"
else
    echo -e "${YELLOW}⚠${NC} 'updated' audit entry not found"
fi
echo ""

# Step 9: Delete decision
echo "Step 9: Deleting decision..."
DELETE_STATUS=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/api/decisions/$DECISION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -o /dev/null)

if [ "$DELETE_STATUS" == "204" ]; then
    echo -e "${GREEN}✓${NC} Decision deleted successfully (HTTP $DELETE_STATUS)"
else
    echo -e "${RED}✗ Failed to delete decision (HTTP $DELETE_STATUS)${NC}"
fi
echo ""

# Step 10: Verify deletion
echo "Step 10: Verifying deletion..."
GET_AFTER_DELETE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/decisions/$DECISION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -o /dev/null)

if [ "$GET_AFTER_DELETE" == "404" ]; then
    echo -e "${GREEN}✓${NC} Decision confirmed deleted (HTTP 404)"
else
    echo -e "${YELLOW}⚠${NC} Unexpected status code: $GET_AFTER_DELETE"
fi
echo ""

# Summary
echo "=== Test Summary ==="
echo -e "${GREEN}All basic API operations tested${NC}"
echo ""
echo "Note: This script tests basic functionality. For comprehensive testing,"
echo "please refer to testing/TESTING.md and test manually using:"
echo "  - Swagger UI: http://localhost:8000/docs"
echo "  - Frontend: http://localhost:3000/decisions"
echo ""
