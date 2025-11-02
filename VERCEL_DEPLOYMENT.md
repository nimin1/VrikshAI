# 🚀 VrikshAI - Vercel Monorepo Deployment Guide

Deploy both frontend (React PWA) and backend (Python API) together on Vercel from a single repository!

## 📁 Project Structure (Monorepo)

```
VrikshAI/
├── backend/                 # Python API
│   ├── api/
│   │   ├── auth.py
│   │   ├── darshan.py
│   │   ├── chikitsa.py
│   │   ├── seva.py
│   │   ├── vana.py
│   │   ├── index.py        # Vercel entry point
│   │   └── _utils/
│   └── requirements.txt
├── web/                     # React PWA
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── mobile/                  # React Native (not deployed)
├── vercel.json             # ✨ Vercel configuration
├── package.json            # Root package.json
└── .gitignore
```

## ✨ What's Been Configured

### 1. **Vercel Configuration** (`vercel.json`)
- Routes `/api/*` to Python backend
- Routes all other paths to React frontend
- Serves static assets efficiently
- Handles SPA routing for React

### 2. **Root Package.json**
- Build script for React app
- Development scripts for local testing

### 3. **Environment Configuration**
- Web app uses relative API URL (`/api`)
- Backend and frontend on same domain
- No CORS issues!

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy

```bash
# Navigate to project root
cd "/Users/niminprabhasasidharan/Desktop/Nimin/Tech Projects/VrikshAI"

# Deploy to production
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your personal account
- **Link to existing project?** No
- **Project name?** vriksh-ai (or your choice)
- **In which directory is your code located?** ./

Vercel will:
1. ✅ Build React app (`web/`)
2. ✅ Deploy Python functions (`backend/api/`)
3. ✅ Configure routes automatically
4. ✅ Give you a live URL!

### Option 2: Vercel Dashboard (GitHub Integration)

#### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "VrikshAI monorepo ready for deployment"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/vriksh-ai.git
git branch -M main
git push -u origin main
```

#### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel auto-detects `vercel.json` configuration
5. Click **"Deploy"**

## ⚙️ Environment Variables

After deployment, configure these in Vercel dashboard:

### Required Variables

1. **Go to Project Settings** → **Environment Variables**

2. **Add these variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
| `SUPABASE_URL` | `https://...supabase.co` | Supabase project URL |
| `SUPABASE_KEY` | `eyJ...` | Supabase anon/public key |
| `JWT_SECRET` | `your-secret-here` | Random secure string |

3. **Click "Save"** after each variable

4. **Redeploy** for changes to take effect:
   ```bash
   vercel --prod
   ```

### How to Get These Values

#### OpenAI API Key
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy and save (you won't see it again!)

#### Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Create project (or use existing)
3. Go to **Settings** → **API**
4. Copy:
   - **URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`

#### JWT Secret
Generate a random secure string:
```bash
openssl rand -base64 32
```

## 🗄️ Database Setup (Supabase)

### Step 1: Create Tables

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
```

### Step 2: Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plants
CREATE POLICY "Users can view own plants"
    ON plants FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants"
    ON plants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants"
    ON plants FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants"
    ON plants FOR DELETE
    USING (auth.uid() = user_id);
```

## ✅ Post-Deployment Testing

### 1. Check Deployment Status

Visit your Vercel deployment URL (e.g., `https://vriksh-ai.vercel.app`)

### 2. Test Frontend

- ✅ Should see VrikshAI auth page
- ✅ Green gradient background
- ✅ Login/Signup forms work
- ✅ Professional UI loads

### 3. Test Backend API

```bash
# Test auth endpoint
curl https://your-app.vercel.app/api/auth/signup \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

Should return:
```json
{
  "token": "eyJ...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### 4. Test Full Flow

1. **Signup** → Create account
2. **Login** → Get JWT token
3. **Navigate** → Go to AI Darshan
4. **Upload Image** → Test plant identification
5. **View Results** → See plant details

## 🔧 Local Development

### Start Backend

```bash
cd backend
python -m pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=sk-...
export SUPABASE_URL=https://...
export SUPABASE_KEY=eyJ...
export JWT_SECRET=your-secret

# Run locally (requires Flask or similar)
python test_service.py
```

### Start Frontend

```bash
cd web

# Install dependencies
npm install

# Create .env for local development
cp .env.example .env

# Edit .env - use localhost backend
# REACT_APP_API_URL=http://localhost:3000/api

# Start dev server
npm start
```

## 📊 Vercel Dashboard

After deployment, you can:

- **View Logs** - See API requests and errors
- **Monitor Usage** - Track bandwidth and function calls
- **Custom Domain** - Add your own domain
- **Preview Deployments** - Test before going live
- **Rollback** - Revert to previous deployments

## 🚨 Troubleshooting

### "Function execution timeout"

**Problem**: Python functions timing out

**Solution**:
- Vercel free tier: 10s timeout
- Pro tier: 60s timeout
- Optimize AI calls or upgrade plan

### "Environment variable not found"

**Problem**: Missing env vars in Vercel

**Solution**:
1. Go to Project Settings → Environment Variables
2. Add missing variables
3. Redeploy

### "Module not found" errors

**Problem**: Python dependencies missing

**Solution**:
- Ensure `requirements.txt` has all dependencies
- Check Python version (3.9)
- Redeploy

### CORS errors

**Problem**: API blocked by CORS

**Solution**:
- Should not happen with monorepo (same domain!)
- If it does, check `vercel.json` routes
- Ensure API functions have CORS headers

### Build failures

**Problem**: React build fails

**Solution**:
```bash
# Test build locally first
cd web
npm run build

# Check for TypeScript errors
# Fix any issues
# Then redeploy
```

## 📈 Cost Estimates

### Vercel (Hosting)
- **Hobby (Free)**:
  - 100 GB bandwidth/month
  - 100 GB-hours serverless function execution
  - Perfect for testing and small projects

- **Pro ($20/month)**:
  - 1 TB bandwidth
  - 1000 GB-hours execution
  - Team features

### OpenAI API
- **GPT-4o**:
  - ~$0.01-0.03 per plant identification
  - ~100 IDs = $1-3
  - Set spending limits in OpenAI dashboard

### Supabase (Database)
- **Free tier**:
  - 500 MB database
  - 5 GB bandwidth
  - Perfect for getting started

## 🎉 Success Checklist

Deployment is successful if:

- ✅ Frontend loads at Vercel URL
- ✅ Can signup/login
- ✅ API calls work (/api/auth/signup)
- ✅ AI Darshan identifies plants
- ✅ No CORS errors
- ✅ Environment variables set
- ✅ Database connected

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Need Help?

1. Check Vercel deployment logs
2. Review function logs for errors
3. Test API endpoints individually
4. Verify environment variables
5. Check database connection

---

## 🚀 Quick Deploy Commands

```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy
cd "/Users/niminprabhasasidharan/Desktop/Nimin/Tech Projects/VrikshAI"
vercel --prod

# After setting environment variables
vercel --prod
```

**That's it!** Your full-stack VrikshAI app is now live on Vercel! 🌱✨

---

**VrikshAI** - Ancient Wisdom. Modern Intelligence. Now on Vercel!
