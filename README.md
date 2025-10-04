# Hooli - OMI Voice Integration Backend
C2B Customer Service Agentic AI with Voice Processing

## Overview
Hooli is a C2B Customer Service Agentic AI system that integrates with OMI (Open Memory Interface) for advanced voice processing capabilities. This backend provides RESTful APIs for voice input processing, session management, and webhook handling.

## Features
- 🎤 **Voice Processing**: Audio file upload and processing with speech-to-text conversion
- 🤖 **OMI Integration**: Seamless integration with Open Memory Interface for AI processing
- 📡 **Webhook Support**: Real-time event handling for OMI and voice processing updates
- 🔒 **Security**: Rate limiting, CORS protection, and input validation
- 📊 **Health Monitoring**: Comprehensive health checks and service status monitoring
- ⚡ **Vercel Ready**: Optimized for serverless deployment on Vercel

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- OMI developer account (for production use)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **For testing without OMI credentials:**
   ```bash
   # Set mock mode in .env
   OMI_USE_MOCK=true
   
   # Start development server
   npm run dev
   ```

5. **For production with real OMI credentials:**
   - Follow the [OMI Setup Guide](docs/OMI_SETUP_GUIDE.md) to get credentials
   - Set `OMI_USE_MOCK=false` in .env
   - Configure all OMI environment variables
   - Start the server:
   ```bash
   npm start
   ```

### Testing
Run the test suite to verify everything works:
```bash
npm test                    # Run all tests
npm run test:health        # Test health endpoints
npm run test:integration   # Test API integration
```

## API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

### Voice Processing
- `POST /api/voice/process` - Process voice input (audio file or text)
- `GET /api/voice/session/:sessionId` - Get session information
- `POST /api/voice/session/:sessionId/end` - End a voice session
- `GET /api/voice/capabilities` - Get voice processing capabilities

### Webhooks
- `POST /api/webhooks/omi` - Handle OMI webhooks
- `POST /api/webhooks/voice-status` - Handle voice processing status updates
- `GET /api/webhooks/test` - Test webhook endpoint

## Configuration

### OMI Setup
For detailed instructions on setting up OMI credentials and integration, see:
📖 **[OMI Setup Guide](docs/OMI_SETUP_GUIDE.md)**

This guide covers:
- Getting OMI API credentials from the developer portal
- Configuring webhooks and app registration on OMI platform
- Setting up environment variables with real credentials
- Testing with live OMI integration
- Troubleshooting common issues
- Security best practices

### Environment Variables
Copy `.env.example` to `.env` and configure the following:

#### OMI Configuration (Required)
- `OMI_API_KEY` - Your OMI API key from developer portal
- `OMI_API_SECRET` - Your OMI API secret for request signing
- `OMI_APP_ID` - Your OMI application ID
- `OMI_WEBHOOK_SECRET` - Webhook verification secret
- `OMI_BASE_URL` - OMI API endpoint URL (default: https://api.omi.com/v1)
- `OMI_MODEL` - AI model to use (default: omi-standard)

#### Development Options
- `OMI_USE_MOCK` - Set to 'true' for mock testing without real OMI credentials
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - CORS allowed origins

See `.env.example` for complete configuration options.

## Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard

### Manual Deployment
1. Build the project: `npm run build`
2. Start production server: `npm start`

## Project Structure
```
api/
├── index.js              # Main server file
├── routes/               # API route handlers
│   ├── voice.js         # Voice processing routes
│   ├── webhooks.js      # Webhook routes
│   └── health.js        # Health check routes
├── middleware/          # Express middleware
│   ├── errorHandler.js  # Error handling
│   ├── rateLimiter.js   # Rate limiting
│   └── validation.js    # Input validation
└── services/            # Business logic services
    ├── voiceProcessor.js    # Voice processing logic
    ├── omiIntegration.js    # OMI API integration
    └── webhookProcessor.js  # Webhook event handling
```

## Voice Processing Flow
1. Client uploads audio file or sends text to `/api/voice/process`
2. Voice processor handles audio conversion and speech-to-text
3. Processed input is sent to OMI for AI processing
4. OMI response is returned to client
5. Session data is maintained for context

## User Journey
See `docs/user_journey.md` for the detailed user journey sequence diagram.
