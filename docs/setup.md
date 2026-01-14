# Quick Setup Guide

This guide will help you get AsyncOps running locally.

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+ (for local frontend development, optional)
- Python 3.11+ (for local backend development, optional)

## Quick Start

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd AsyncOps
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   - `POSTGRES_PASSWORD` - Choose a secure password
   - `BACKEND_SECRET_KEY` - Generate with: `openssl rand -hex 32`

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up
   ```
   
   This will start:
   - PostgreSQL database (port 5432)
   - FastAPI backend (port 8000)
   - React frontend (port 3000)
   - Background worker

4. **Initialize the database**
   
   In a new terminal, run migrations:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```
   
   Or if running locally:
   ```bash
   cd backend
   source venv/bin/activate
   alembic upgrade head
   ```

5. **Create initial admin user** (optional)
   
   You can create an admin user via the API:
   ```bash
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@asyncops.local",
       "password": "SecurePassword123",
       "full_name": "Admin User"
     }'
   ```
   
   Then manually update the role to "admin" in the database or via API.

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development Workflow

### Backend Development

1. **Set up Python environment** (if not using Docker)
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run backend locally**
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Create a new migration**
   ```bash
   alembic revision --autogenerate -m "description"
   alembic upgrade head
   ```

### Frontend Development

1. **Install dependencies** (if not using Docker)
   ```bash
   cd frontend
   npm install
   ```

2. **Run frontend locally**
   ```bash
   npm run dev
   ```

## Next Steps

1. Review the [Project Plan](project-plan.md) for implementation phases
2. Check [Feature Requirements](feature-requirements.md) for detailed specs
3. See [Development Setup](development-setup.md) for more details
4. Start implementing Phase 1 features!

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check database logs: `docker-compose logs db`
- Verify credentials in `.env` file

### Port conflicts
- Change ports in `docker-compose.yml` if 3000, 8000, or 5432 are in use
- Or stop conflicting services

### Migration errors
- Ensure database is running
- Check `DATABASE_URL` in `.env`
- Try: `alembic downgrade -1` then `alembic upgrade head`

For more help, see the [Development Setup Guide](development-setup.md).
