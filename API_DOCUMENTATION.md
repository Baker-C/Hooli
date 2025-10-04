# Hooli Vapi API Documentation

## Base URL

```
http://localhost:3000/api
```

---

## Authentication

The API requires a Vapi API key to be configured on the backend. No authentication is required for API calls to this backend service itself.

---

## Endpoints

### 1. Initiate a Phone Call

Make an AI-powered phone call using Vapi.

**Endpoint:** `POST /api/call`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "phoneNumber": "+15105079026",
  "systemPrompt": "You are a helpful assistant..." // Optional
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phoneNumber | string | Yes | The phone number to call (E.164 format, including country code) |
| systemPrompt | string | No | Custom system prompt for this specific call (overrides default) |
| prompt | string | No | Alias for systemPrompt (either can be used) |

**Success Response:**

**Code:** `200 OK`

```json
{
  "success": true,
  "message": "Call initiated successfully",
  "callId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "queued",
    "phoneNumberId": "6a615c7a-c73e-4158-bf64-ffc02dd57192",
    "customer": {
      "number": "+15105079026"
    },
    "createdAt": "2025-10-04T12:00:00.000Z"
  }
}
```

**Error Responses:**

**Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Phone number is required"
}
```

**Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Vapi API key not configured"
}
```

**Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to initiate call"
}
```

---

### 2. Get Configuration

Retrieve the current Vapi configuration.

**Endpoint:** `GET /api/config`

**Request Headers:** None required

**Success Response:**

**Code:** `200 OK`

```json
{
  "phoneNumber": "6a615c7a-c73e-4158-bf64-ffc02dd57192",
  "assistantId": "",
  "assistant": {
    "model": {
      "provider": "openai",
      "model": "gpt-4",
      "messages": [
        {
          "role": "system",
          "content": "Your AI assistant system prompt..."
        }
      ]
    },
    "voice": {
      "provider": "11labs",
      "voiceId": "rachel"
    },
    "firstMessage": "Thank you for calling Hooli. This is Charles, your scheduling assistant. How may I help you today?",
    "transcriber": {
      "provider": "deepgram",
      "model": "nova-2",
      "language": "en-US"
    }
  }
}
```

---

### 3. Update Configuration

Update the Vapi configuration settings.

**Endpoint:** `POST /api/config`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "phoneNumber": "6a615c7a-c73e-4158-bf64-ffc02dd57192",
  "assistantId": "",
  "assistant": {
    "firstMessage": "Hello! How can I help you?",
    "voice": {
      "provider": "11labs",
      "voiceId": "josh"
    }
  }
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phoneNumber | string | No | Vapi phone number ID |
| assistantId | string | No | Vapi assistant ID (leave empty to use inline config) |
| assistant | object | No | Inline assistant configuration |

**Success Response:**

**Code:** `200 OK`

```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "config": {
    "phoneNumber": "6a615c7a-c73e-4158-bf64-ffc02dd57192",
    "assistantId": "",
    "assistant": { ... }
  }
}
```

---

### 4. Update System Prompt

Update only the AI assistant's system prompt.

**Endpoint:** `POST /api/config/prompt`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "prompt": "You are a helpful customer service assistant..."
}
```

**Success Response:**

**Code:** `200 OK`

```json
{
  "success": true,
  "message": "System prompt updated successfully",
  "prompt": "You are a helpful customer service assistant..."
}
```

**Error Response:**

**Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Prompt is required"
}
```

---

### 5. Get Call Status

Retrieve the status of a specific call.

**Endpoint:** `GET /api/call/:callId`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| callId | string | Yes | The unique call ID returned from initiate call |

**Success Response:**

**Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "in-progress",
    "duration": 45,
    "transcript": "...",
    "endedReason": null
  }
}
```

**Error Response:**

**Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to get call status"
}
```

---

### 6. Summarize Transcript

Summarize a call transcript using OpenAI.

**Endpoint:** `POST /api/summarize`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "transcript": "Full call transcript text here...",
  "customInstructions": "Focus on action items" // Optional
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| transcript | string | Yes | The full transcript text to summarize |
| customInstructions | string | No | Custom instructions for the summary (e.g., "Focus on key decisions") |

**Success Response:**

**Code:** `200 OK`

```json
{
  "success": true,
  "summary": "The call discussed...",
  "usage": {
    "promptTokens": 250,
    "completionTokens": 100,
    "totalTokens": 350
  }
}
```

**Error Responses:**

**Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Transcript is required"
}
```

**Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "OpenAI API key not configured"
}
```

**Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to summarize transcript"
}
```

---

### 7. Get Call Summary by ID

Fetch and summarize a call's transcript in one request.

**Endpoint:** `GET /api/calls/:callId/summary`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| callId | string | Yes | The Vapi call ID to summarize |

**Success Response:**

**Code:** `200 OK`

