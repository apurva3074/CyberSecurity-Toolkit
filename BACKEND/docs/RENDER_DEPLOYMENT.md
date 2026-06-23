# Deploy Django App to Render

## Prerequisites

- GitHub account
- Render account (sign up at https://render.com)
- Git repository with your code

## Steps to Deploy

### 1. Push Your Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Get Your Supabase Database Connection String

1. Go to your Supabase project: https://app.supabase.com
2. Click on your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string** section
5. Select **URI** tab
6. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
7. Replace `[YOUR-PASSWORD]` with your actual database password
8. **Important**: Add `?sslmode=require` at the end of the URL for secure connection
   - Final format: `postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres?sslmode=require`

### 3. Create a Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `toolkit-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn toolkit_backend.wsgi:application`
   - **Instance Type**: Free

### 4. Add Environment Variables

In the Environment section, add:

- `DATABASE_URL`: Paste your Supabase connection string from step 2 (with `?sslmode=require` at the end)
- `SECRET_KEY`: Generate a secure key or let Render auto-generate
- `DEBUG`: `False`
- `PYTHON_VERSION`: `3.11.0`

### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Wait for the deployment to complete (5-10 minutes)
4. Your app will be available at `https://toolkit-backend.onrender.com` (or your custom URL)

## Important Notes

### Static Files

Static files are handled by WhiteNoise. They will be served at `/static/`

### Database

- **Development**: SQLite (default) or Supabase
- **Production**: Supabase PostgreSQL
- The app automatically uses Supabase if `DATABASE_URL` is set
- Supabase provides: Database, Auth, Storage, and Real-time features

### ML Model Files

Your `.joblib` model files will be included in the deployment. Make sure they're:

- Committed to your Git repository
- Not too large (Render has file size limits)
- Properly referenced in your code with paths relative to BASE_DIR

### Free Tier Limitations

- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month of runtime
- 512 MB RAM

## Troubleshooting

### Build Fails

Check the build logs in Render dashboard. Common issues:

- Missing dependencies in `requirements.txt`
- Build script permissions (run `chmod +x build.sh` locally first)

### App Crashes

Check the application logs:

1. Go to your service in Render dashboard
2. Click "Logs" tab
3. Look for error messages

### Static Files Not Loading

Ensure:

- `collectstatic` ran during build (check build logs)
- `STATIC_ROOT` is set correctly
- WhiteNoise is in MIDDLEWARE

### Database Issues

If using Supabase:

- Verify `DATABASE_URL` is set correctly with `?sslmode=require`
- Check that database migrations ran during build (see build logs)
- Ensure your Supabase database password is correct
- Verify your Supabase project is active and not paused
- Check Supabase connection pooler settings if needed
- Review logs for connection errors

## Updating Your App

```bash
git add .
git commit -m "Update message"
git push origin main
```

Render will automatically redeploy when you push to GitHub.

## Custom Domain (Optional)

1. In your service settings, go to "Custom Domain"
2. Add your domain
3. Update DNS records as instructed
4. Update `ALLOWED_HOSTS` in settings.py with your domain

## Security Recommendations for Production

1. Update `ALLOWED_HOSTS` with specific domains (remove '\*')
2. Set `CORS_ALLOW_ALL_ORIGINS = False` and specify allowed origins
3. Enable HTTPS (Render provides this by default)
4. Use environment variables for all sensitive data
5. Regular security updates: `pip list --outdated`

## Monitoring

- Check logs regularly in Render dashboard
- Set up log alerts for errors
- Monitor service health and uptime
