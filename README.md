# Scrolis — Frontend (mobile)

Scrolis is a React Native + Expo mobile application for personalized news and perspective discovery. The frontend is an Expo app that connects to a backend API to fetch topic digests, social-media-derived posts, and personalized analyses.

This repository contains the mobile client (UI, navigation, auth flows, and local session management).

Key features
- Authentication and account creation
- Social account sync (X, Reddit, TikTok integration hooks)
- Feed with perspective synthesis and topic detail pages
- Profile analytics and visualizations
- Offline-safe token storage with SecureStore

Tech stack
- React Native
- Expo
- TypeScript
- React Navigation
- expo-video (native video player integration)

Prerequisites
- Node.js 18+
- npm or yarn
- Xcode (for iOS) or Android Studio (for Android) if you plan to build native apps

Getting started (development)
1. Install dependencies

```bash
npm install
# or
yarn
```

2. Environment

Create a `.env` file in the project root (or copy from `.env.example` if present):

```bash
cp .env.example .env
```

Essential environment variables (examples)

```env
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
EXPO_PUBLIC_TWITTER_CLIENT_ID=your-twitter-client-id
EXPO_PUBLIC_TWITTER_REDIRECT_URI=your-app-scheme://twitter-callback
# Add other EXPO_PUBLIC_ variables required by your backend
```

Notes
- Expo public runtime variables must start with `EXPO_PUBLIC_`.

Run the app

```bash
npm run start   # Expo dev server
npm run ios     # Open iOS simulator (macOS)
npm run android # Open Android emulator
npm run web     # Run in browser
```

Project layout (important files)

- `src/contexts/AppAuthContext.tsx` — centralized auth/session state
- `src/hooks/useRedditAuth.ts` — Reddit sign-in + deep-link handling
- `src/hooks/useTwitterAuth.ts` — Twitter/X sign-in
- `src/screens/SocialMediaSyncScreen.tsx` — social account sync UI
- `src/screens/TopicDetailScreen.tsx` — topic details and perspective tabs
- `src/components/*` — shared UI components (buttons, banners, pagination)
- `src/utils/TokenManager.ts` — SecureStore helpers for session and tokens

Development notes
- Keep API logic inside hooks (`src/hooks`) and session state in `AppAuthContext`.
- UI-only elements (buttons, icons, small layouts) should live in `src/components`.
- For video playback, the app uses `expo-video` with `useVideoPlayer()` + `VideoView`.

Troubleshooting
- If env vars are not being picked up: restart the Expo server after updating `.env`.
- If native builds fail: open the native project in Xcode/Android Studio and resolve missing components or accept licenses.