```json
{
  "success": true,
  "summary": "Customer inquired about order #12345. Agent confirmed delivery tomorrow. Issue resolved.",
  "transcript": "Full transcript text...",
  "call": { ... },
  "usage": {
    "promptTokens": 120,
    "completionTokens": 25,
    "totalTokens": 145
  }
}
```

**Error Responses:**

**Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Vapi API key not configured"
}
```

**Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "OpenAI API key not configured"
}
```

**Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to generate summary"
}
```

---

### 8. Get Call Logs

Fetch all calls from Vapi.

**Endpoint:** `GET /api/calls`

**Success Response:**

**Code:** `200 OK`

```json
{
  "success": true,
  "calls": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "ended",
      "customer": {
        "number": "+15105079026"
      },
      "createdAt": "2025-10-04T12:00:00.000Z",
      "endedAt": "2025-10-04T12:05:30.000Z"
    }
  ]
}
```

---

### 9. Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Success Response:**

**Code:** `200 OK`

```json
{
  "status": "ok"
}
```

---

## Code Examples

### cURL

**Initiate a Call:**

```bash
curl -X POST http://localhost:3000/api/call \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+15105079026"
  }'
```

**Initiate a Call with Custom Prompt:**

```bash
curl -X POST http://localhost:3000/api/call \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+15105079026",
    "systemPrompt": "You are a scheduling assistant for Acme Corp. Help users book appointments."
  }'
```

**Get Call Status:**

```bash
curl http://localhost:3000/api/call/550e8400-e29b-41d4-a716-446655440000
```

**Update Configuration:**

```bash
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": {
      "firstMessage": "Hello! How can I help you today?",
      "voice": {
        "voiceId": "bella"
      }
    }
  }'
```

**Summarize Transcript:**

```bash
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Customer called about billing issue. Resolved by adjusting payment plan. Customer satisfied.",
    "customInstructions": "Focus on the resolution and customer sentiment"
  }'
```

**Get Call Summary (by Call ID):**

```bash
curl http://localhost:3000/api/calls/550e8400-e29b-41d4-a716-446655440000/summary
```

**Get All Call Logs:**

```bash
curl http://localhost:3000/api/calls
```

---

### JavaScript (Node.js/Browser)

**Initiate a Call:**

```javascript
async function initiateCall(phoneNumber, customPrompt = null) {
  const payload = { phoneNumber };

  // Add custom prompt if provided
  if (customPrompt) {
    payload.systemPrompt = customPrompt;
  }

  const response = await fetch("http://localhost:3000/api/call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.success) {
    console.log("Call initiated:", data.callId);
    return data;
  } else {
    console.error("Error:", data.message);
    throw new Error(data.message);
  }
}

// Usage - Default prompt
initiateCall("+15105079026")
  .then((result) => console.log("Success:", result))
  .catch((error) => console.error("Error:", error));

// Usage - Custom prompt
initiateCall(
  "+15105079026",
  "You are a helpful scheduling assistant. Help users book appointments."
)
  .then((result) => console.log("Success:", result))
  .catch((error) => console.error("Error:", error));
```

**Get Call Status:**

```javascript
async function getCallStatus(callId) {
  const response = await fetch(`http://localhost:3000/api/call/${callId}`);
  const data = await response.json();
  return data;
}

// Usage
getCallStatus("550e8400-e29b-41d4-a716-446655440000")
  .then((status) => console.log("Call status:", status))
  .catch((error) => console.error("Error:", error));
```

---

### Python

**Initiate a Call:**

```python
import requests
import json

def initiate_call(phone_number, system_prompt=None):
    url = 'http://localhost:3000/api/call'
    headers = {'Content-Type': 'application/json'}
    data = {'phoneNumber': phone_number}

    # Add custom prompt if provided
    if system_prompt:
        data['systemPrompt'] = system_prompt

    response = requests.post(url, headers=headers, json=data)
    result = response.json()

    if result.get('success'):
        print(f"Call initiated: {result.get('callId')}")
        return result
    else:
        print(f"Error: {result.get('message')}")
        raise Exception(result.get('message'))

# Usage - Default prompt
try:
    result = initiate_call('+15105079026')
    print('Success:', result)
except Exception as e:
    print('Error:', e)

# Usage - Custom prompt
try:
    custom_prompt = "You are a friendly customer support agent for TechCo. Help users with their technical issues."
    result = initiate_call('+15105079026', custom_prompt)
    print('Success:', result)
except Exception as e:
    print('Error:', e)
```

**Get Call Status:**

```python
import requests

def get_call_status(call_id):
    url = f'http://localhost:3000/api/call/{call_id}'
    response = requests.get(url)
    return response.json()

# Usage
status = get_call_status('550e8400-e29b-41d4-a716-446655440000')
print('Call status:', status)
```

**Summarize Transcript:**

```python
import requests

def summarize_transcript(transcript, custom_instructions=None):
    url = 'http://localhost:3000/api/summarize'
    headers = {'Content-Type': 'application/json'}
    data = {'transcript': transcript}

    if custom_instructions:
        data['customInstructions'] = custom_instructions

    response = requests.post(url, headers=headers, json=data)
    return response.json()

