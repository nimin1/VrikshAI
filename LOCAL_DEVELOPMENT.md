# 🔧 VrikshAI - Local Development Guide

## ⚠️ Important: Backend is Serverless

The VrikshAI backend runs as **serverless functions on Vercel**. It does NOT run as a traditional local server.

## 🎯 Two Ways to Develop Locally

### Option 1: Frontend Only (UI Development) ⭐ Recommended for UI work

**Use this when:** You want to work on the UI/UX without needing the backend.

```bash
npm start
```

**Result:**
- ✅ Frontend runs at http://localhost:3000
- ✅ UI works perfectly
- ❌ API calls will fail with 404 errors (expected!)
- ✅ You can still test all UI components, navigation, forms, etc.

**What You Can Do:**
- Test UI components
- Test navigation and routing
- Test form validation (client-side)
- Design and styling work
- Component development

**What Won't Work:**
- Signup/Login (needs backend)
- AI Darshan (needs backend API)
- Any API calls

---

### Option 2: Full Stack with Vercel CLI ⭐ Recommended for full testing

**Use this when:** You need to test the complete app including API calls.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Set Up Environment Variables

Create `.env` file in the root directory:

```bash
# Create .env in root
cat > .env << 'EOF'
OPENAI_API_KEY=sk-your-openai-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
JWT_SECRET=your-random-secret-here
EOF
```

**Get these values:**

1. **OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create new key
   - Copy it (starts with `sk-`)

2. **Supabase:**
   - Go to https://supabase.com
   - Create project (or use existing)
   - Go to Settings → API
   - Copy URL and anon public key

3. **JWT Secret:**
   ```bash
   openssl rand -base64 32
   ```

#### Step 3: Run with Vercel Dev

```bash
# From root directory
vercel dev
```

**First time setup:**
- Login to Vercel when prompted
- Set up and deploy? → No
- Which scope? → Your account
- Link to existing project? → No
- What's your project's name? → vriksh-ai
- In which directory is your code located? → ./

**Result:**
- ✅ Frontend runs at http://localhost:3000
- ✅ Backend runs at http://localhost:3000/api/*
- ✅ Full app works including API calls!
- ✅ Hot reload for both frontend and backend

---

## 🚀 Recommended Development Workflow

### Phase 1: UI Development (No Backend Needed)

```bash
# Just run frontend
npm start

# Work on:
# - Components
# - Styling
# - Navigation
# - Forms (UI only)
```

### Phase 2: Integration Testing (With Backend)

```bash
# Install Vercel CLI
npm install -g vercel

# Set up .env with your API keys

# Run full stack
vercel dev

# Test:
# - Signup/Login
# - AI Darshan
# - Full user flows
```

### Phase 3: Deploy to Production

```bash
# Deploy everything
npm run deploy

# Set environment variables in Vercel dashboard

# Redeploy
npm run deploy
```

---

## 📊 What Works Where

| Feature | `npm start` | `vercel dev` | Production |
|---------|-------------|--------------|------------|
| UI/Components | ✅ | ✅ | ✅ |
| Navigation | ✅ | ✅ | ✅ |
| Forms (UI) | ✅ | ✅ | ✅ |
| Signup/Login | ❌ | ✅ | ✅ |
| AI Darshan | ❌ | ✅ | ✅ |
| API Calls | ❌ | ✅ | ✅ |

---

## 🔧 Fixing the 404 Error

You're seeing `404 /api/auth/signup` because:

### The Problem

1. You're running `npm start` (frontend only)
2. Frontend tries to call `/api/auth/signup`
3. No backend is running locally
4. Result: 404 error

### Solution 1: Accept It (For UI Work)

If you're just working on UI:

```bash
# Continue with npm start
npm start

# Ignore the 404 errors
# Focus on UI/UX work
```

### Solution 2: Run Full Stack

If you need the backend:

```bash
# Install Vercel CLI
npm install -g vercel

# Set up environment variables (see above)

# Run full stack
vercel dev
```

---

## 🌐 Environment Variables Setup

### For Vercel Dev (Local Full Stack)

Create `.env` in **root directory**:

```bash
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGci...
JWT_SECRET=your-random-32-char-string
```

### For Production (Vercel Dashboard)

Set the same variables in:
- Vercel Dashboard → Project → Settings → Environment Variables

---

## 🧪 Testing Backend Logic Locally (Without Server)

If you just want to test the AI service logic:

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=sk-...
export SUPABASE_URL=https://...
export SUPABASE_KEY=eyJ...
export JWT_SECRET=your-secret

# Run test script
python test_service.py
```

This tests the AI logic without running a web server.

---

## 🎯 Quick Start Commands

### Frontend Only (UI Development)

```bash
npm start
```

### Full Stack (With Backend)

```bash
# First time only
npm install -g vercel

# Set up .env with API keys

# Run
vercel dev
```

### Deploy to Production

```bash
npm run deploy
```

---

## ✅ Summary

**For UI work:**
- Use `npm start`
- Accept 404 errors on API calls
- Focus on components, styling, navigation

**For full testing:**
- Use `vercel dev`
- Need API keys in `.env`
- Test complete user flows

**For production:**
- Use `npm run deploy`
- Set env vars in Vercel dashboard
- Get live URL

---

## 🆘 Troubleshooting

### "404 /api/auth/signup"

**Cause:** Backend not running
**Fix:** Use `vercel dev` instead of `npm start`

### "vercel: command not found"

**Cause:** Vercel CLI not installed
**Fix:**
```bash
npm install -g vercel
vercel --version
```

### "Environment variable not found"

**Cause:** .env file missing or incorrect
**Fix:** Create `.env` in root with all required variables

### "Module 'openai' not found"

**Cause:** Python dependencies not installed
**Fix:**
```bash
cd backend
pip install -r requirements.txt
```

---

## 📞 Need Help?

- Frontend only: `npm start` is enough
- Full app: Use `vercel dev`
- Production: `npm run deploy`

Choose the right command for your needs! 🚀
