# Backend - Vapi Admin Panel

Express.js backend for managing Vapi AI voice assistant calls.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```env
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
PORT=3001
```

3. Run the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Environment Variables

- `VAPI_API_KEY` - Your Vapi API key (required)
- `VAPI_PHONE_NUMBER_ID` - Your Vapi phone number ID (optional, can be set via UI)
- `PORT` - Server port (default: 3001)

## API Endpoints

### GET /api/config

Get current configuration

**Response:**

```json
{
  "phoneNumber": "string",
  "assistant": {
    "model": {...},
    "voice": {...},
    "firstMessage": "string"
  }
}
```

### POST /api/config

Update configuration

**Request Body:**

```json
{
  "phoneNumber": "string",
  "assistant": {
    "firstMessage": "string",
    "voice": {
      "voiceId": "string"
    }
  }
}
```

### POST /api/config/prompt

Update system prompt

**Request Body:**

```json
{
  "prompt": "string"
}
```

### POST /api/call

Initiate a phone call

**Request Body:**

```json
{
  "phoneNumber": "+1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Call initiated successfully",
  "callId": "string",
  "data": {...}
}
```

### GET /api/call/:callId

Get call status

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "string",
    ...
  }
}
```

### GET /health

Health check endpoint

## Dependencies

- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `node-fetch` - HTTP client for Vapi API calls
