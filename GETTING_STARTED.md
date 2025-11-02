# 🚀 VrikshAI - Getting Started Guide

Complete guide to run VrikshAI locally and deploy to Vercel.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Deploy to Vercel](#deploy-to-vercel)
- [Environment Setup](#environment-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Check Command | Install |
|----------|---------|---------------|---------|
| **Node.js** | 16+ | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | 8+ | `npm --version` | Comes with Node.js |
| **Python** | 3.9+ | `python --version` | [python.org](https://python.org) |
| **pip** | Latest | `pip --version` | Comes with Python |

### Required Accounts

1. **OpenAI Account** - [platform.openai.com](https://platform.openai.com)
   - Create API key at [API Keys page](https://platform.openai.com/api-keys)
   - Add billing details (GPT-4o usage)

2. **Supabase Account** - [supabase.com](https://supabase.com)
   - Create new project
   - Note down URL and anon key

3. **Vercel Account** (for deployment) - [vercel.com](https://vercel.com)
   - Sign up with GitHub/GitLab/Email

---

## Quick Start

**From the root directory, run everything with one command:**

```bash
# 1. Clone/navigate to project
cd /path/to/VrikshAI

# 2. Install dependencies
npm install

# 3. Set up environment (see Environment Setup section below)

# 4. Run development server
npm run dev:frontend
```

**Frontend will be available at:** `http://localhost:3000`

---

## Local Development

### Step 1: Install Dependencies

From the **root directory**:

```bash
npm install
```

This automatically installs frontend dependencies (`web/node_modules`).

### Step 2: Set Up Environment Variables

Create `.env` file in the `web/` directory:

```bash
cp web/.env.example web/.env
```

Edit `web/.env`:

```bash
# For local development without backend
# (Frontend will show network errors, but UI works)
REACT_APP_API_URL=/api

# For local development WITH backend running separately
# REACT_APP_API_URL=http://localhost:8000/api
```

### Step 3: Run Frontend

From the **root directory**:

```bash
npm run dev:frontend
```

Or equivalently:

```bash
npm start
```

**Frontend opens at:** `http://localhost:3000`

### Step 4: Backend (Serverless - Vercel Only)

**Important:** The backend is designed to run as serverless functions on Vercel. It does **NOT** run as a traditional local server.

#### To Test Backend Logic Locally:

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=sk-...
export SUPABASE_URL=https://...supabase.co
export SUPABASE_KEY=eyJ...
export JWT_SECRET=your-secret-here

# Run test script
python test_service.py
```

This tests the AI service logic without running a web server.

#### To Run Full-Stack Locally (Advanced):

If you need the full stack locally, you can use Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Run locally (simulates Vercel environment)
vercel dev
```

Then visit `http://localhost:3000`

---

## Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From the **root directory**:

```bash
npm run deploy
```

Or:

```bash
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No (first time)
- **Project name?** vriksh-ai
- **Directory?** ./ (current directory)

Vercel will:
1. ✅ Build React frontend
2. ✅ Deploy Python serverless functions
3. ✅ Configure routes
4. ✅ Provide live URL

### Step 4: Set Environment Variables

After first deployment:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `OPENAI_API_KEY` | `sk-...` | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Settings → API |
| `SUPABASE_KEY` | `eyJ...` | Supabase Settings → API (anon public) |
| `JWT_SECRET` | Random string | Generate: `openssl rand -base64 32` |

5. **Save** and **Redeploy**:

```bash
npm run deploy
```

### Step 5: Set Up Database

In Supabase SQL Editor, run:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plants table
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    common_name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    sanskrit_name TEXT,
    nickname TEXT,
    acquired_date DATE NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    health_status TEXT CHECK (health_status IN ('healthy', 'warning', 'critical')),
    last_watered TIMESTAMPTZ,
    last_fertilized TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
```

### Step 6: Test Your Live App!

Visit your Vercel URL (e.g., `https://vriksh-ai.vercel.app`)

- ✅ Signup for an account
- ✅ Login
- ✅ Navigate to AI Darshan
- ✅ Upload a plant image
- ✅ Get AI identification results!

---

## Environment Setup

### Frontend Environment Variables

**File:** `web/.env`

```bash
# API URL Configuration

# For Vercel deployment (same domain)
REACT_APP_API_URL=/api

# For local development with separate backend
# REACT_APP_API_URL=http://localhost:8000/api
```

### Backend Environment Variables (Vercel Only)

Set in Vercel Dashboard → Settings → Environment Variables:

```bash
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGci...
JWT_SECRET=your-random-secret-string
```

### How to Get Credentials

#### OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Copy key (starts with `sk-proj-...`)
4. **Save it!** You won't see it again
5. Add billing at [Billing Settings](https://platform.openai.com/account/billing)

#### Supabase Credentials

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API**
3. Copy:
   - **URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`

#### JWT Secret

Generate a random secure string:

```bash
openssl rand -base64 32
```

Or use any random 32+ character string.

---

## Available Commands

All commands run from the **root directory**:

### Development

```bash
npm install              # Install frontend dependencies
npm run dev:frontend     # Start React dev server (port 3000)
npm start               # Alias for dev:frontend
```

### Building

```bash
npm run build           # Build React for production
npm test                # Run React tests
```

### Deployment

```bash
npm run deploy          # Deploy to Vercel production
npm run deploy:preview  # Deploy to Vercel preview
vercel dev              # Run locally with Vercel environment
```

### Maintenance

```bash
npm run clean           # Remove node_modules and build files
npm run reinstall       # Clean and reinstall all dependencies
```

---

## Project Structure

```
VrikshAI/
├── backend/                     # Python serverless API
│   ├── api/
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── darshan.py          # Plant identification
│   │   ├── chikitsa.py         # Health diagnosis
│   │   ├── seva.py             # Care schedules
│   │   ├── vana.py             # Plant collection
│   │   ├── index.py            # Vercel entry point
│   │   └── _utils/             # Utilities
│   │       ├── models.py       # Pydantic models
│   │       ├── vriksh_ai_service.py  # AI service
│   │       ├── database.py     # Supabase wrapper
│   │       ├── auth_middleware.py    # JWT auth
│   │       └── prompts.py      # AI prompts
│   ├── requirements.txt        # Python dependencies
│   └── test_service.py         # Local testing script
│
├── web/                        # React PWA frontend
│   ├── public/
│   │   ├── index.html         # HTML template
│   │   └── manifest.json      # PWA manifest
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── AuthPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── DarshanPage.tsx
│   │   │   ├── MeraVanaPage.tsx
│   │   │   └── ChikitsaPage.tsx
│   │   ├── services/
│   │   │   └── api.ts        # API client
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── colors.ts
│   │   │   └── strings.ts
│   │   ├── App.tsx           # Root component
│   │   ├── App.css
│   │   └── index.tsx
│   ├── package.json
│   └── .env.example
│
├── vercel.json                 # Vercel configuration
├── package.json                # Root package.json
├── .gitignore
├── README.md                   # Project overview
├── GETTING_STARTED.md         # This file
└── VERCEL_DEPLOYMENT.md       # Deployment guide
```

---

## Troubleshooting

### "Command not found: npm"

**Problem:** Node.js not installed

**Solution:**
1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Restart terminal
3. Verify: `node --version`

### "Cannot find module" errors

**Problem:** Dependencies not installed

**Solution:**
```bash
npm run clean
npm install
```

### Frontend loads but API calls fail

**Problem:** Backend not deployed or env vars missing

**Solution:**
1. Deploy backend: `npm run deploy`
2. Add env vars in Vercel dashboard
3. Redeploy: `npm run deploy`

### "Module 'openai' not found" in backend

**Problem:** Python dependencies not installed (for local testing)

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### Build fails on Vercel

**Problem:** Build errors in React app

**Solution:**
```bash
# Test build locally first
npm run build

# Fix any TypeScript errors shown
# Then redeploy
npm run deploy
```

### CORS errors

**Problem:** Should NOT happen with monorepo deployment

**Solution:**
- Ensure `REACT_APP_API_URL=/api` in Vercel
- Check `vercel.json` routes configuration
- Verify deployment succeeded

---

## Development Workflow

### Daily Development

```bash
# Start frontend
npm start

# Make changes to code
# Browser auto-refreshes

# Commit changes
git add .
git commit -m "Add feature"
```

### Deploy Changes

```bash
# Test build locally
npm run build

# Deploy to preview (test first)
npm run deploy:preview

# If preview looks good, deploy to production
npm run deploy
```

### Backend Changes

```bash
# Edit Python files in backend/api/

# Test locally
cd backend
python test_service.py

# Deploy
npm run deploy

# Vercel automatically deploys backend changes!
```

---

## Next Steps

After getting started:

1. ✅ **Customize branding** - Update colors, strings, images
2. ✅ **Add features** - Implement Chikitsa, Mera Vana
3. ✅ **Custom domain** - Add your domain in Vercel
4. ✅ **Analytics** - Add Vercel Analytics or Google Analytics
5. ✅ **Monitoring** - Set up error tracking (Sentry, etc.)

---

## Helpful Links

- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **React Docs:** [react.dev](https://react.dev)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **OpenAI Docs:** [platform.openai.com/docs](https://platform.openai.com/docs)

---

## 🆘 Need Help?

1. Check this guide thoroughly
2. Review `VERCEL_DEPLOYMENT.md` for deployment issues
3. Check Vercel deployment logs
4. Verify environment variables are set
5. Test backend logic with `test_service.py`

---

## 🎉 Quick Reference

**Install everything:**
```bash
npm install
```

**Run locally:**
```bash
npm start
```

**Deploy to Vercel:**
```bash
npm run deploy
```

**That's it!** 🚀

---

**VrikshAI** - Ancient Wisdom. Modern Intelligence. 🌱✨
