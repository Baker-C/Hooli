# Frontend - Vapi Admin Panel

React frontend for managing Vapi AI voice assistant configurations and calls.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

- ⚙️ **Configuration Panel**: Manage phone number, voice settings, and first message
- 📝 **System Prompt Editor**: Customize AI assistant behavior
- 📞 **Call Panel**: Initiate calls with formatted phone number input
- 📋 **Call History**: Track initiated calls with timestamps

## Components

### ConfigPanel

Manages Vapi configuration including:

- Phone number ID
- First message greeting
- Voice selection
- System prompt

### CallPanel

Handles call initiation:

- Phone number input with formatting
- Call button with loading state
- Success/error messaging
- Usage instructions

### CallHistory

Displays call history:

- Phone numbers called
- Timestamps
- Call IDs
- Status badges

## Available Scripts

### `npm start`

Runs the app in development mode at `http://localhost:3000`

### `npm run build`

Builds the app for production to the `build` folder

### `npm test`

Launches the test runner

## Configuration

The app connects to the backend at `http://localhost:3001` by default. This is configured via the proxy setting in `package.json`.

For production, update the `API_URL` constant in `App.js`:

```javascript
const API_URL = "https://your-backend-domain.com/api";
```

## Styling

- Modern gradient design
- Fully responsive layout
- Smooth animations and transitions
- Card-based component layout
- Color-coded status badges

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
