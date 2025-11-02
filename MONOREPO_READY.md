# ✅ VrikshAI Monorepo - Ready for Single Vercel Deployment!

Your project has been successfully restructured as a monorepo for deploying both backend and frontend together on Vercel from a single repository!

## 🎉 What Changed

### Before (Separate Deployments)
```
Backend → Deploy to Vercel separately
Frontend → Deploy to Vercel separately
Configure CORS between them
Manage 2 URLs
```

### After (Monorepo)
```
Single Repo → Deploy once to Vercel
Backend at /api/*
Frontend at /*
Same domain, no CORS!
1 URL to manage
```

## 📁 New Project Structure

```
VrikshAI/                      # 👈 Single repo
├── backend/                   # Python API
│   ├── api/
│   │   ├── auth.py
│   │   ├── darshan.py
│   │   ├── chikitsa.py
│   │   ├── seva.py
│   │   ├── vana.py
│   │   ├── index.py          # ✨ NEW: Vercel entry point
│   │   └── _utils/
│   └── requirements.txt
├── web/                       # React PWA
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example          # ✅ Updated with /api
├── mobile/                    # React Native (not deployed)
├── vercel.json               # ✨ NEW: Vercel config
├── package.json              # ✨ NEW: Root package.json
├── .gitignore                # ✅ Updated
└── VERCEL_DEPLOYMENT.md      # ✨ NEW: Deploy guide
```

## ✨ New Files Created

### 1. `vercel.json` (Root Level)
Configures how Vercel builds and routes your app:
- Routes `/api/*` → Python backend
- Routes all else → React frontend
- Handles SPA routing

### 2. `package.json` (Root Level)
Defines build commands:
```json
{
  "scripts": {
    "build": "cd web && npm install && npm run build"
  }
}
```

### 3. `backend/api/index.py`
Main entry point for Vercel serverless functions

### 4. `VERCEL_DEPLOYMENT.md`
Complete step-by-step deployment guide

## ✅ Updated Files

### 1. `web/.env.example`
Changed API URL to relative path:
```bash
# Before
REACT_APP_API_URL=http://localhost:3000/api

# After (for Vercel)
REACT_APP_API_URL=/api
```

### 2. `web/package.json`
Added vercel-build script:
```json
{
  "scripts": {
    "vercel-build": "react-scripts build"
  }
}
```

### 3. `.gitignore`
Added web build artifacts

## 🚀 How to Deploy (Quick Start)

### Option 1: Vercel CLI (5 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to project
cd "/Users/niminprabhasasidharan/Desktop/Nimin/Tech Projects/VrikshAI"

# Deploy!
vercel --prod
```

### Option 2: GitHub + Vercel Dashboard

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "VrikshAI monorepo"
git remote add origin https://github.com/yourusername/vriksh-ai.git
git push -u origin main

# 2. Go to vercel.com
# 3. Click "New Project"
# 4. Import your GitHub repo
# 5. Click "Deploy"
```

## ⚙️ Environment Variables to Set in Vercel

After deployment, add these in Vercel dashboard:

```bash
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...supabase.co
SUPABASE_KEY=eyJ...
JWT_SECRET=your-random-secret-here
```

Then redeploy for changes to take effect.

## 🌐 After Deployment

Your app will be live at: `https://vriksh-ai.vercel.app` (or your custom domain)

### URL Structure
```
https://vriksh-ai.vercel.app/           → React app (homepage)
https://vriksh-ai.vercel.app/auth       → Login/signup page
https://vriksh-ai.vercel.app/darshan    → Plant identification
https://vriksh-ai.vercel.app/api/auth   → Backend API (auth)
https://vriksh-ai.vercel.app/api/darshan → Backend API (darshan)
```

### Benefits
- ✅ **Same domain** - No CORS issues!
- ✅ **One deployment** - Manage everything in one place
- ✅ **Automatic HTTPS** - Vercel provides SSL
- ✅ **Global CDN** - Fast worldwide
- ✅ **Auto scaling** - Handles traffic spikes
- ✅ **Preview deploys** - Test before going live

## 📊 How It Works

### Request Flow

```
User visits https://vriksh-ai.vercel.app
                     ↓
            Vercel Edge Network
                     ↓
        ┌────────────┴────────────┐
        ↓                         ↓
   /api/* requests          All other requests
        ↓                         ↓
  Python Backend            React Frontend
  (Serverless)              (Static + SPA)
        ↓                         ↓
    Supabase DB           Beautiful UI
```

