# VrikshAI Backend

Python backend with Pydantic AI and GPT-5 for plant identification, health diagnosis, and care recommendations.

## 🏗️ Architecture

- **Framework**: Vercel Serverless Functions (Python 3.9)
- **AI**: Pydantic AI + OpenAI GPT-5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **API Style**: RESTful with JSON

## 📁 Structure

```
backend/
├── api/
│   ├── darshan.py          # Plant identification endpoint
│   ├── chikitsa.py         # Health diagnosis endpoint
│   ├── seva.py             # Care recommendations endpoint
│   ├── vana.py             # Plant collection CRUD
│   ├── auth.py             # Authentication endpoints
│   └── _utils/
│       ├── models.py               # Pydantic models
│       ├── vriksh_ai_service.py    # AI service with GPT-5
│       ├── database.py             # Supabase wrapper
│       ├── auth_middleware.py      # JWT authentication
│       └── prompts.py              # System prompts
├── requirements.txt
├── vercel.json            # Vercel configuration
├── schema.sql             # Database schema
└── .env.example           # Environment template
```

## 🚀 Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Copy Project URL and anon key
4. In SQL Editor, run `schema.sql` to create tables

### 3. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and add payment method
3. Generate API key with GPT-5 access
4. Copy key (starts with `sk-`)

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
OPENAI_API_KEY=sk-your-openai-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
JWT_SECRET=your-random-secret-min-32-characters
```

Generate secure JWT secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Test Locally (Optional)

Install Vercel CLI:
```bash
npm install -g vercel
vercel login
```

Test locally:
```bash
vercel dev
```

### 6. Deploy to Vercel

```bash
vercel --prod
```

Add environment variables in Vercel Dashboard:
- Settings → Environment Variables
- Add all 4 variables from `.env`
- Redeploy after adding variables

## 📡 API Documentation

### Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt-token>
```

### POST /api/auth/signup

Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- 400: Invalid input
- 409: Email already exists

### POST /api/auth/login

Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- 400: Missing fields
- 401: Invalid credentials

### POST /api/darshan

Identify plant from image. **Public endpoint.**

**Request:**
```json
{
  "image_url": "https://example.com/plant.jpg"
}
```
OR
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
{
  "success": true,
  "darshan": {
    "common_name": "Monstera Deliciosa",
    "scientific_name": "Monstera deliciosa",
    "sanskrit_name": null,
    "family": "Araceae",
    "confidence": 0.95,
    "care_summary": {
      "watering": "Every 7-10 days",
      "light": "Bright indirect light",
      "temperature": "18-24°C",
      "humidity": "Moderate, 40-60%"
    },
    "traditional_use": null,
    "fun_fact": "Known as Swiss Cheese Plant..."
  }
}
```

**Errors:**
- 400: Missing or invalid image
- 500: AI identification failed

### POST /api/chikitsa

Diagnose plant health issues. **Requires authentication.**

**Request:**
```json
{
  "plant_name": "Monstera Deliciosa",
  "symptoms": "Yellowing leaves with brown spots",
  "image_url": "https://...",  // Optional
  "plant_id": "uuid"            // Optional, for saving to history
}
```

**Response:**
```json
{
  "success": true,
  "chikitsa": {
    "diagnosis": "Overwatering with fungal infection",
    "severity": "warning",
    "confidence": 0.85,
    "causes": [
      "Excessive watering",
      "Poor drainage",
      "High humidity"
    ],
    "treatment": {
      "immediate": ["Stop watering", "Remove affected leaves"],
      "ongoing": ["Water less frequently", "Improve drainage"],
      "products": ["Neem oil", "Fungicide spray"]
    },
    "prevention": ["Check soil before watering"],
    "recovery_time": "2-3 weeks",
    "warning_signs": ["Spreading brown spots"],
    "ayurvedic_wisdom": "Use neem for fungal issues"
  },
  "saved": true
}
```

**Errors:**
- 400: Missing required fields
- 401: Not authenticated
- 500: Diagnosis failed

### POST /api/seva

Generate personalized care schedule. **Public endpoint.**

**Request:**
```json
{
  "plant_name": "Monstera Deliciosa",
  "location": "Mumbai, India",    // Optional
  "season": "Summer",              // Optional
  "indoor": true                   // Optional
}
```

**Response:**
```json
{
  "success": true,
  "seva": {
    "watering": {
      "frequency_days": 7,
      "amount": "200-300ml",
      "method": "Top watering",
      "seasonal_adjustment": "Water more in summer",
      "signs_to_water": ["Top 2 inches of soil dry"]
    },
    "light": {
      "hours_per_day": "6-8 hours",
      "type": "Bright indirect",
      "placement": "East or north-facing window",
      "seasonal_note": "More light in winter"
    },
    "fertilizing": {
      "frequency": "Every 2 weeks during growing season",
      "type": "Balanced liquid 20-20-20",
      "dilution": "Half strength",
      "seasonal_note": "Reduce in winter"
    },
    "maintenance": {
      "pruning": "Trim dead leaves as needed",
      "repotting": "Every 1-2 years in spring",
      "cleaning": "Wipe leaves monthly",
      "pest_check": "Weekly inspection"
    },
    "seasonal_tips": [
      "Spring: Increase watering",
      "Summer: Provide more humidity",
      "Fall: Reduce fertilizing",
      "Winter: Water sparingly"
    ],
    "vaidya_wisdom": "Traditional care advice..."
  }
}
```

### GET /api/vana

Get user's plant collection. **Requires authentication.**

**Response:**
```json
{
  "success": true,
  "vana": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My Monstera",
      "species": "Monstera Deliciosa",
      "scientific_name": "Monstera deliciosa",
      "health_status": "healthy",
      "last_watered": "2025-11-01T10:00:00Z",
      "next_watering_due": "2025-11-08",
      ...
    }
  ],
  "count": 1
}
```

### POST /api/vana

Add plant to collection. **Requires authentication.**

**Request:**
```json
{
  "name": "My Monstera",
  "species": "Monstera Deliciosa",
  "scientific_name": "Monstera deliciosa",
  "image_url": "https://...",
  "care_schedule": {...},
  "notes": "Birthday gift"
}
```

**Response:**
```json
{
  "success": true,
  "plant_id": "uuid",
  "message": "Plant added to Mera Vana successfully"
}
```

### PATCH /api/vana

Update plant. **Requires authentication.**

**Request:**
```json
{
  "plant_id": "uuid",
  "last_watered": "2025-11-01T10:00:00Z",
  "watering_frequency_days": 7,
  "health_status": "healthy",
  "notes": "Looking better!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plant updated successfully"
}
```

### DELETE /api/vana?plant_id=uuid

Remove plant. **Requires authentication.**

**Response:**
```json
{
  "success": true,
  "message": "Plant removed from Mera Vana successfully"
}
```

## 🔧 Development

### Project Structure

**models.py**: Pydantic models define AI response structures
- DarshanResult: Plant identification
- ChikitsaResult: Health diagnosis
- SevaSchedule: Care recommendations
- All models have validation and proper types

**vriksh_ai_service.py**: Core AI service
- Uses Pydantic AI with GPT-5
- Three specialized agents (darshan, chikitsa, seva)
- Each agent has custom system prompt
- Returns validated Pydantic models
- Singleton pattern for efficiency

**database.py**: Supabase operations
- CRUD operations for plants
- User management
- History tracking
- Ownership verification
- Error handling

**auth_middleware.py**: JWT authentication
- Token generation (7-day expiry)
- Token verification
- Header extraction
- Error handling

**prompts.py**: System prompts for AI agents
- Culturally-aware guidance
- Sanskrit terminology when appropriate
- Practical, actionable advice
- Honest confidence levels

### Adding New Endpoint

1. Create `api/new_endpoint.py`:

```python
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # CORS headers
        pass

    def do_POST(self):
        # Implementation
        pass
