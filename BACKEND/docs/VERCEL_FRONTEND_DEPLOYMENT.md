# Deploy React Vite Frontend to Vercel

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Your React Vite frontend code
- Backend deployed on Render

## Step 1: Prepare Your Frontend Code

### 1.1 Create Environment Variable File

In your frontend project root, create `.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

Create `.env` (don't commit this):

```env
VITE_API_URL=http://localhost:8000
```

### 1.2 Update API Configuration

Create or update `src/config/api.js`:

```javascript
// src/config/api.js
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Remove trailing slash if present
export const API_BASE_URL = API_URL.replace(/\/$/, "");
```

### 1.3 Update Your API Calls

Replace hardcoded URLs with the config:

```javascript
import { API_BASE_URL } from "./config/api";

// Example: Phishing detection
const response = await fetch(`${API_BASE_URL}/api/phishing/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});

// Example: Chatbot
const response = await fetch(`${API_BASE_URL}/api/chatbot/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ message }),
});
```

### 1.4 Update .gitignore

Ensure `.env` is in `.gitignore`:

```
# Environment variables
.env
.env.local
.env.production

# Build output
dist
dist-ssr
*.local

# Node modules
node_modules
```

## Step 2: Push Frontend to GitHub

```bash
cd /path/to/your/frontend
git init
git add .
git commit -m "Initial commit - React Vite frontend"
git branch -M main
git remote add origin https://github.com/your-username/your-frontend-repo.git
git push -u origin main
```

## Step 3: Deploy on Vercel

### 3.1 Import Project

1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your frontend repository
5. Click **"Import"**

### 3.2 Configure Project

Vercel will auto-detect React Vite. Verify these settings:

- **Framework Preset**: Vite
- **Root Directory**: `./` (or your frontend folder if monorepo)
- **Build Command**: `npm run build` or `yarn build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Add Environment Variable

1. Scroll to **"Environment Variables"** section
2. Add variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-name.onrender.com` (your Render backend URL)
3. Click **"Add"**

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at `https://your-app.vercel.app`

## Step 4: Update Backend CORS Settings

Now that you have your Vercel URL, update your Django backend:

### 4.1 Get Your Vercel URL

After deployment, copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### 4.2 Update Django Settings

In `toolkit_backend/settings.py`, replace:

```python
# CORS settings for frontend access
CORS_ALLOW_ALL_ORIGINS = True
```

With:

```python
# CORS settings for frontend access
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite local dev
    "http://localhost:3000",  # Alternative local port
    "https://your-app.vercel.app",  # Your Vercel deployment
]

# Only in development
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
```

### 4.3 Push Backend Changes

```bash
cd /path/to/toolkit_backend
git add toolkit_backend/settings.py
git commit -m "Update CORS for production frontend"
git push origin main
```

Render will auto-redeploy your backend.

## Step 5: Test the Connection

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test all API features:
   - Phishing detection
   - Email scanning
   - Chatbot
   - Metadata fetch
3. Check browser console for errors
4. Verify API calls are going to Render backend

## Troubleshooting

### CORS Errors

If you see CORS errors in browser console:

1. **Check backend logs** on Render
2. **Verify CORS_ALLOWED_ORIGINS** includes exact Vercel URL (with https://)
3. **No trailing slash** in either frontend API_URL or backend CORS settings
4. **Wait** for Render to redeploy after CORS changes

### API Calls Failing

1. **Check environment variable** in Vercel dashboard
2. **Verify it's `VITE_API_URL`** (exact name matters)
3. **Rebuild** frontend: Settings → Deployments → Click "..." → Redeploy

### Build Fails on Vercel

1. **Check build logs** in Vercel dashboard
2. **Common issues:**
   - Missing dependencies in `package.json`
   - TypeScript errors
   - Environment variable not set
3. **Fix and push** to GitHub - Vercel auto-redeploys

### Frontend Shows Old Backend URL

1. Go to Vercel dashboard
2. **Settings** → **Environment Variables**
3. Update `VITE_API_URL` with correct Render URL
4. **Redeploy**: Deployments → Click "..." → Redeploy

## Automatic Deployments

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes to frontend
git add .
git commit -m "Update UI"
git push origin main
# Vercel automatically deploys!
```

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update backend CORS with new domain

## Environment Variables for Different Environments

Vercel supports multiple environments:

- **Production**: Used for main branch
- **Preview**: Used for pull requests
- **Development**: Local development

You can set different API URLs for each in Vercel settings.

## Production Checklist

- [ ] Frontend deployed on Vercel
- [ ] Environment variable `VITE_API_URL` set correctly
- [ ] Backend CORS updated with Vercel URL
- [ ] All API endpoints tested and working
- [ ] No console errors in browser
- [ ] Backend deployed and running on Render
- [ ] Database connected (Supabase)

## Monitoring

- **Vercel Analytics**: Settings → Analytics (free)
- **Vercel Logs**: Deployments → View Function Logs
- **Backend Logs**: Render dashboard → Your service → Logs

## Costs

- **Vercel Free Tier**:

  - 100 GB bandwidth/month
  - Unlimited personal projects
  - Automatic HTTPS
  - Serverless functions

- **Render Free Tier** (backend):
  - 750 hours/month
  - Spins down after 15 min inactivity
  - 512 MB RAM

## Next Steps

1. Set up monitoring/error tracking (Sentry)
2. Add analytics (Google Analytics, Vercel Analytics)
3. Configure custom domain
4. Set up CI/CD for automated testing
5. Enable preview deployments for pull requests
