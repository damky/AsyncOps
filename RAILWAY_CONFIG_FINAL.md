# Railway Configuration - Final Instructions

## Current Status

✅ AWS GitHub Actions workflow disabled (was causing build failures)  
✅ Services created and environment variables configured  
✅ Need to set Root Directory in dashboard

## Configuration Steps

### Step 1: Set Root Directory in Railway Dashboard

**For Backend Service:**
1. Go to Railway dashboard → Backend service
2. Settings → Build
3. Set **Root Directory**: `backend`
4. Save

**For Frontend Service:**
1. Go to Railway dashboard → Frontend service
2. Settings → Build
3. Set **Root Directory**: `frontend`
4. Save

**For Worker Service:**
1. Go to Railway dashboard → Worker service
2. Settings → Build
3. Set **Root Directory**: `backend`
4. Save

**Note:** Railway will automatically detect `Dockerfile` in each root directory. For the worker, the `RAILWAY_DOCKERFILE_PATH` environment variable is already set to `Dockerfile.worker` (relative to the backend root directory).

### Step 2: Verify Environment Variables

The following are already configured:

**Backend:**
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `SECRET_KEY=bd6c53e4c50a432ca9fc4ce7f3148ab015be0a1ad2a25e5d3ebe57807acfa6c8`
- `CORS_ORIGINS=https://frontend-production-174d5.up.railway.app`
- `ALGORITHM=HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES=1440`
- `ENVIRONMENT=production`
- `DEBUG=false`

**Frontend:**
- `VITE_API_BASE_URL=https://backend-production-4afa.up.railway.app`

**Worker:**
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `SECRET_KEY=bd6c53e4c50a432ca9fc4ce7f3148ab015be0a1ad2a25e5d3ebe57807acfa6c8`
- `ENVIRONMENT=production`
- `RAILWAY_DOCKERFILE_PATH=Dockerfile.worker`

### Step 3: Redeploy Services

After setting root directories, redeploy:

```bash
railway redeploy --service backend --yes
railway redeploy --service frontend --yes
railway redeploy --service worker --yes
```

## How Railway Detects Dockerfiles

- Railway looks for a file named **`Dockerfile`** in the **root directory** you configure
- If root directory is `backend`, Railway looks for `backend/Dockerfile`
- For custom Dockerfile names (like `Dockerfile.worker`), use the `RAILWAY_DOCKERFILE_PATH` environment variable
- The path in `RAILWAY_DOCKERFILE_PATH` is relative to the root directory

## Service URLs

- **Backend**: https://backend-production-4afa.up.railway.app
- **Frontend**: https://frontend-production-174d5.up.railway.app
- **API Docs**: https://backend-production-4afa.up.railway.app/docs

## After Successful Deployment

1. **Check Backend Health**:
   ```bash
   curl https://backend-production-4afa.up.railway.app/health
   ```

2. **Run Migrations** (if not auto-run by Dockerfile):
   ```bash
   railway run --service backend alembic upgrade head
   ```

3. **Create Admin User**:
   ```bash
   railway run --service backend python -m app.scripts.create_admin
   ```

4. **Test Frontend**: Visit https://frontend-production-174d5.up.railway.app
