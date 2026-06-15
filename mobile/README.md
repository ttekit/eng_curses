# Explys mobile app (React Native / Expo)

Native learner app for Explys on **Android and iOS**, built from the same API and auth flows as `frontend/`.

## Features (v1)

Learner-facing web pages are ported to native screens (admin panel remains web-only).

### Auth & onboarding
- Landing, login (2FA), registration (3 steps), email verification, restore account
- Google OAuth and full placement iframe remain web-only; demo level test on mobile

### Subscription
- Pricing and subscribe paywall with plan cards (checkout via Explys website)

### Learning
- Catalog (hero + category rows), catalog series detail, content watch, lesson summary
- My lessons (watched list + recap quizzes: mistakes / weekly / monthly)
- Classroom (teacher series or student assignments)
- Learning plan (goals + regenerate studying plan)

### Profile & legal
- Profile with stats, subscription info, links to pricing, demo test, about/privacy/terms/feedback

### Design
- Explys brand styling (purple theme, Inter + Space Grotesk) on auth and core screens

## Prerequisites

### Android
- Node.js 20+
- [Android Studio](https://developer.android.com/studio) with an emulator or a USB-connected device
- Android SDK (default macOS path: `~/Library/Android/sdk`)
- Expo CLI (via `npx expo`)

Gradle reads the SDK from `android/local.properties`. If `ANDROID_HOME` is unset, run `npm run preandroid` once (or any `npm run android` / `build:apk*` script — they generate it automatically).

### iOS (macOS only)
- Node.js 20+
- [Xcode](https://developer.apple.com/xcode/) from the Mac App Store (not Command Line Tools alone)
- After installing Xcode, point the active developer directory:
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```
- CocoaPods (installed automatically on first `npm run ios` if missing; or `brew install cocoapods`)
- iOS Simulator (included with Xcode) or a USB-connected iPhone with developer mode enabled

## Setup

```bash
cd mobile
cp .env.example .env
# Edit EXPO_PUBLIC_API_BASE_URL — see platform notes in .env.example
npm install
```

Generate native projects (first time, or after adding native modules):

```bash
npx expo prebuild --platform android   # Android
npx expo prebuild --platform ios       # iOS
# Or use npm scripts:
npm run prebuild:ios
```

`ios/` and `android/` are gitignored; `npm run ios` / `npm run android` auto-generate them if missing.

## Run on Android

**Do not use Expo Go.** This project uses Expo SDK 56 with custom native modules (`expo-video`, etc.) and must run in the **Explys** dev build you install via Gradle.

```bash
npm run android
```

First native build can take a few minutes. Incremental rebuilds should be much faster (often under a minute) because the project builds only `arm64-v8a` for local dev.

If Metro says "Using Expo Go", press **`s`** in the terminal to switch to **development build**, then open the **Explys** app on your phone (not Expo Go).

### "Project requires a newer version of Expo Go"

Ignore that message — you are not meant to use Expo Go for this project. Switch Metro to development build (`s`) and launch **Explys**.

### Build failed or stuck?

Do **not** run `./gradlew clean` — with New Architecture enabled it deletes generated native code and breaks the next build.

```bash
npm run android:repair
npm run android
```

If you regenerated native code, re-apply Gradle settings:

```bash
npx expo prebuild --platform android
npm run android
```

### Build succeeded but install failed?

That usually means a flaky wireless ADB connection (common on Samsung phones), not a bad APK.

```bash
npm run android:install
```

Or reconnect the phone and rerun:

```bash
adb reconnect
npm run android
```

Keep the phone unlocked and confirm any install prompt on the device.

### Red screen: "Unable to load script"

The debug APK needs **Metro** to serve JavaScript. Installing or building the APK alone is not enough.

**Recommended (one command):**

```bash
npm run android
```

**If you installed the APK separately:**

```bash
# terminal 1
npm start

# terminal 2
npm run android:connect
```

Then reload the app on the phone (shake device → Reload).

`android:connect` runs `adb reverse tcp:8081 tcp:8081` so the phone can reach Metro on your Mac.

Or start Metro and pick a device:

```bash
npm start
# press `a` for Android
```

## Run on iOS

**Do not use Expo Go.** Same as Android — use the **Explys** development build (`expo run:ios`).

### Prerequisites check

```bash
xcode-select -p
# Should print: /Applications/Xcode.app/Contents/Developer
```

If it prints `/Library/Developer/CommandLineTools`, install Xcode from the App Store and run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.

### Simulator (recommended for local dev)

```bash
npm run ios
```

First build can take several minutes (CocoaPods + Xcode compile). Incremental rebuilds are faster.

Pick a simulator when prompted, or pass a device name:

```bash
npx expo run:ios --device "iPhone 16"
```

### Physical iPhone

1. Connect the phone via USB and trust the computer.
2. Enable **Developer Mode** on the device (Settings → Privacy & Security).
3. Open `ios/Explys.xcworkspace` in Xcode once to set your **Signing Team** (Apple ID).
4. Run:
   ```bash
   npm run ios -- --device
   ```

For a local backend on a physical device, set `EXPO_PUBLIC_API_BASE_URL` to your Mac's LAN IP (e.g. `http://192.168.1.10:4200/api`), not `localhost`.

### Metro + iOS

`npm run ios` starts Metro automatically. To run separately:

```bash
# terminal 1
npm start

# terminal 2
npm run ios
```

In Metro, press **`i`** to open the iOS simulator, or **`s`** to ensure **development build** mode (not Expo Go).

### Regenerate iOS native code

After adding native modules (`expo-linear-gradient`, `react-native-svg`, etc.):

```bash
npm run prebuild:ios
npm run ios
```

`prebuild:ios` runs a clean prebuild (`--clean`). For a non-destructive first-time generate, use `npx expo prebuild --platform ios` without `--clean`.

## Project layout

```
mobile/
  src/
    theme/        # Colors, spacing, typography, font loading
    context/      # User + registration session
    lib/          # API, catalog, recap, pricing, registration helpers
    navigation/   # Root stack + main tabs
    screens/      # All learner screens (see table below)
    components/   # Shared UI
  assets/         # Brand icon and SVG assets
```

## Screen map (web → mobile)

| Web route | Mobile screen |
|-----------|---------------|
| `/` | `Landing` |
| `/loginForm` | `Login` |
| `/registrationMain` | `RegisterMain` |
| `/registrationDetails` | `RegisterDetails` |
| `/registrationPreferences` | `RegisterPreferences` |
| `/registrationSuccess` | `RegisterSuccess` |
| `/verify-email` | `VerifyEmail` |
| `/restore-account` | `RestoreAccount` |
| `/pricing` | `Pricing` |
| `/subscribe` | `Subscribe` |
| `/onboarding/dob` | `OnboardingDob` |
| `/catalog` | `Catalog` tab |
| `/catalog/series/:link` | `CatalogSeries` |
| `/content/:id` | `Content` |
| `/content/:id/summary` | `LessonSummary` |
| `/watched-lessons` | `MyLessons` tab |
| `/watched-lessons/recap/:kind` | `LearnerRecap` |
| `/classroom` | `Classroom` tab |
| `/learning-plan` | `LearningPlan` tab |
| `/profile` | `Profile` tab |
| `/level-test` | `LevelTest` |
| `/about`, `/privacy`, `/terms`, `/feedback` | `LegalDocument` |
| `*` | `NotFound` |

**Web-only:** `/admin/*`, `/oauth/success`, full placement test iframe, in-video quiz/vocab tabs (use web for full lesson tools).

After pulling UI changes that add native modules (`expo-linear-gradient`, `react-native-svg`), rebuild the dev client:

```bash
npx expo prebuild --platform android
npm run android
```

### Manual UI check (device)

1. **Login** — purple brand, readable form, inline error banner on bad credentials
2. **Catalog** — hero at top, horizontal rows per category, badges on cards
3. **Content** — watch header with back + logo, framed player, title/description below
4. Reload after Metro refresh: `npm start` then `npm run android:connect`

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

### Android

Use [EAS Build](https://docs.expo.dev/build/introduction/) for signed APK/AAB:

```bash
npx eas build --platform android
```

Local APK (after `npx expo prebuild --platform android`):

```bash
npm run build:apk        # release APK → android/app/build/outputs/apk/release/
npm run build:apk:debug  # debug APK (no release keystore required)
```

### iOS

Cloud build (requires Apple Developer account for device/App Store builds):

```bash
npx eas build --platform ios --profile preview          # internal device build
npx eas build --platform ios --profile preview-simulator  # simulator .app
npx eas build --platform ios --profile production       # App Store / TestFlight
```

Local archive: open `ios/Explys.xcworkspace` in Xcode → Product → Archive.
