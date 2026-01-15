# Railway Deployment Fix - Correct Configuration

## The Problem

Railway is trying to use root-level Dockerfiles (`Dockerfile.backend`, `Dockerfile.frontend`) but the build context doesn't include the subdirectories. The solution is to use the **original Dockerfiles in subdirectories** and set the **Root Directory** for each service.

## Solution: Set Root Directory in Dashboard

You need to configure each service in the Railway dashboard to use its subdirectory as the root:

### Step 1: Remove RAILWAY_DOCKERFILE_PATH Variables

In Railway dashboard, go to each service → Variables and **delete** the `RAILWAY_DOCKERFILE_PATH` variable:
- Backend service: Delete `RAILWAY_DOCKERFILE_PATH`
- Frontend service: Delete `RAILWAY_DOCKERFILE_PATH`  
- Worker service: Delete `RAILWAY_DOCKERFILE_PATH`

### Step 2: Set Root Directory for Each Service

**Backend Service:**
1. Go to Railway dashboard → Backend service
2. Settings → Build
3. Set **Root Directory**: `backend`
4. Leave **Dockerfile Path** empty (it will auto-detect `backend/Dockerfile`)
5. Save

**Frontend Service:**
1. Go to Railway dashboard → Frontend service
2. Settings → Build
3. Set **Root Directory**: `frontend`
4. Leave **Dockerfile Path** empty (it will auto-detect `frontend/Dockerfile`)
5. Save

**Worker Service:**
1. Go to Railway dashboard → Worker service
2. Settings → Build
3. Set **Root Directory**: `backend`
4. Set **Dockerfile Path**: `Dockerfile.worker` (relative to backend directory)
5. Save

### Step 3: Redeploy All Services

After configuring, redeploy:

```bash
railway redeploy --service backend --yes
railway redeploy --service frontend --yes
railway redeploy --service worker --yes
```

## Why This Works

- When Root Directory is set to `backend`, Railway checks out only that directory
- The Dockerfile in `backend/Dockerfile` can use `COPY . .` because the build context is the `backend/` directory
- Same for frontend - build context becomes `frontend/` directory
- Worker uses `backend/` as root, then looks for `Dockerfile.worker` in that directory

## After Successful Deployment

1. **Check Backend Health**:
   ```bash
   curl https://backend-production-4afa.up.railway.app/health
   ```

2. **Run Migrations** (if not auto-run):
   ```bash
   railway run --service backend alembic upgrade head
   ```

3. **Create Admin User**:
   ```bash
   railway run --service backend python -m app.scripts.create_admin
   ```

4. **Verify Frontend**:
   Visit: https://frontend-production-174d5.up.railway.app

5. **Check API Docs**:
   Visit: https://backend-production-4afa.up.railway.app/docs

## Current Service URLs

- **Backend**: https://backend-production-4afa.up.railway.app
- **Frontend**: https://frontend-production-174d5.up.railway.app
- **Worker**: Running in background

## Environment Variables Already Set

✅ Backend: DATABASE_URL, SECRET_KEY, CORS_ORIGINS, etc.  
✅ Frontend: VITE_API_BASE_URL  
✅ Worker: DATABASE_URL, SECRET_KEY, ENVIRONMENT
