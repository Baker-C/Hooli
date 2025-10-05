# Hooli Mobile (Expo)

Run the admin panel on iOS/Android via Expo Go.

## Prereqs
- Node 18+
- Expo CLI (optional) – `npx expo start` works without a global install
- Backend running locally on http://localhost:3000

## Setup
1. Install deps (already done by scaffolding):
   ```bash
   cd mobile
   npm install
   ```
2. Configure backend API URL if not default:
   - Option A: Env var in `mobile/.env`:
     ```ini
     EXPO_PUBLIC_API_URL=http://localhost:3000/api
     ```
   - Option B: Start with default (`http://localhost:3000/api`). You can later add a small settings UI to save a custom base URL in storage if you need to point to a deployed API.

## Run
```bash
npm run ios     # open iOS simulator (macOS)
npm run android # Android emulator
npm run web     # Web preview
npm start       # QR for Expo Go on device
```

When using a physical device, ensure the device can reach your dev machine. In the Expo Dev Tools, switch to "Tunnel" if LAN fails.

## Screens
- Home: status and quick links
- Config: read/update `/api/config` and `/api/config/prompt`
- Call: trigger `/api/call`
- History: local session history (placeholder)
- Summarizer: calls `/api/summarize`

## Notes
- API base defaults to `http://localhost:3000/api`. Override via `EXPO_PUBLIC_API_URL`.
- CORS: backend allows no-origin requests (mobile) and common localhost origins.
