# Development Setup Guide

This guide will help you set up a local development environment for AsyncOps.

## Prerequisites

### Required Software

- **Docker Desktop** (version 20.10+)
  - Download: https://www.docker.com/products/docker-desktop
  - Required for running containers locally

- **Node.js** (version 22.12+)
  - Download: https://nodejs.org/
  - Required for frontend development
  - Verify: `node --version`

- **Python** (version 3.11+)
  - Download: https://www.python.org/downloads/
  - Required for backend development
  - Verify: `python --version` or `python3 --version`

- **Git**
  - Download: https://git-scm.com/downloads
  - Verify: `git --version`

### Recommended Tools

- **VS Code** (or your preferred editor)
  - Extensions: Python, ESLint, Prettier, Docker
- **PostgreSQL Client** (optional, for direct database access)
  - pgAdmin or DBeaver
- **API Testing Tool** (optional)
  - Postman or Insomnia

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourname/asyncops.git
cd asyncops
```

### 2. Project Structure

```
asyncops/
├── frontend/          # React + TypeScript application
├── backend/           # FastAPI application
├── docs/              # Documentation
├── docker-compose.yml # Local development orchestration
├── .env.example       # Environment variables template
└── README.md
```

---

## Environment Configuration

### 1. Create Environment Files

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your local settings:

```bash
# Database
POSTGRES_USER=asyncops
POSTGRES_PASSWORD=dev_password_change_me
POSTGRES_DB=asyncops_dev
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Backend
BACKEND_SECRET_KEY=your-secret-key-here-change-in-production
BACKEND_ALGORITHM=HS256
BACKEND_ACCESS_TOKEN_EXPIRE_MINUTES=1440
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:8000

# Development
ENVIRONMENT=development
DEBUG=true
```

**Important**: 
- Change `POSTGRES_PASSWORD` to a secure password
- Generate a secure `BACKEND_SECRET_KEY` (use: `openssl rand -hex 32`)
- Never commit `.env` to version control

---

## Docker Compose Setup

### 1. Docker Compose Configuration

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: asyncops_db
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: asyncops_backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
      - /app/__pycache__
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - SECRET_KEY=${BACKEND_SECRET_KEY}
      - ALGORITHM=${BACKEND_ALGORITHM}
      - ACCESS_TOKEN_EXPIRE_MINUTES=${BACKEND_ACCESS_TOKEN_EXPIRE_MINUTES}
      - CORS_ORIGINS=${BACKEND_CORS_ORIGINS}
      - ENVIRONMENT=${ENVIRONMENT}
      - DEBUG=${DEBUG}
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: asyncops_frontend
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
    depends_on:
      - backend

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: asyncops_worker
    command: python -m app.workers.summary_scheduler
    volumes:
      - ./backend:/app
      - /app/__pycache__
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - SECRET_KEY=${BACKEND_SECRET_KEY}
      - ENVIRONMENT=${ENVIRONMENT}
    depends_on:
      db:
        condition: service_healthy
      backend:
        condition: service_healthy

volumes:
  postgres_data:
```

### 2. Start Services

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Start FastAPI backend
- Start React frontend
- Start background worker

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 4. Stop Services

```bash
docker-compose down
```

To also remove volumes (clears database):

```bash
docker-compose down -v
```

---

## Backend Setup

### 1. Install Dependencies (Local Development)

If developing outside Docker:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Migrations

Run initial migrations:

```bash
# Inside backend container or local environment
cd backend
alembic upgrade head
```

Create a new migration:

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### 3. Create Initial Admin User

```bash
# Inside backend container
python -m app.scripts.create_admin
```

Or via Python shell:

```python
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    email="admin@asyncops.local",
    password_hash=get_password_hash("admin_password_change_me"),
    full_name="Admin User",
    role="admin"
)
db.add(admin)
db.commit()
```

### 4. Run Backend Locally (Without Docker)

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

## Frontend Setup

### 1. Install Dependencies (Local Development)

If developing outside Docker:

```bash
cd frontend
npm install
```

### 2. Run Frontend Locally (Without Docker)

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000` (or port shown in terminal)

### 3. Build for Production

```bash
npm run build
```

Built files will be in `frontend/dist/`

---

## Database Setup

### 1. Connect to Database

Using Docker:

```bash
docker-compose exec db psql -U asyncops -d asyncops_dev
```

Using local PostgreSQL client:

```
Host: localhost
Port: 5432
Database: asyncops_dev
User: asyncops
Password: (from .env)
```

### 2. Common Database Commands

```sql
-- List all tables
\dt

