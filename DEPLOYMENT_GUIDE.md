# Alliance Management System - Deployment Guide for Hostinger

## Overview
This guide will help you deploy your Alliance Management System using:
- **Frontend**: Hostinger Premium Web Hosting (your temp domain)
- **Backend**: Render.com (free tier)

---

## Part 1: Deploy Backend to Render.com (FREE)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your repository: `PixelShinobi/Alliance-management-system`
3. Configure:
   - **Name**: `alliance-backend` (or any name)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables
In Render dashboard, add:
```
PYTHON_VERSION=3.11
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. Copy your backend URL (e.g., `https://alliance-backend-xxxx.onrender.com`)

---

## Part 2: Deploy Frontend to Hostinger

### Step 1: Update Backend URL
1. Open `frontend/.env.production`
2. Replace with your Render URL:
   ```
   VITE_API_URL=https://alliance-backend-xxxx.onrender.com/api
   ```

### Step 2: Build Frontend
Open terminal in project folder:
```bash
cd frontend
npm run build
```

This creates a `frontend/dist` folder with your built files.

### Step 3: Upload to Hostinger (Using File Manager)

**In the screenshot you showed:**

1. Click **"Upload Files"** button (top right)
2. Navigate to your `frontend/dist` folder on your computer
3. **Select ALL files** in the dist folder:
   - `index.html`
   - `assets` folder
   - `.htaccess`
4. Upload all files to the **root directory** (public_html)

**Alternative: If uploading to public_html folder:**
- Make sure ALL files from `dist` go into `/public_html/`
- The structure should be:
  ```
  public_html/
    ├── index.html
    ├── assets/
    │   ├── index-xxxxx.css
    │   └── index-xxxxx.js
    └── .htaccess
  ```

### Step 4: Configure Domain
1. In Hostinger panel, go to your domain settings
2. Make sure your temp domain points to `public_html`
3. Enable HTTPS/SSL if available

### Step 5: Test Your Site
1. Visit your temp domain (e.g., `https://your-temp-domain.com`)
2. You should see your Alliance Management System!

---

## Part 3: Update Backend CORS

After deployment, you need to update backend to allow your frontend domain.

### Option A: Update via GitHub
1. Edit `backend/main.py`
2. Find the CORS section:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],  # Change this
   ```
3. Update to:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:3000",
           "https://your-temp-domain.com",  # Add your Hostinger domain
       ],
   ```
4. Commit and push - Render will auto-deploy

---

## Quick Reference

### Re-deploying Frontend (After Changes)
```bash
cd frontend
npm run build
```
Then upload `dist` folder contents to Hostinger via File Manager.

### Re-deploying Backend (After Changes)
Just push to GitHub - Render auto-deploys!

---

## Troubleshooting

### "Cannot connect to API"
- Check backend URL in `.env.production`
- Make sure backend is running on Render
- Check CORS settings in backend

### "404 Not Found on page refresh"
- Make sure `.htaccess` file is uploaded
- Check if mod_rewrite is enabled on Hostinger

### "Build failed"
- Run `npm install` first
- Make sure Node.js version is 16+

---

## Important Notes

1. **Free Render backend spins down after 15 min of inactivity**
   - First request after inactivity will be slow (30-60 seconds)
   - Consider upgrading to paid plan for production

2. **Database Location**
   - Currently using SQLite (alliance.db)
   - On Render, this resets when service redeploys
   - For production, consider PostgreSQL (Render offers free tier)

3. **Admin Password**
   - Default: `admin615`
   - Change this before going live!

---

## Need Help?
- Hostinger Support: https://www.hostinger.com/contact
- Render Docs: https://render.com/docs
- Check browser console (F12) for errors