```

2. Add route to `vercel.json`:

```json
{
  "routes": [
    {
      "src": "/api/new_endpoint",
      "dest": "/api/new_endpoint.py"
    }
  ]
}
```

3. Test locally:

```bash
vercel dev
curl -X POST http://localhost:3000/api/new_endpoint
```

## 🐛 Debugging

### Enable Debug Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Test AI Service

```python
import asyncio
from api._utils.vriksh_ai_service import get_vriksh_ai_service

async def test_darshan():
    service = get_vriksh_ai_service()
    result = await service.ai_darshan("https://example.com/plant.jpg")
    print(result)

asyncio.run(test_darshan())
```

### Test Database

```python
from api._utils.database import get_database

db = get_database()
plants = db.get_mera_vana("user-uuid-here")
print(plants)
```

### Check Logs

Vercel Dashboard → Project → Logs

## 🔒 Security

1. **Environment Variables**: Never commit `.env`
2. **JWT Secret**: Use strong random string (32+ chars)
3. **Input Validation**: All endpoints validate inputs
4. **SQL Injection**: Protected by Supabase client
5. **XSS**: Sanitize any HTML output
6. **Rate Limiting**: Add if public endpoints abused
7. **CORS**: Configured in all endpoints

## 📊 Monitoring

### Vercel Analytics

- View in Vercel Dashboard
- Track response times
- Monitor error rates
- Check function invocations

### Supabase Monitoring

- Database queries
- Storage usage
- API requests
- User activity

## 🚀 Performance

- **Cold starts**: ~2-3 seconds first request
- **Warm requests**: ~200-500ms
- **AI calls**: ~3-5 seconds (GPT-5)
- **Database queries**: ~50-100ms

**Optimization tips:**
- Use singleton pattern for services
- Cache Pydantic AI agents
- Minimize database roundtrips
- Compress images before upload

## 📈 Scaling

Current limits (Vercel Free):
- 100GB bandwidth/month
- 100 hours serverless execution/month
- 1000 invocations/day per function

For production:
- Upgrade Vercel plan
- Add Redis caching
- Implement rate limiting
- Use CDN for images
- Database connection pooling

## 🤝 Contributing

Code style:
- Follow PEP 8
- Type hints everywhere
- Docstrings for all functions
- Error handling in all endpoints
- Security-first mindset

## 📞 Support

Issues? Check:
1. Environment variables set correctly
2. Supabase schema.sql executed
3. OpenAI API key has credits
4. Vercel deployment successful
5. CORS headers in all endpoints

---

**Built with 🌱 for VrikshAI**
