# VrikshAI Quick Start Guide

Get VrikshAI running in 30 minutes.

## ✅ What's Completed

**Backend (100% Complete):**
- ✅ All API endpoints (darshan, chikitsa, seva, vana, auth)
- ✅ Pydantic AI service with GPT-5
- ✅ Database schema and operations
- ✅ JWT authentication
- ✅ Vercel configuration

**Mobile Infrastructure (70% Complete):**
- ✅ Project configuration (package.json, tsconfig, app.json)
- ✅ TypeScript types
- ✅ Constants (Colors, Strings)
- ✅ Services (API client, auth, storage)
- ✅ Utils (image, date)
- ✅ Hooks (useAuth, usePlants)
- ⏳ Screens (8 files needed)
- ⏳ Components (5 files needed)
- ⏳ Navigation setup (1 file needed)

## 🚀 Quick Setup

### Step 1: Backend (15 minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your credentials:
# - Get OpenAI key from platform.openai.com
# - Create Supabase project at supabase.com
# - Run schema.sql in Supabase SQL Editor
# - Generate JWT secret: python -c "import secrets; print(secrets.token_urlsafe(32))"

# 5. Deploy to Vercel
vercel --prod

# 6. Add environment variables in Vercel Dashboard:
# Settings → Environment Variables → Add all 4 variables
```

### Step 2: Mobile Setup (5 minutes)

```bash
# 1. Navigate to mobile
cd mobile

# 2. Install dependencies
npm install

# 3. Create .env file
echo "EXPO_PUBLIC_API_URL=https://your-vercel-url.vercel.app" > .env

# 4. Start development server
npm start
```

### Step 3: Implement Remaining Files (10-15 minutes)

You need to create 14 files following the patterns in the READMEs:

**Priority 1 - Core (Required for MVP):**
1. `mobile/src/App.tsx` - 10 lines (Root component)
2. `mobile/src/navigation/AppNavigator.tsx` - 50 lines (Navigation)
3. `mobile/src/screens/AuthScreen.tsx` - 150 lines (Login/Signup)
4. `mobile/src/screens/HomeScreen.tsx` - 100 lines (Dashboard)
5. `mobile/src/screens/DarshanScreen.tsx` - 200 lines (Camera & ID)

**Priority 2 - Essential Features:**
6. `mobile/src/screens/MeraVanaScreen.tsx` - 100 lines (Plant list)
7. `mobile/src/screens/PlantDetailScreen.tsx` - 150 lines (Plant view)
8. `mobile/src/screens/ChikitsaScreen.tsx` - 200 lines (Diagnosis)

**Priority 3 - UI Components:**
9. `mobile/src/components/PlantCard.tsx` - 40 lines
10. `mobile/src/components/HealthIndicator.tsx` - 30 lines
11. `mobile/src/components/LoadingSpinner.tsx` - 20 lines
12. `mobile/src/components/EmptyState.tsx` - 40 lines
13. `mobile/src/components/SevaReminder.tsx` - 50 lines

**Total: ~1,140 lines across 13 files**

## 📝 Implementation Templates

### App.tsx (10 lines)

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
      <Toast />
    </NavigationContainer>
  );
}
```

### AppNavigator.tsx (50 lines)

See `mobile/README.md` for complete template.

Key structure:
- Check auth on mount
- Conditional rendering based on auth state
- Stack navigator with proper types

### Screen Structure Template

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Strings } from '../constants/Strings';

