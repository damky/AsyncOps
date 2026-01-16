# Railway Deployment - Quick Fix Needed

## Current Status

✅ All services created (backend, frontend, worker, postgres)  
✅ Environment variables configured  
✅ Service URLs generated:
- Backend: https://backend-production-4afa.up.railway.app
- Frontend: https://frontend-production-174d5.up.railway.app

❌ **Builds are failing** because Railway is auto-detecting Dockerfiles in subdirectories instead of using the root-level Dockerfiles.

## Quick Fix Required

You need to set the **Root Directory** for each service in the Railway dashboard (one-time setup):

### Steps:

1. **Open Railway Dashboard**: Run `railway open` or visit your project

2. **For Backend Service**:
   - Click on "backend" service
   - Go to Settings → Build
   - Set **Root Directory**: Leave empty (use repo root) OR set to `/`
   - Ensure **Dockerfile Path** is set to: `Dockerfile.backend`
   - Save

3. **For Frontend Service**:
   - Click on "frontend" service  
   - Go to Settings → Build
   - Set **Root Directory**: Leave empty (use repo root) OR set to `/`
   - Ensure **Dockerfile Path** is set to: `Dockerfile.frontend`
   - Save

4. **For Worker Service**:
   - Click on "worker" service
   - Go to Settings → Build
   - Set **Root Directory**: Leave empty (use repo root) OR set to `/`
   - Ensure **Dockerfile Path** is set to: `Dockerfile.worker`
   - Save

5. **Redeploy Services**:
   ```bash
   railway redeploy --service backend --yes
   railway redeploy --service frontend --yes
   railway redeploy --service worker --yes
   ```

## Alternative: Use Subdirectory Root (Simpler)

If the above doesn't work, you can set the root directory to the subdirectory instead:

- **Backend**: Root Directory = `backend`, Dockerfile Path = `Dockerfile`
- **Frontend**: Root Directory = `frontend`, Dockerfile Path = `Dockerfile`  
- **Worker**: Root Directory = `backend`, Dockerfile Path = `Dockerfile.worker`

This uses the original Dockerfiles in the subdirectories, which is actually simpler!

## After Fix

Once builds succeed:

1. **Run Migrations** (if not auto-run):
   ```bash
   railway run --service backend alembic upgrade head
   ```

2. **Create Admin User**:
   ```bash
   railway run --service backend python -m app.scripts.create_admin
   ```

3. **Verify Deployment**:
   - Backend: https://backend-production-4afa.up.railway.app/health
   - Frontend: https://frontend-production-174d5.up.railway.app
   - API Docs: https://backend-production-4afa.up.railway.app/docs
