# Quick Railway Deployment Guide

This is a quick-start guide for deploying AsyncOps to Railway. For detailed instructions, see `docs/railway-deployment.md`.

## Prerequisites

1. Railway account: Sign up at [railway.app](https://railway.app)
2. Your code is pushed to GitHub (✅ Already done!)

## Deployment Steps

### Option 1: Railway Dashboard (Recommended for first-time setup)

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `AsyncOps` repository

2. **Add PostgreSQL Database**
   - In your Railway project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will automatically create the database and connection string

3. **Deploy Backend Service**
   - Click "+ New" → "GitHub Repo"
   - Select the same `AsyncOps` repository
   - Railway will auto-detect `backend/Dockerfile`
   - **Set Root Directory**: `backend`
   - **Set Environment Variables**:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     SECRET_KEY=<generate-a-secret-key>
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=1440
     CORS_ORIGINS=https://your-frontend-url.railway.app
     ENVIRONMENT=production
     DEBUG=false
     ```
   - **Generate SECRET_KEY**: Use `openssl rand -hex 32` or any secure random string generator
   - **Link Postgres**: In service settings, add Postgres as a dependency

4. **Deploy Frontend Service**
   - Click "+ New" → "GitHub Repo"
   - Select the same `AsyncOps` repository
   - **Set Root Directory**: `frontend`
   - **Set Dockerfile Path**: `frontend/Dockerfile`
   - **Set Environment Variables**:
     ```
     VITE_API_BASE_URL=https://your-backend-url.railway.app
     ```
   - **Get backend URL**: Check your backend service → Settings → Domains

5. **Deploy Worker Service**
   - Click "+ New" → "GitHub Repo"
   - Select the same `AsyncOps` repository
   - **Set Root Directory**: `backend`
   - **Set Dockerfile Path**: `backend/Dockerfile.worker`
   - **Set Environment Variables**:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     SECRET_KEY=${{Backend.SECRET_KEY}}
     ENVIRONMENT=production
     ```
   - **Link Postgres**: Add Postgres as a dependency

6. **Run Database Migrations**
   - Go to Backend service → Deployments
   - Click "..." → "Run Command"
   - Enter: `alembic upgrade head`
   - Click "Run"

7. **Create Admin User**
   - Go to Backend service → Deployments
   - Click "..." → "Run Command"
   - Enter: `python -m app.scripts.create_admin`
   - Follow prompts to create admin user

8. **Get Your URLs**
   - Each service will have a Railway-generated URL
   - Find them in: Service → Settings → Domains
   - Update `CORS_ORIGINS` in backend with your frontend URL
   - Update `VITE_API_BASE_URL` in frontend with your backend URL

### Option 2: Railway CLI

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   # OR
   brew install railway
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Add Database**
   ```bash
   railway add postgresql
   ```

5. **Deploy Services**
   - Follow the detailed guide in `docs/railway-deployment.md`

## Quick Verification

1. **Backend Health**: Visit `https://your-backend.railway.app/health`
2. **API Docs**: Visit `https://your-backend.railway.app/docs`
3. **Frontend**: Visit your frontend URL
4. **Test Login**: Use the admin credentials you created

## Important Notes

- **SECRET_KEY**: Must be a strong random string (use `openssl rand -hex 32`)
- **CORS_ORIGINS**: Must include your frontend URL (comma-separated if multiple)
- **VITE_API_BASE_URL**: Must point to your backend URL (no trailing slash)
- **Database Migrations**: Must run after first deployment
- **Admin User**: Create at least one admin user to access the system

## Troubleshooting

- **Backend won't start**: Check logs in Railway dashboard → Service → Deployments → View logs
- **Frontend can't connect**: Verify `VITE_API_BASE_URL` matches your backend URL exactly
- **CORS errors**: Ensure frontend URL is in `CORS_ORIGINS` (no trailing slash)
- **Database errors**: Verify `DATABASE_URL` is set and Postgres service is running

## Next Steps

After deployment:
1. Set up custom domains (optional)
2. Configure monitoring
3. Set up database backups
4. Review Railway usage/billing

For detailed information, see `docs/railway-deployment.md`.