### File Serving

```
Static files (.js, .css, images)
    → Served from CDN (super fast)

API requests (/api/*)
    → Python serverless functions

SPA routes (/darshan, /vana, etc.)
    → React Router handles (index.html)
```

## 🔧 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...
export SUPABASE_URL=...
export SUPABASE_KEY=...
export JWT_SECRET=...
python test_service.py
```

### Frontend
```bash
cd web
npm install
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:3000/api
npm start
```

## 📝 Deployment Checklist

Before deploying, ensure:

- ✅ All code committed to git
- ✅ `.env.example` created (don't commit real .env!)
- ✅ `requirements.txt` has all Python deps
- ✅ `web/package.json` dependencies correct
- ✅ OpenAI API key ready
- ✅ Supabase project created
- ✅ Database tables created (see VERCEL_DEPLOYMENT.md)

Then deploy:

- ✅ Run `vercel --prod`
- ✅ Add environment variables in Vercel
- ✅ Redeploy with env vars
- ✅ Test signup/login
- ✅ Test AI Darshan
- ✅ Celebrate! 🎉

## 🚨 Important Notes

### API URL Configuration

**For Vercel (Production):**
```bash
REACT_APP_API_URL=/api
```

**For Local Development:**
```bash
REACT_APP_API_URL=http://localhost:3000/api
```

The web app automatically uses the env var, so it works in both environments!

### CORS

With monorepo, backend and frontend are on **same domain**, so:
- ✅ No CORS issues
- ✅ Simpler configuration
- ✅ Better security
- ✅ Cookies work (if needed later)

### Vercel Limits (Free Tier)

- **Bandwidth**: 100 GB/month
- **Serverless Execution**: 100 GB-hours
- **Build Time**: 6000 minutes/month
- **Function Timeout**: 10 seconds

Perfect for getting started! Upgrade to Pro if needed.

### Python Version

Vercel uses Python 3.9 by default (configured in `vercel.json`).
All your code is compatible!

## 📚 Documentation

- **Deployment Guide**: `VERCEL_DEPLOYMENT.md` - Complete deployment walkthrough
- **Web App Guide**: `web/README.md` - Frontend development
- **Backend Guide**: `backend/README.md` - API documentation (if exists)

## 🎯 What Happens When You Deploy

1. **Vercel receives your code**
2. **Installs Node.js dependencies** (web/package.json)
3. **Builds React app** (`npm run build`)
4. **Creates Python serverless functions** (backend/api/*.py)
5. **Configures routes** (vercel.json)
6. **Deploys to global CDN**
7. **Gives you a live URL** 🎉

Total time: ~2-3 minutes

## ✨ Success Indicators

After deployment, you should see:

```
✅ Deployment Ready
✅ https://vriksh-ai-xxx.vercel.app

Serverless Functions:
✅ /api/auth
✅ /api/darshan
✅ /api/chikitsa
✅ /api/seva
✅ /api/vana

Static Files:
✅ index.html
✅ main.js
✅ main.css
✅ manifest.json
```

## 🎊 You're Ready!

Everything is configured for monorepo deployment:

- ✅ **Backend restructured** - Serverless-ready
- ✅ **Frontend configured** - Relative API URLs
- ✅ **Routing setup** - vercel.json configured
- ✅ **Documentation** - Complete deploy guide
- ✅ **Git ignore** - Proper exclusions

**Next step**: Just deploy! 🚀

```bash
vercel --prod
```

---

## 📖 Quick Reference

### Deploy Commands
```bash
vercel --prod                    # Deploy to production
vercel                          # Deploy to preview
vercel env add OPENAI_API_KEY   # Add env var
vercel logs                     # View logs
```

### File Locations
- **Vercel config**: `/vercel.json`
- **Backend code**: `/backend/api/`
- **Frontend code**: `/web/src/`
- **Deploy guide**: `/VERCEL_DEPLOYMENT.md`

### URLs After Deploy
- **Homepage**: `https://your-app.vercel.app/`
- **API**: `https://your-app.vercel.app/api/*`
- **Dashboard**: `vercel.com/dashboard`

---

**VrikshAI Monorepo** - Ready for single-command deployment! 🌱✨

Deploy backend + frontend together with just: `vercel --prod`
