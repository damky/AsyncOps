# Backend Tests

This directory contains automated tests for the AsyncOps backend API.

## Setup

Install test dependencies:

```bash
cd backend
pip install -r requirements.txt
```

## Running Tests

Run all tests:
```bash
pytest
```

Run with verbose output:
```bash
pytest -v
```

Run a specific test file:
```bash
pytest tests/test_auth.py
```

Run a specific test:
```bash
pytest tests/test_auth.py::TestRegister::test_register_success
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

## Test Structure

- `conftest.py` - Pytest configuration and shared fixtures
- `test_auth.py` - Authentication endpoint tests
- `test_status_updates.py` - Status update endpoint tests

## Test Database

Tests use an in-memory SQLite database that is created fresh for each test. This ensures:
- Tests are isolated from each other
- No need for a running database server
- Fast test execution

## Fixtures

Common fixtures available in `conftest.py`:
- `db_session` - Database session for each test
- `client` - FastAPI test client
- `test_user` - Regular member user
- `test_admin` - Admin user
- `auth_headers` - Authentication headers for test_user
- `admin_headers` - Authentication headers for test_admin

## Writing New Tests

1. Create a new test file: `test_<feature>.py`
2. Import necessary fixtures from conftest
3. Use the test client and fixtures to test endpoints
4. Follow the existing test patterns

Example:
```python
def test_my_feature(client, auth_headers):
    response = client.get("/api/my-endpoint", headers=auth_headers)
    assert response.status_code == 200
```
