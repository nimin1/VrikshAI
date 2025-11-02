# VrikshAI (वृक्षAI)

**Ancient Wisdom. Modern Intelligence.**

A production-ready full-stack PWA that combines traditional Sanskrit botanical wisdom with cutting-edge AI to help users identify plants, diagnose health issues, and receive personalized care recommendations.

---

## 🚀 Quick Start

**Run from root directory:**

```bash
# Install dependencies
npm install

# Run development server
npm start
```

**Deploy to Vercel:**

```bash
npm run deploy
```

**See [GETTING_STARTED.md](GETTING_STARTED.md) for complete guide.**

---

## 🌿 Features

- **AI Darshan (दर्शन)** - Instant plant identification from photos using GPT-4o vision
- **AI Chikitsa (चिकित्सा)** - Health diagnosis and treatment recommendations
- **Seva (सेवा)** - Personalized care schedules based on location and season
- **Mera Vana (मेरा वन)** - Digital plant collection manager

---

## 🏗️ Tech Stack

### Frontend (React PWA)
- **Framework:** React 18.3 + TypeScript
- **Routing:** React Router v6
- **State:** React Context API
- **HTTP:** Axios with interceptors
- **UI:** Custom components with VrikshAI theme
- **PWA:** Installable, offline-ready

### Backend (Python Serverless)
- **Runtime:** Python 3.9 serverless functions
- **AI:** Pydantic AI + OpenAI GPT-4o
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT tokens
- **Deployment:** Vercel

### Infrastructure
- **Hosting:** Vercel (frontend + backend)
- **Database:** Supabase
- **CDN:** Vercel Edge Network
- **AI:** OpenAI API

---

## 📁 Project Structure

```
VrikshAI/
├── backend/                 # Python serverless API
│   ├── api/
│   │   ├── auth.py         # Authentication
│   │   ├── darshan.py      # Plant identification
│   │   ├── chikitsa.py     # Health diagnosis
│   │   ├── seva.py         # Care schedules
│   │   ├── vana.py         # Plant collection
│   │   ├── index.py        # Vercel entry point
│   │   └── _utils/         # Shared utilities
│   └── requirements.txt
│
├── web/                     # React PWA
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── contexts/       # React contexts
│   │   ├── types/          # TypeScript types
│   │   └── constants/      # Theme & strings
│   └── package.json
│
├── vercel.json             # Vercel configuration
├── package.json            # Root scripts
├── GETTING_STARTED.md      # Setup guide
└── VERCEL_DEPLOYMENT.md    # Deploy guide
```

---

## 🎯 Getting Started

### Prerequisites

- Node.js 16+
- Python 3.9+
- OpenAI API key
- Supabase account
- Vercel account (for deployment)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/yourusername/vriksh-ai.git
cd vriksh-ai

# 2. Install dependencies
npm install

# 3. Set up environment
cp web/.env.example web/.env
# Edit web/.env with your configuration

# 4. Run development server
npm start
```

Frontend runs at `http://localhost:3000`

### Deploy to Production

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
npm run deploy

# 4. Set environment variables in Vercel dashboard
# 5. Redeploy
npm run deploy
```

**See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed instructions.**

---

## 🌐 Architecture

### Deployment Model

```
Vercel
├── Frontend (React PWA)
│   ├── Static files served via CDN
│   ├── SPA routing (client-side)
│   └── Hosted at /
│
└── Backend (Python Serverless)
    ├── API routes at /api/*
    ├── Serverless functions
    └── Auto-scaling
```

### Request Flow

```
User → https://vriksh-ai.vercel.app
          ↓
    Vercel Edge Network
          ↓
    ┌─────┴─────┐
    ↓           ↓
/api/*        /*
Backend    Frontend
    ↓
Supabase DB
```

### Benefits

- ✅ **Single deployment** - Deploy frontend + backend together
- ✅ **No CORS** - Same domain for API and frontend
- ✅ **Auto-scaling** - Serverless functions scale automatically
- ✅ **Global CDN** - Fast worldwide delivery
- ✅ **Zero maintenance** - No servers to manage

---

## 📚 Documentation

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Complete setup and development guide
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Deployment instructions and configuration
- **[web/README.md](web/README.md)** - Frontend development guide

---

## 🎨 Design System

### VrikshAI Color Palette

```css
Primary:    #2D5016  /* Deep forest green */
Secondary:  #7CB342  /* Light green */
Accent:     #00BFA5  /* Teal */
Background: #F1F8E9  /* Light green background */
```

### Sanskrit Terminology

All features use Sanskrit names to honor traditional botanical wisdom:

- **Darshan (दर्शन)** - "Vision" or "seeing"
- **Chikitsa (चिकित्सा)** - "Treatment" or "healing"
- **Seva (सेवा)** - "Service" or "care"
- **Vana (वन)** - "Forest" or "garden"

---

## 🔐 Environment Variables

### Required for Deployment

Set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | `sk-proj-...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon/public key | `eyJhbGci...` |
| `JWT_SECRET` | Secret for signing JWT tokens | Random 32+ chars |

### Frontend Configuration

`web/.env`:

```bash
# For Vercel deployment (same domain)
REACT_APP_API_URL=/api

# For local development (if running backend separately)
# REACT_APP_API_URL=http://localhost:8000/api
```

---

## 🧪 Testing

### Frontend Tests

```bash
npm test
```

### Backend Testing

```bash
cd backend
pip install -r requirements.txt
python test_service.py
```

---

## 📊 Available Commands

All commands run from the **root directory**:

```bash
npm install           # Install dependencies
npm start            # Run development server
npm run build        # Build for production
npm test             # Run tests
npm run deploy       # Deploy to Vercel production
npm run clean        # Clean build artifacts
```

---

## 🚨 Troubleshooting

### Installation Issues

```bash
npm run clean
npm run reinstall
```

### Build Fails

```bash
npm run build
# Fix any TypeScript errors shown
npm run deploy
```

### API Errors

- Ensure environment variables are set in Vercel
- Check Vercel deployment logs
- Verify Supabase connection

**See [GETTING_STARTED.md](GETTING_STARTED.md#troubleshooting) for more.**

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **OpenAI** - GPT-4o vision and language models
- **Vercel** - Serverless deployment platform
- **Supabase** - PostgreSQL database and authentication
- **React** - Frontend framework
- **Pydantic AI** - Structured AI outputs

---

## 📞 Support

- **Documentation:** See [GETTING_STARTED.md](GETTING_STARTED.md)
- **Deployment Help:** See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- **Issues:** Create an issue on GitHub

---

## 🎯 Roadmap

- [x] AI Darshan (Plant Identification)
- [x] Authentication System
- [x] React PWA Frontend
- [x] Serverless Backend
- [x] Vercel Deployment
- [ ] AI Chikitsa (Health Diagnosis) - Full implementation
- [ ] Mera Vana (Plant Collection) - Full CRUD
- [ ] Seva (Care Schedules)
- [ ] Push Notifications
- [ ] Offline Support
- [ ] Mobile Apps (iOS/Android)

---

**VrikshAI** - Bringing together वृक्ष (Vriksha - Tree) and AI for intelligent plant care! 🌱✨

**Deploy now:** `npm run deploy`
