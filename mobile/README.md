# Explys Android app (React Native / Expo)

Native learner app for Explys, built from the same API and auth flows as `frontend/`.

## Features (v1)

- Email + password login with Cloudflare Turnstile (WebView)
- 2FA verification support
- Catalog browsing (`GET /content-video`)
- Video playback (`expo-video`)
- My lessons (`GET /content-video/watched`)
- Profile summary + sign out
- Subscription gate (mirrors `frontend/src/lib/subscriptionAccess.ts`)

## Prerequisites

- Node.js 20+
- [Android Studio](https://developer.android.com/studio) with an emulator or a USB-connected device
- Expo CLI (via `npx expo`)

## Setup

```bash
cd mobile
cp .env.example .env
# Edit .env — for local backend on Android emulator use:
# EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:4200/api
npm install
```

## Run on Android

```bash
npm run android
```

Or start Metro and pick a device:

```bash
npm start
# press `a` for Android
```

## Project layout

```
mobile/
  src/
    lib/          # API client, subscription + onboarding helpers (ported from web)
    context/      # User session
    navigation/   # React Navigation stacks + tabs
    screens/      # Login, Catalog, Lessons, Profile, Content, Subscribe
    components/   # Shared UI
```

## Shared logic with web

| Web (`frontend/`) | Mobile (`mobile/src/`) |
|---|---|
| `lib/api.ts` | `lib/api.ts` (AsyncStorage instead of localStorage) |
| `lib/subscriptionAccess.ts` | `lib/subscriptionAccess.ts` |
| `lib/learnerOnboarding.ts` | `lib/learnerOnboarding.ts` + `lib/placementHelpers.ts` |
| `context/UserContext.tsx` | `context/UserContext.tsx` |

## Not in v1 (use web app)

- Registration / email verification
- Placement test iframe
- Stripe checkout in-app
- Admin panel
- Learning plan editor, quizzes, classroom uploads

## Production build

Use [EAS Build](https://docs.expo.dev/build/introduction/) for signed APK/AAB:

```bash
npx eas build --platform android
```
