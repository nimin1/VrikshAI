# 🔧 Running VrikshAI Backend Locally

Complete guide to run the full-stack app (frontend + backend) locally.

---

## ✅ Prerequisites

Before running backend locally, you need:

1. ✅ **Vercel CLI** - Already installed!
2. ⏳ **API Keys** - Need to set up (see below)
3. ⏳ **Environment Variables** - Need to create `.env` file

---

## 🚀 Quick Start (Full Stack Local)

### Step 1: Stop Current Frontend-Only Server

```bash
# Kill the current npm start process
pkill -f "react-scripts"
```

### Step 2: Get Your API Keys

You need 3 things:

#### A. OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Name it: `VrikshAI Local Dev`
4. Copy the key (starts with `sk-proj-...`)
5. **Save it!** You won't see it again

**Cost:** ~$0.01-0.03 per plant identification

#### B. Supabase Credentials

1. Go to https://supabase.com
2. **Create new project** or use existing
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

**Cost:** Free tier (500MB database, 5GB bandwidth)

#### C. JWT Secret

Generate a random secret:

```bash
openssl rand -base64 32
```

Copy the output.

### Step 3: Create `.env` File

```bash
# Navigate to project root
cd "/Users/niminprabhasasidharan/Desktop/Nimin/Tech Projects/VrikshAI"

# Create .env file
cat > .env << 'EOF'
OPENAI_API_KEY=sk-proj-paste-your-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=paste-your-supabase-anon-key-here
JWT_SECRET=paste-your-generated-secret-here
EOF
```

**Replace the placeholder values with your actual keys!**

### Step 4: Set Up Supabase Database

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Run this SQL:

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

### Step 5: Run with Vercel CLI

```bash
# From project root
vercel dev
```

**First time setup:**
- **Login to Vercel?** → Yes (browser will open)
- **Set up and deploy?** → **No** (we're just running locally)
- **Which scope?** → Your account
- **Link to existing project?** → No
- **What's your project's name?** → vriksh-ai
- **In which directory is your code located?** → `./`

**After setup, it will start:**
- ✅ Backend at `http://localhost:3000/api/*`
- ✅ Frontend at `http://localhost:3000`

---

## 🎯 What You'll Get

### With `vercel dev`:

```
http://localhost:3000/              → Frontend (React PWA)
http://localhost:3000/auth          → Auth page
http://localhost:3000/darshan       → Plant ID page

http://localhost:3000/api/auth      → Backend API (works!)
http://localhost:3000/api/darshan   → Backend API (works!)
```

### Features That Work:

- ✅ **Signup/Login** - Full authentication
- ✅ **AI Darshan** - Plant identification
- ✅ **API calls** - All backend endpoints
- ✅ **Hot reload** - Changes update automatically

---

## 🔄 Daily Development Workflow

### Start Backend + Frontend

```bash
vercel dev
```

### Make Changes

- Edit frontend code → Auto-refreshes
- Edit backend code (`backend/api/*.py`) → Auto-reloads

### Test Everything

```bash
# Visit app
open http://localhost:3000

# Test signup
# Test login
# Test AI Darshan
```

### Stop Server

Press `Ctrl + C`

---

## 🆚 Comparison

| Command | Frontend | Backend | API Calls | Use Case |
|---------|----------|---------|-----------|----------|
| `npm start` | ✅ | ❌ | ❌ 404 | UI-only work |
| `vercel dev` | ✅ | ✅ | ✅ Works! | Full testing |

---

## 🐛 Troubleshooting

### "Error: Missing environment variables"

**Cause:** `.env` file not created or incomplete

**Fix:**
```bash
# Check if .env exists
ls -la .env

# Create it
cp .env.example .env

# Edit with your actual values
nano .env
```

### "Cannot connect to Supabase"

**Cause:** Wrong Supabase URL or key

**Fix:**
1. Go to Supabase → Settings → API
2. Copy **Project URL** and **anon public** key
3. Update `.env` file
4. Restart: `Ctrl+C` then `vercel dev`

### "OpenAI API error"

**Cause:** Invalid or missing OpenAI key

**Fix:**
1. Check key starts with `sk-proj-` or `sk-`
2. Verify billing is set up at https://platform.openai.com/account/billing
3. Create new key if needed
4. Update `.env`
5. Restart `vercel dev`

### "Port 3000 already in use"

**Cause:** Another server running

**Fix:**
```bash
# Kill all node processes
pkill -f "node"

# Or kill specific port
lsof -ti:3000 | xargs kill -9

# Restart
vercel dev
```

### Python dependencies error

**Cause:** Missing Python packages

**Fix:**
```bash
cd backend
pip install -r requirements.txt
cd ..
vercel dev
```

---

## 📊 Environment Variables Reference

| Variable | Description | Where to Get | Example |
|----------|-------------|--------------|---------|
| `OPENAI_API_KEY` | OpenAI API access | [API Keys](https://platform.openai.com/api-keys) | `sk-proj-abc123...` |
| `SUPABASE_URL` | Supabase project URL | Supabase Settings → API | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key | Supabase Settings → API | `eyJhbGci...` |
| `JWT_SECRET` | Token signing secret | `openssl rand -base64 32` | Random 32+ chars |

---

## ✅ Verification Checklist

Before running `vercel dev`, make sure:

- ✅ Vercel CLI installed (`vercel --version`)
- ✅ `.env` file created in root
- ✅ All 4 environment variables set
- ✅ OpenAI billing enabled
- ✅ Supabase project created
- ✅ Database tables created
- ✅ No other server on port 3000

---

## 🎯 Quick Commands

```bash
# Run full stack locally
vercel dev

# Just frontend (no backend)
npm start

# Build for production
npm run build

# Deploy to production
npm run deploy
```

---

## 💡 Pro Tips

### 1. **Use `.env` file**
Never commit `.env` to git (it's in `.gitignore`)

### 2. **Keep keys safe**
Don't share your API keys publicly

### 3. **Monitor costs**
- OpenAI: Set spending limits
- Supabase: Free tier is generous

### 4. **Hot reload**
Changes to code auto-reload in `vercel dev`

### 5. **Test locally first**
Always test with `vercel dev` before deploying

---

## 🚀 Next Steps

1. **Run locally:**
   ```bash
   vercel dev
   ```

2. **Test features:**
   - Create account
   - Upload plant image
   - Get AI results

3. **Deploy when ready:**
   ```bash
   npm run deploy
   ```

---

## 📞 Need Help?

- **Vercel issues:** Check `.env` file
- **API errors:** Verify all keys are correct
- **Database errors:** Check Supabase connection
- **Python errors:** Run `pip install -r requirements.txt`

---

**You're all set!** Run `vercel dev` to start the full stack locally! 🌱✨
