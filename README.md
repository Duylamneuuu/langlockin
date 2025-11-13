# Lock-in Beat

A React Native (Expo Managed) focus session app with background audio playback and accountability features.

## Features

- 🎵 Background audio playback during focus sessions
- ⏱️ Customizable session durations (30, 60, 90, 120 minutes)
- 🔐 Firebase Authentication
- 💎 Premium vs Free user tiers
- ⚡ Penalty mechanism for free users (10-second grace period when leaving app)
- 🎯 Session tracking with countdown timer
- 🔊 Audio continues playing even when screen is locked

## Quick Start

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (install globally: `npm install -g expo-cli`)
- Firebase project (see Firebase Configuration below)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Duylamneuuu/langlockin.git
cd langlockin
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase (see Firebase Configuration section below)

4. Add music files to `assets/music/` directory:
   - Add `focus1.mp3`
   - Add `focus2.mp3`
   
   You can use any MP3 files for background music. Name them exactly as shown above.

5. Start the Expo development server:
```bash
npm start
# or
expo start
```

6. Run on your device:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider

3. Create Firestore Database:
   - Go to Firestore Database → Create database
   - Start in test mode (or configure security rules)
   - The app will automatically create user documents with structure:
     ```
     users/{userId}
       - isPremium: boolean
     ```

4. Get your Firebase configuration:
   - Go to Project Settings → General → Your apps
   - Click "Add app" or select existing web app
   - Copy the Firebase configuration object

5. Update `src/services/firebase.ts`:
   - Replace the placeholder `firebaseConfig` object with your actual configuration:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

## How to Use

1. **Sign Up / Sign In**: Create an account or log in with email/password
2. **Select Duration**: Choose session length (30, 60, 90, or 120 minutes)
3. **Select Music**: Pick a background music track
4. **Start Session**: Begin your focus session
5. **Stay Focused**: Keep the app in foreground or accept the consequences!

### Free vs Premium Users

**Free Users:**
- 10-second grace period when app goes to background
- If you don't return within 10 seconds, the session fails
- Cannot skip sessions
- Audio continues playing when screen is locked (this is OK)

**Premium Users:**
- Can freely switch apps without penalties
- Can skip sessions
- Full background mode support

## Testing Guide

### Test Free User Penalty Mechanism:

1. Sign up a new user (default isPremium: false)
2. Start a session from the Home screen
3. Press the Home button or switch to another app
4. Wait more than 10 seconds
5. Return to the app → You should see "Session Failed" alert

### Test Premium User:

1. Manually update user in Firestore:
   - Open Firebase Console → Firestore Database
   - Find your user document in `users` collection
   - Set `isPremium: true`
2. Restart the app or refresh
3. Start a session
4. Switch apps freely → Session continues without penalty

### Test with RevenueCat Stub:

You can also use the stub function to mark a user as premium:
```typescript
import { markUserPremium } from './src/services/revenuecat';
// Call with user ID
await markUserPremium('YOUR_USER_ID');
```

## RevenueCat Integration (Future IAP)

This app includes a stub for RevenueCat in-app purchase integration. The actual IAP implementation requires:

1. **Install RevenueCat SDK:**
```bash
npm install react-native-purchases
```

2. **Configure RevenueCat:**
   - Create account at [RevenueCat](https://www.revenuecat.com/)
   - Set up products and entitlements
   - Configure iOS/Android apps with credentials

3. **Update `src/services/revenuecat.ts`:**
   - Implement the TODO sections
   - Initialize RevenueCat with your API key
   - Handle purchase flow
   - Sync entitlements with Firestore

4. **Native App Setup:**
   - Configure App Store Connect / Google Play Console
   - Set up in-app purchase products
   - Add necessary capabilities to native projects

For now, use the `markUserPremium(userId)` function to manually set premium status in Firestore for testing.

## Project Structure

```
lock-in-beat/
├── App.tsx                          # Main app entry with navigation
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript configuration
├── babel.config.js                  # Babel configuration
├── assets/
│   └── music/                       # Music files (add your MP3s here)
│       ├── .gitkeep
│       ├── focus1.mp3              # Add this file
│       └── focus2.mp3              # Add this file
└── src/
    ├── components/
    │   └── MusicList.tsx           # Music track selection component
    ├── contexts/
    │   └── AuthContext.tsx         # Authentication context provider
    ├── screens/
    │   ├── LoginScreen.tsx         # Login/signup screen
    │   ├── HomeScreen.tsx          # Main screen for session setup
    │   └── SessionScreen.tsx       # Active session with timer
    └── services/
        ├── firebase.ts             # Firebase initialization
        └── revenuecat.ts           # RevenueCat stub (IAP placeholder)
```

## Important Notes

⚠️ **Do not commit secrets**: Never commit your Firebase configuration with real API keys to a public repository. Use environment variables for production.

⚠️ **Music files not included**: You must add your own MP3 files to `assets/music/` directory. They are not included in the repository.

⚠️ **iOS Background Audio**: The app is configured for background audio on iOS via `UIBackgroundModes: ["audio"]` in `app.json`. Make sure this is working correctly when testing on real iOS devices.

## Troubleshooting

**Missing asset errors:**
- If you see "Unable to resolve asset" errors, run `npx expo start -c` to clear the cache
- Ensure `assets/images/` contains all placeholder files (icon.png, peaceful-sunset.jpg, etc.)
- The app includes placeholder images for icons and splash screens

**Music not playing:**
- Ensure MP3 files are in `assets/music/` with correct names
- Check that files are properly loaded in the project

**Firebase errors:**
- Verify Firebase configuration in `src/services/firebase.ts`
- Check Firebase console for authentication and Firestore setup
- Ensure Firestore security rules allow read/write for authenticated users

**App crashes on session start:**
- Check that music files exist
- Verify expo-av is properly installed
- Check device permissions for audio

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using React Native, Expo, and Firebase