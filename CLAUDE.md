# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VrikshAI is a full-stack PWA that combines Sanskrit botanical wisdom with AI for plant identification and care. The app uses a **monorepo structure** deployed to Vercel with both frontend (React) and backend (Python serverless functions) in a single repository.

## Architecture

### Monorepo Deployment Model

This is a **monorepo** with separate frontend and backend that deploy together to Vercel:

```
Project Root/
├── web/          # React PWA frontend
├── backend/      # Python serverless backend
├── vercel.json   # Routes /api/* → backend, /* → frontend
└── package.json  # Root commands operate from here
```

**Critical:** All npm commands must be run from the **project root**, not from `web/`. The root `package.json` contains scripts that `cd` into subdirectories.

### Request Routing (vercel.json)

Vercel routes requests based on `vercel.json`:
- `/api/*` → Python serverless functions in `backend/api/`
- `/*` → React SPA served from `web/build/`

The frontend and backend share the same domain (no CORS issues).

### Backend Architecture (Python Serverless)

The backend uses **Vercel serverless functions** with a custom routing layer:

- `backend/api/index.py` - Entry point that routes all `/api/*` requests to individual handlers
- `backend/api/*.py` - Individual API modules (auth, darshan, vana, etc.)
- `backend/api/_utils/` - Shared utilities (database, auth middleware)

**Important:** Backend functions use `BaseHTTPRequestHandler` class-based structure for Vercel compatibility.

### Frontend Architecture (React + TypeScript)