# Usage
transcript_text = """
Customer: Hi, I need help with my order.
Agent: I'd be happy to help. What's your order number?
Customer: It's #12345.
Agent: I see your order. It's scheduled for delivery tomorrow.
Customer: Perfect, thank you!
"""

result = summarize_transcript(transcript_text, "Focus on the main issue and resolution")
print('Summary:', result.get('summary'))
print('Tokens used:', result.get('usage'))
```

---

## Custom Prompts Per Call

You can override the default system prompt for any individual call by including a `systemPrompt` (or `prompt`) field in the request body.

### Use Cases

- **Different departments**: Sales vs Support calls with different prompts
- **A/B Testing**: Test different prompt variations
- **Dynamic behavior**: Adjust assistant personality based on customer segment
- **Temporary overrides**: One-time special instructions without changing default config

### Example: Department-Specific Prompts

```javascript
// Sales call
initiateCall(
  "+15105079026",
  "You are a sales representative for Hooli. Be enthusiastic and focus on product benefits."
);

// Support call
initiateCall(
  "+15105079026",
  "You are a technical support specialist. Be patient and help troubleshoot issues step by step."
);

// Scheduling call (uses default prompt)
initiateCall("+15105079026");
```

### Behavior

- **With `systemPrompt`**: Uses the provided prompt for this call only
- **Without `systemPrompt`**: Uses the default prompt from backend configuration
- **With `assistantId`**: Custom prompt is **ignored**, Vapi assistant settings are used instead

⚠️ **Note**: The custom prompt only works when using inline assistant configuration (no `assistantId` set).

---

## Phone Number Format

Phone numbers must be in **E.164 format**:

- Start with `+` followed by country code
- No spaces, dashes, or parentheses
- Maximum 15 digits

**Valid Examples:**

- `+15105079026` (US)
- `+442071234567` (UK)
- `+919876543210` (India)

**Invalid Examples:**

- `5105079026` (missing country code)
- `+1 (510) 507-9026` (contains formatting)
- `+1-510-507-9026` (contains dashes)

---

## Call Flow

1. **Initiate Call** → Returns `callId`
2. **Call Queued** → Vapi processes the request
3. **Call Ringing** → Phone is ringing
4. **Call Connected** → User answers
5. **AI Conversation** → Assistant interacts with user
6. **Call Ended** → Call completes

You can check the call status at any time using the `callId`.

---

## Assistant Configuration

The API supports two modes:

### Mode 1: Use Assistant ID (Recommended for Production)

Configure your assistant in the Vapi dashboard and provide the `assistantId`:

```json
{
  "assistantId": "46e48af1-38dd-4321-91eb-85d665f347f8"
}
```

### Mode 2: Inline Configuration (Better for Testing)

Leave `assistantId` empty and provide full configuration:

```json
{
  "assistantId": "",
  "assistant": {
    "model": {
      "provider": "openai",
      "model": "gpt-4",
      "messages": [
        {
          "role": "system",
          "content": "Your custom prompt here..."
        }
      ]
    },
    "voice": {
      "provider": "11labs",
      "voiceId": "rachel"
    },
    "firstMessage": "Hello! How can I help you?"
  }
}
```

---

## Available Voice Options

| Voice ID | Gender | Description             |
| -------- | ------ | ----------------------- |
| rachel   | Female | Professional, clear     |
| josh     | Male   | Friendly, warm          |
| bella    | Female | Energetic, young        |
| antoni   | Male   | Deep, authoritative     |
| elli     | Female | Calm, soothing          |
| adam     | Male   | Natural, conversational |

---

## Error Codes

| HTTP Code | Description                                      |
| --------- | ------------------------------------------------ |
| 200       | Success                                          |
| 400       | Bad Request - Missing or invalid parameters      |
| 500       | Internal Server Error - Server or Vapi API error |

---

## Rate Limits

Rate limits are determined by your Vapi account plan. Check your Vapi dashboard for details.

---

## Support

For issues or questions:

- Check the main [README.md](./README.md)
- Review [backend/README.md](./backend/README.md)
- Contact the development team

---

## Environment Setup

Before using the API, ensure the backend is configured:

1. Create `backend/.env`:

```env
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=6a615c7a-c73e-4158-bf64-ffc02dd57192
VAPI_ASSISTANT_ID=
PORT=3000
```

2. Start the backend:

```bash
cd backend
npm install
npm start
```

3. Verify it's running:

```bash
curl http://localhost:3000/health
```

---

## Production Deployment

When deploying to production:

1. Update `API_URL` in frontend code to your production backend URL
2. Use HTTPS for all API calls
3. Set up proper CORS origins in `backend/server.js`
4. Use environment variables for sensitive data
5. Consider adding API authentication
6. Set up monitoring and logging
7. Implement rate limiting

---

_Last Updated: October 4, 2025_
