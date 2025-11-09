# VrikshAI Web App 🌱

**Ancient Wisdom. Modern Intelligence.**

VrikshAI (वृक्षAI) is a Progressive Web App that combines ancient Sanskrit botanical wisdom with modern AI technology. Built with React and TypeScript, it provides plant identification, health diagnosis, and personalized care recommendations powered by AI

## Features

### 🔍 AI Darshan (Plant Identification)

- Upload a plant photo for instant AI identification
- Get detailed information including:
  - Common name, scientific name, and Sanskrit name
  - Plant family and care requirements
  - Traditional Ayurvedic uses
  - Fun facts and growing tips
- Confidence scores for accuracy

### 🌿 AI Chikitsa (Health Diagnosis) - Coming Soon

- Diagnose plant diseases and pest issues
- Receive treatment recommendations
- Natural and chemical remedy suggestions
- Prevention tips and warning signs

### 🌳 Mera Vana (My Forest) - Coming Soon

- Build your personal plant collection
- Track watering and fertilizing schedules
- Monitor plant health over time
- Set custom reminders

## Tech Stack

- **Frontend**: React 18.3 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Styling**: CSS with custom VrikshAI theme
- **PWA**: Service Worker with offline support

## Project Structure

```
web/
├── public/
│   ├── index.html          # HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── LoadingSpinner.tsx
│   ├── constants/          # App constants
│   │   ├── colors.ts       # VrikshAI color palette
│   │   └── strings.ts      # UI text and labels
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── pages/              # Page components
│   │   ├── AuthPage.tsx    # Login/Signup
│   │   ├── HomePage.tsx    # Dashboard
│   │   ├── DarshanPage.tsx # Plant identification
│   │   ├── MeraVanaPage.tsx
│   │   └── ChikitsaPage.tsx
│   ├── services/           # API and utilities
│   │   └── api.ts          # Backend API client
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx             # Root component
│   ├── App.css             # Global styles
│   └── index.tsx           # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running (see `../backend/README.md`)

### Installation

1. **Install dependencies:**

   ```bash
   cd web
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your backend URL:

   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

3. **Start development server:**

   ```bash
   npm start
   ```

   The app will open at http://localhost:3000

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (one-way operation)

## Development

### Color Palette

VrikshAI uses a nature-inspired green color scheme:

```typescript
Primary: #2D5016 (Deep Forest Green)
Secondary: #7CB342 (Light Green)
Accent: #00BFA5 (Teal)
Background: #F1F8E9 (Light Green Background)
```

See `src/constants/colors.ts` for the complete palette.

### Adding New Features

1. **Create types** in `src/types/index.ts`
2. **Add API methods** in `src/services/api.ts`
3. **Create page component** in `src/pages/`
4. **Add route** in `src/App.tsx`
5. **Update navigation** as needed

### Authentication Flow

The app uses JWT token-based authentication:

1. User logs in via `AuthPage`
2. Backend returns JWT token + user data
3. Token stored in localStorage
4. Token included in all API requests (via axios interceptor)
5. Protected routes check authentication status
6. Auto-redirect on token expiry (401 responses)

### Image Processing

Plant photos are processed client-side before upload:

1. **Validation**: Check file type (JPEG, PNG, WebP)
2. **Compression**: Resize to max 1024px width, 70% quality
3. **Size check**: Max 5MB after compression
4. **Base64 encoding**: Convert to base64 string
5. **Upload**: Send to backend API

See `src/services/api.ts` for implementation.

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Deploy to Vercel

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Deploy:**

   ```bash
   cd web
   vercel --prod
   ```

3. **Set environment variables in Vercel:**
   - Go to your project settings
   - Add `REACT_APP_API_URL` with your backend URL

### Deploy to Netlify

1. **Build the app:**

   ```bash
   npm run build
   ```

2. **Deploy build folder:**

   ```bash
   npx netlify deploy --prod --dir=build
   ```

3. **Configure environment variables** in Netlify dashboard

### Other Hosting Options

The production build is a static site that can be hosted on:

- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting
- Any static hosting service

## Environment Variables

| Variable            | Description          | Default                     |
| ------------------- | -------------------- | --------------------------- |
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## PWA Features

VrikshAI is a Progressive Web App with:

- **Installable**: Add to home screen on mobile/desktop
- **Offline-ready**: Service worker caching (coming soon)
- **App-like**: Standalone display mode
- **Fast**: Optimized performance and loading

### Installing as PWA

1. **On Mobile (Chrome/Safari):**

   - Open the app in browser
   - Tap "Add to Home Screen"
   - App icon appears on home screen

2. **On Desktop (Chrome/Edge):**
   - Click install icon in address bar
   - Or use browser menu: "Install VrikshAI"

## API Integration

The app communicates with the Python backend via REST API:

### Endpoints Used

```typescript
POST /api/auth/login          // User login
POST /api/auth/signup         // User registration
GET  /api/auth/verify         // Verify JWT token

POST /api/darshan             // Plant identification
POST /api/chikitsa            // Health diagnosis
POST /api/seva                // Care schedules

GET  /api/vana                // Get plant collection
POST /api/vana                // Add plant
GET  /api/vana/:id            // Get plant details
PUT  /api/vana/:id            // Update plant
DELETE /api/vana/:id          // Delete plant
```

See `src/services/api.ts` for full implementation.

## Troubleshooting

### "Network Error" when testing

**Problem**: Cannot connect to backend API

**Solution**:

1. Ensure backend is running: `cd ../backend && python app.py`
2. Check `.env` file has correct `REACT_APP_API_URL`
3. Verify backend CORS allows your frontend URL
4. Check browser console for exact error

### "Unauthorized" errors

**Problem**: JWT token expired or invalid

**Solution**:

1. Token expires after 7 days - log in again
2. Clear localStorage: `localStorage.clear()` in browser console
3. Check backend is using correct JWT secret

### Build errors

**Problem**: TypeScript errors or missing dependencies

**Solution**:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf build

# Rebuild
npm run build
```

### Images not uploading

**Problem**: "Image size exceeds 5MB" or "Invalid image type"

**Solution**:

1. Images are compressed automatically - try a smaller image
2. Only JPEG, PNG, WebP supported
3. Check browser console for detailed error
4. Ensure backend accepts base64 images

## Contributing

VrikshAI follows standard React best practices:

1. Use TypeScript for type safety
2. Keep components small and focused
3. Use functional components with hooks
4. Follow the existing folder structure
5. Add comments for complex logic
6. Test before committing

## License

This project is part of the VrikshAI platform.

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review backend documentation: `../backend/README.md`
3. Check browser console for errors
4. Ensure all environment variables are set correctly

---

**VrikshAI** - Bringing together वृक्ष (Vriksha - Tree) and AI for intelligent plant care! 🌱✨