- **Routing:** React Router v6 with protected/public route wrappers
- **Auth:** JWT tokens stored in localStorage, managed by `AuthContext`
- **API:** Axios instance in `services/api.ts` with interceptors for auth and error handling
- **State:** React Context API (no Redux) - `AuthContext` is the primary global state
- **Styling:** CSS modules with custom VrikshAI color palette (#2D5016 primary green)

## Development Commands

### Local Development (Full Stack)

To run both frontend and backend locally:

**Terminal 1 - Backend:**
```bash
npm run start:backend  # Starts Flask dev server on port 5001
```

**Terminal 2 - Frontend:**
```bash
npm run start:frontend  # Starts React dev server on port 3000
```

Or for instructions:
```bash
npm run dev  # Shows terminal instructions
```

The frontend proxies `/api/*` to `http://localhost:5001` via `web/package.json` proxy setting.

### Frontend Only (UI Development)

```bash
npm start  # Starts React on port 3000 (API calls will fail)
```

### Build & Deploy

```bash
npm run build           # Build React app
npm run deploy          # Deploy to Vercel production
npm run deploy:preview  # Deploy preview to Vercel
```

### Maintenance

```bash
npm install             # Install frontend dependencies
npm run clean           # Clean build artifacts
npm run reinstall       # Clean + reinstall
```

### Testing

```bash
npm test  # Run frontend tests
```

## Environment Variables

### Required for Deployment (Set in Vercel Dashboard)

- `OPENAI_API_KEY` - OpenAI API key for GPT-4o
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon/public key
- `JWT_SECRET` - Secret for signing JWT tokens (32+ chars)

### Local Development (.env in root)

Same variables as above, needed for `backend/dev_server.py`.

### Frontend Configuration (web/.env)

```bash
REACT_APP_API_URL=/api  # For Vercel deployment (relative path)
```

For local full-stack development, the proxy in `web/package.json` handles routing.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### AI Features
- `POST /api/darshan` - AI plant identification (GPT-4o vision)
- `POST /api/chikitsa` - Health diagnosis
- `POST /api/seva` - Care schedule generation

### Plant Collection
- `GET /api/vana` - Get user's plants
- `POST /api/vana` - Add plant
- `GET /api/vana/:id` - Get plant details
- `PUT /api/vana/:id` - Update plant
- `DELETE /api/vana/:id` - Delete plant

## Code Patterns

### Backend: Adding New Endpoints

1. Create handler in `backend/api/your_module.py`:
```python
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Your logic here
        pass
```

2. Add route in `backend/api/index.py`:
```python
elif path == '/api/your-endpoint':
    return your_module.handler(self)
```

### Frontend: Protected Routes

All authenticated pages use the `ProtectedRoute` wrapper in `App.tsx`:

```tsx
<Route path="/your-page" element={
  <ProtectedRoute><YourPage /></ProtectedRoute>
} />
```

### Frontend: API Calls

Use functions from `services/api.ts`:
```tsx
import { aiDarshan } from '../services/api';

const result = await aiDarshan({ image: base64Image });
```

The API client automatically:
- Adds JWT tokens to requests
- Handles 401 errors (redirects to login)
- Shows error toasts
- Manages token storage

### Frontend: Image Upload

Use `processImageForUpload()` from `services/api.ts`:
```tsx
const base64 = await processImageForUpload(file);
// Automatically validates, compresses, and converts to base64
```

## Key Constraints

### Backend Limitations

- Backend runs as **serverless functions** - no persistent state between requests
- Each function has a **10-second timeout** on Vercel free tier
- `vercel dev` has routing issues with monorepos - use `backend/dev_server.py` for local testing
- Import paths must include `backend/api/` structure

### Frontend Constraints

- Uses `proxy` in package.json for local dev - React dev server forwards `/api/*` to backend
- Authentication state in `AuthContext` is lost on refresh (re-fetched from localStorage token)
- All routes except `/auth` require authentication (enforced by `ProtectedRoute`)

### Vercel Deployment

- Frontend: Static build from `web/build/`
- Backend: Python runtime with `requirements.txt`
- Single deployment command deploys both frontend and backend
- Environment variables must be set in Vercel Dashboard (not in code)

## Database Schema (Supabase)

### users table
- `id` (UUID) - Primary key
- `email` (TEXT) - Unique
- `password_hash` (TEXT)
- `name` (TEXT)
- `created_at` (TIMESTAMPTZ)

### plants table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `common_name` (TEXT)
- `scientific_name` (TEXT)
- `sanskrit_name` (TEXT)
- `nickname` (TEXT)
- `acquired_date` (DATE)
- `location` (TEXT)
- `image_url` (TEXT)
- `health_status` (TEXT) - 'healthy', 'warning', or 'critical'
- `last_watered` (TIMESTAMPTZ)
- `last_fertilized` (TIMESTAMPTZ)
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Important Files

### Configuration
- `vercel.json` - Routes `/api/*` to backend, `/*` to frontend
- `package.json` (root) - All npm commands run from here
- `web/package.json` - Has `proxy: "http://localhost:5001"` for local dev

### Backend Entry Points
- `backend/api/index.py` - Routes all API requests to handlers
- `backend/dev_server.py` - Flask dev server for local testing (port 5001)

### Frontend Entry Points
- `web/src/App.tsx` - Main app with routing and auth wrappers
- `web/src/contexts/AuthContext.tsx` - Global auth state
- `web/src/services/api.ts` - Centralized API client with interceptors

## Common Pitfalls

1. **Running npm commands from wrong directory** - Always run from project root, not `web/`
2. **Missing environment variables** - Backend requires OpenAI + Supabase keys in .env or Vercel
3. **Port 5000 conflicts** - macOS AirPlay uses port 5000, backend uses 5001
4. **Vercel dev doesn't work locally** - Use `npm run start:backend` and `npm run start:frontend` instead
5. **Forgetting to proxy** - Frontend local dev requires `proxy` in `web/package.json`
6. **Image size** - Images must be <5MB and compressed before upload

## Sanskrit Naming Convention

All features use Sanskrit terminology:
- **Darshan (दर्शन)** - "Vision" - Plant identification
- **Chikitsa (चिकित्सा)** - "Treatment" - Health diagnosis
- **Seva (सेवा)** - "Service" - Care schedules
- **Vana (वन)** - "Forest" - Plant collection (Mera Vana = My Garden)

Maintain this naming in routes, components, and user-facing text.

## Design System

### Colors (VrikshAI Palette)
- Primary: `#2D5016` (Deep forest green)
- Secondary: `#7CB342` (Light green)
- Accent: `#00BFA5` (Teal)
- Background: `#F1F8E9` (Light green tint)

### Typography
- All fonts use **Open Sans** (set in `web/public/index.html` and all CSS files)
- Font weights: 300, 400, 600, 700, 800

### Component Structure
- Components in `web/src/components/` are reusable UI primitives
- Pages in `web/src/pages/` are route-level components
- Each has a corresponding `.css` file with the same base name
