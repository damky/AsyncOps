# Railway Deployment Guide

This guide walks you through deploying AsyncOps to Railway.

## Overview

Railway will host:
- **Backend** (FastAPI) - API server
- **Frontend** (React) - Static site served via Nginx
- **Worker** - Background worker for daily summaries
- **PostgreSQL Database** - Automatically provisioned by Railway

## Prerequisites

1. Railway account: [railway.app](https://railway.app)
2. Railway CLI installed: `npm i -g @railway/cli` or `brew install railway`
3. GitHub repository (already set up)

## Step 1: Install Railway CLI

```bash
# Option 1: npm
npm i -g @railway/cli

# Option 2: Homebrew (macOS)
brew install railway

# Option 3: Direct download
# Visit https://docs.railway.com/develop/cli
```

## Step 2: Login to Railway

```bash
railway login
```

## Step 3: Create Railway Project

```bash
# From project root
railway init
```

This will:
- Create a new Railway project
- Link it to your current directory
- Generate a `railway.json` file (optional, Railway can auto-detect services)

## Step 4: Add PostgreSQL Database

In Railway dashboard or via CLI:

```bash
railway add --database postgres
```

Or with a custom service name:

```bash
railway add --database postgres --service asyncops-db
```

This automatically creates a PostgreSQL database and sets up connection environment variables.

## Step 5: Deploy Backend Service

### 5a. Create Backend Service

In Railway dashboard:
1. Click "New" → "GitHub Repo"
2. Select your AsyncOps repository
3. Railway will auto-detect the backend service from `backend/Dockerfile`

Or via CLI:
```bash
railway up --service backend
```

### 5b. Configure Backend Environment Variables

In Railway dashboard, go to your backend service → Variables tab, add:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://your-frontend-domain.railway.app,https://your-custom-domain.com
ENVIRONMENT=production
DEBUG=false
```

**Important**: Replace `your-secret-key-here-change-in-production` with a strong random secret key.

**Note**: `DATABASE_URL` will be automatically set by Railway when you link the Postgres service. The `${{Postgres.DATABASE_URL}}` syntax references the Postgres service's connection string.

### 5c. Link Database to Backend

In Railway dashboard:
1. Go to your backend service
2. Click "Settings" → "Service"
3. Under "Service Source", add the Postgres service as a dependency

Or the database connection will be available via `${{Postgres.DATABASE_URL}}` automatically.

## Step 6: Deploy Frontend Service

### 6a. Create Frontend Service

In Railway dashboard:
1. Click "New" → "GitHub Repo" (same repo)
2. Select the same repository
3. Railway will detect `frontend/Dockerfile`

Or create a new service pointing to the `frontend/` directory.

### 6b. Configure Frontend Environment Variables

In Railway dashboard, go to your frontend service → Variables tab, add:

```
VITE_API_BASE_URL=https://your-backend-service.railway.app
```

**Important**: Replace `your-backend-service.railway.app` with your actual backend service URL (found in Railway dashboard under your backend service → Settings → Domains).

## Step 7: Deploy Worker Service

### 7a. Create Worker Service

In Railway dashboard:
1. Click "New" → "GitHub Repo" (same repo)
2. Select the same repository
3. Set the root directory to `backend/`
4. Set the Dockerfile path to `backend/Dockerfile.worker`

Or create a new service and configure it to use `backend/Dockerfile.worker`.

### 7b. Configure Worker Environment Variables

Same as backend:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=${{Backend.SECRET_KEY}}
ENVIRONMENT=production
DAILY_SUMMARY_RUN_HOUR_UTC=9
DAILY_SUMMARY_RUN_MINUTE_UTC=0
DAILY_SUMMARY_POLL_INTERVAL_SECONDS=300
DAILY_SUMMARY_RETRY_INTERVAL_SECONDS=600
```

### 7c. Link Database to Worker

Same as backend - link the Postgres service.

## Step 8: Run Database Migrations

After backend is deployed, run migrations:

```bash
# Via Railway CLI
railway run --service backend alembic upgrade head

# Or via Railway dashboard: Backend service → Deployments → Run command
```

## Step 9: Create Admin User

```bash
railway run --service backend python -m app.scripts.create_admin
```

Or use the make_admin script:
```bash
railway run --service backend python -m app.scripts.make_admin <email>
```

## Step 10: Configure Custom Domains (Optional)

In Railway dashboard:
1. Go to each service → Settings → Domains
2. Add custom domain or use Railway's generated domain
3. Update CORS_ORIGINS in backend to include your custom domain

## Step 11: Verify Deployment

1. **Backend Health Check**: Visit `https://your-backend.railway.app/health`
2. **Backend API Docs**: Visit `https://your-backend.railway.app/docs`
3. **Frontend**: Visit your frontend URL
4. **Test Login**: Try logging in with your admin user

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Railway |
| `SECRET_KEY` | JWT secret key | Generate with: `openssl rand -hex 32` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | `1440` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `https://app.example.com` |
| `ENVIRONMENT` | Environment name | `production` |
| `DEBUG` | Debug mode | `false` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://api.example.com` |

### Worker Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Railway |
| `SECRET_KEY` | Same as backend | Same as backend |
| `ENVIRONMENT` | Environment name | `production` |
| `DAILY_SUMMARY_RUN_HOUR_UTC` | Hour to run summary (UTC) | `9` |
| `DAILY_SUMMARY_RUN_MINUTE_UTC` | Minute to run summary (UTC) | `0` |

## Troubleshooting

### Backend won't start
- Check logs: `railway logs --service backend`
- Verify DATABASE_URL is set correctly
- Ensure migrations ran: `railway run --service backend alembic upgrade head`

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` is set correctly
- Check CORS_ORIGINS includes your frontend URL
- Check backend logs for CORS errors

### Database connection errors
- Verify Postgres service is running
- Check DATABASE_URL format
- Ensure services are linked in Railway dashboard

### Worker not running
- Check worker logs: `railway logs --service worker`
- Verify DATABASE_URL is set
- Check that worker service is running (not paused)

## Railway CLI Commands

```bash
# Login
railway login

# Link to project
railway link

# Deploy
railway up

# View logs
railway logs

# Run command in service
railway run --service <service-name> <command>

# Open dashboard
railway open

# List services
railway service
```

## Cost Considerations

Railway uses usage-based pricing:
- Free tier: $5 credit/month
- Pay-as-you-go after that
- Database: Included in service costs
- Each service (backend, frontend, worker) counts separately

Monitor usage in Railway dashboard → Usage tab.

## Next Steps

1. Set up monitoring/alerting
2. Configure backups for database
3. Set up CI/CD (Railway auto-deploys on git push if connected)
4. Add custom domains
5. Set up SSL (automatic with Railway)