-- Describe a table
\d users

-- View users
SELECT id, email, full_name, role FROM users;

-- Reset database (CAUTION: deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### 3. Seed Sample Data (Optional)

```bash
# Inside backend container
python -m app.scripts.seed_data
```

---

## Development Workflow

### 1. Making Changes

- **Frontend**: Changes are hot-reloaded automatically (if using dev server)
- **Backend**: Changes are hot-reloaded with `--reload` flag
- **Database**: Run migrations after schema changes

### 2. Running Tests

Backend tests:

```bash
# Inside backend container or local environment
cd backend
pytest
pytest tests/ -v  # Verbose
pytest tests/test_auth.py  # Specific test file
```

Frontend tests:

```bash
cd frontend
npm test
npm run test:coverage
```

### 3. Code Quality

Linting:

```bash
# Backend
cd backend
black .  # Format code
flake8 .  # Lint code
mypy .  # Type checking

# Frontend
cd frontend
npm run lint
npm run format
```

### 4. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add feature X"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

---

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database

**Solutions**:
- Check if database container is running: `docker-compose ps`
- Verify database credentials in `.env`
- Check database logs: `docker-compose logs db`
- Ensure database is healthy: `docker-compose exec db pg_isready`

### Port Already in Use

**Problem**: Port 3000, 8000, or 5432 already in use

**Solutions**:
- Change ports in `docker-compose.yml`
- Stop conflicting services
- Find and kill process using port:
  ```bash
  # macOS/Linux
  lsof -i :8000
  kill -9 <PID>
  
  # Windows
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  ```

### Docker Build Issues

**Problem**: Docker build fails

**Solutions**:
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`
- Check Dockerfile syntax
- Ensure all required files exist

### Migration Issues

**Problem**: Alembic migration fails

**Solutions**:
- Check database connection
- Verify migration files are correct
- Rollback if needed: `alembic downgrade -1`
- Check migration history: `alembic history`

### Frontend Build Issues

**Problem**: Frontend build or dev server fails

**Solutions**:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist .vite`
- Check Node.js version: `node --version` (should be 22.12+)
- Check for dependency conflicts

### Backend Import Errors

**Problem**: Python import errors

**Solutions**:
- Verify virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python path and PYTHONPATH
- Ensure `__init__.py` files exist in packages

---

## Development Tips

### 1. Hot Reload

- Frontend: Vite/Webpack dev server auto-reloads on file changes
- Backend: Uvicorn with `--reload` flag auto-reloads on Python file changes
- Database: Restart container after migration changes

### 2. Debugging

**Backend**:
- Use `print()` or `logging` for debugging
- Use VS Code debugger with Python extension
- Check logs: `docker-compose logs -f backend`

**Frontend**:
- Use browser DevTools
- React DevTools extension
- Check console for errors
- Check network tab for API calls

### 3. API Testing

- Use Swagger UI: `http://localhost:8000/docs`
- Use Postman/Insomnia
- Use `curl`:
  ```bash
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"password"}'
  ```

### 4. Database Inspection

- Use pgAdmin or DBeaver for GUI
- Use `psql` for command line
- Use SQLAlchemy shell:
  ```python
  from app.db.session import SessionLocal
  from app.models.user import User
  db = SessionLocal()
  users = db.query(User).all()
  ```

---

## Environment Variables Reference

### Backend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `SECRET_KEY` | JWT signing secret | - | Yes |
| `ALGORITHM` | JWT algorithm | HS256 | No |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | 1440 | No |
| `CORS_ORIGINS` | Allowed CORS origins | - | Yes |
| `ENVIRONMENT` | Environment name | development | No |
| `DEBUG` | Debug mode | false | No |

### Frontend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | - | Yes |

### Database Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_USER` | Database user | asyncops | No |
| `POSTGRES_PASSWORD` | Database password | - | Yes |
| `POSTGRES_DB` | Database name | asyncops_dev | No |
| `POSTGRES_HOST` | Database host | db | No |
| `POSTGRES_PORT` | Database port | 5432 | No |

---

## Next Steps

1. **Run the application**: `docker-compose up`
2. **Access frontend**: `http://localhost:3000`
3. **Access API docs**: `http://localhost:8000/docs`
4. **Create admin user**: Follow backend setup steps
5. **Start developing**: Make changes and see them hot-reload

For more information, see:
- [Project Plan](project-plan.md)
- [Feature Requirements](feature-requirements.md)
- [API Specification](api-specification.md)
- [Architecture Documentation](architecture.md)