export default function ScreenName() {
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Your UI here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
```

## 🎯 Implementation Order

### Phase 1: Basic Auth & Navigation (30 min)

1. Create `App.tsx` (5 min)
2. Create `AppNavigator.tsx` (10 min)
3. Create `AuthScreen.tsx` (15 min)
4. Test: Signup → Login → Token storage

### Phase 2: Core Features (1 hour)

5. Create `HomeScreen.tsx` (15 min)
6. Create `DarshanScreen.tsx` (30 min)
7. Create `MeraVanaScreen.tsx` (15 min)
8. Test: Identify plant → Add to Vana → View collection

### Phase 3: Advanced Features (1 hour)

9. Create `PlantDetailScreen.tsx` (20 min)
10. Create `ChikitsaScreen.tsx` (30 min)
11. Test: Water logging → Health diagnosis

### Phase 4: UI Polish (30 min)

12-16. Create all components (5-10 min each)
17. Test all flows end-to-end

## 🧪 Testing Checklist

After implementing all files, test:

**Authentication:**
- [ ] Signup creates account
- [ ] Login works with credentials
- [ ] Token persists after restart
- [ ] Logout clears token

**Plant Identification:**
- [ ] Camera opens and captures
- [ ] Gallery picker works
- [ ] Image uploads successfully
- [ ] Results display correctly
- [ ] Add to Vana works

**Plant Collection:**
- [ ] Plants display in grid
- [ ] Empty state shows when no plants
- [ ] Plant detail screen opens
- [ ] Water button updates timestamp
- [ ] Delete removes plant

**Health Diagnosis:**
- [ ] Plant selector shows user's plants
- [ ] Symptoms input works
- [ ] Diagnosis returns results
- [ ] Severity badge shows correct color

## 🐛 Common Issues & Fixes

### "Cannot find module '@react-navigation/native'"

```bash
cd mobile
npm install
```

### "Network request failed"

Check `.env` has correct API URL:
```bash
cat mobile/.env
# Should show: EXPO_PUBLIC_API_URL=https://...
```

### "Camera permission denied"

Update `app.json` with permission strings (already done).
Reset permissions: Settings → Apps → VrikshAI → Permissions

### "OpenAI API error"

Check backend `.env` has valid `OPENAI_API_KEY`.
Verify key has credits at platform.openai.com.

### "Supabase connection failed"

Run `schema.sql` in Supabase SQL Editor.
Check `SUPABASE_URL` and `SUPABASE_KEY` are correct.

## 📚 Resources

**Official Docs:**
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Pydantic AI](https://ai.pydantic.dev/)
- [OpenAI API](https://platform.openai.com/docs)
- [Supabase Docs](https://supabase.com/docs)

**Code References:**
- `backend/README.md` - API documentation
- `mobile/README.md` - Screen templates
- `README.md` - Full project overview

## ✨ Next Steps After MVP

1. **Testing**: Add unit tests for utils and services
2. **Error Boundaries**: Catch and display React errors
3. **Offline Mode**: Queue API calls when offline
4. **Push Notifications**: Watering reminders
5. **Analytics**: Track user engagement
6. **Performance**: Optimize images and renders
7. **Accessibility**: Add screen reader support
8. **Dark Mode**: Implement dark theme
9. **Localization**: Support multiple languages
10. **Social Features**: Share plants with friends

## 🎉 Success Criteria

Your MVP is complete when:

1. ✅ User can signup and login
2. ✅ Camera captures plant photos
3. ✅ AI identifies plants correctly
4. ✅ Plants save to Mera Vana
5. ✅ Plant detail screen shows info
6. ✅ Water logging works
7. ✅ Health diagnosis provides treatment
8. ✅ App doesn't crash on errors
9. ✅ All API calls work
10. ✅ UI matches VrikshAI branding

## 🚢 Deployment

### Backend

Already deployed to Vercel! Just update code:

```bash
cd backend
git add .
git commit -m "Update backend"
vercel --prod
```

### Mobile

Build for stores:

```bash
cd mobile

# iOS
eas build --platform ios
eas submit --platform ios

# Android
eas build --platform android
eas submit --platform android
```

## 💰 Cost Estimate

**Development (Free Tier):**
- Supabase: Free (500MB database, 1GB bandwidth)
- Vercel: Free (100GB bandwidth, 100hr execution)
- OpenAI: Pay-as-you-go (~$0.01-0.10 per request)

**Production (Estimated Monthly):**
- Supabase Pro: $25/month (8GB database, 100GB bandwidth)
- Vercel Pro: $20/month (1TB bandwidth, unlimited execution)
- OpenAI: $50-500/month (depends on usage)
- **Total: $95-545/month for 1000-10000 users**

## 📞 Need Help?

1. Check README files for detailed docs
2. Review code comments in implemented files
3. Test endpoints with curl/Postman
4. Check Vercel/Supabase logs for errors
5. Ensure environment variables are set

## 🌟 You're Almost There!

You have:
- ✅ Complete working backend
- ✅ 70% of mobile infrastructure
- ⏳ 13 screen/component files to implement

Average developer time: **2-3 hours** to finish remaining files.

**Let's build VrikshAI! 🌱**

---

*Ancient Wisdom. Modern Intelligence.*
