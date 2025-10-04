# OMI Notification System Setup Guide

This guide explains how to configure and use the OMI notification system to send direct notifications back to OMI users.

## Overview

The OMI notification system allows your application to send direct text notifications to specific OMI users. When a user speaks to OMI, instead of just returning a JSON response, the system now sends a notification directly to the user's OMI device, which will be spoken back to them.

## Configuration

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# OMI Notification Configuration
OMI_APP_ID=your_app_id_here
OMI_APP_SECRET=your_app_secret_here
```

### 2. Getting Your OMI Credentials

1. **OMI App ID**: Your unique application identifier from OMI
2. **OMI App Secret**: Your API key/secret for authentication

Contact OMI support or check your OMI developer dashboard to obtain these credentials.

## How It Works

### Webhook Flow

1. **User speaks to OMI** → OMI converts speech to text
2. **OMI sends webhook** → POST request to `/api/webhooks/omi` with user text and ID
3. **Application processes** → Extracts user text and generates response
4. **Notification sent** → Direct notification sent to user's OMI device
5. **OMI speaks response** → User hears the response through OMI

### Request Format

OMI webhooks should include a user ID in one of these formats:
```json
{
  "text": "Hello there!",
  "uid": "user123",
  // OR
  "user_id": "user123",
  // OR
  "userId": "user123",
  // OR nested in data
  "data": {
    "text": "Hello there!",
    "uid": "user123"
  }
}
```

## API Endpoint Details

### Notification API
- **Method**: `POST`
- **URL**: `/v2/integrations/{app_id}/notification`
- **Base URL**: `api.omi.me`
- **Headers**:
  - `Authorization: Bearer <YOUR_APP_SECRET>`
  - `Content-Type: application/json`
  - `Content-Length: 0`
- **Query Parameters**:
  - `uid` (required): Target user's OMI ID
  - `message` (required): Notification text

## Current Implementation

### Default Response
The system currently responds with: **"I have heard you!"**

### Webhook Handler Features
- ✅ **User ID extraction** from multiple possible formats
- ✅ **Automatic notification sending** when user ID is available
- ✅ **Fallback to JSON response** if notification fails or no user ID
- ✅ **Enhanced logging** for debugging
- ✅ **Error handling** with graceful degradation

## Customizing Responses

### Static Response
Edit the `processUserText` function in `/api/routes/webhooks.js`:

```javascript
async function processUserText(text) {
  return "Your custom response here!";
}
```

### Dynamic Response
```javascript
async function processUserText(text) {
  if (text.toLowerCase().includes('hello')) {
    return "Hello there! How can I help you?";
  } else if (text.toLowerCase().includes('weather')) {
    return "I'd love to help with weather, but I need more capabilities!";
  } else {
    return "I have heard you!";
  }
}
```

### Advanced Processing
```javascript
async function processUserText(text) {
  // Add your AI/NLP processing here
  // Call external APIs, databases, etc.
  
  const response = await yourAIService.process(text);
  return response;
}
```

## Testing

### 1. Test with User ID
```bash
curl -X POST https://your-ngrok-url.ngrok-free.dev/api/webhooks/omi \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Testing notification",
    "uid": "test_user_123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notificationSent": true,
  "userId": "test_user_123",
  "response": "I have heard you!"
}
```

### 2. Test without User ID
```bash
curl -X POST https://your-ngrok-url.ngrok-free.dev/api/webhooks/omi \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Testing without user ID"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "I have heard you!",
  "text": "I have heard you!",
  "response": "I have heard you!",
  "reply": "I have heard you!",
  "content": "I have heard you!",
  "notificationSent": false,
  "reason": "No user ID provided"
}
```

## Monitoring and Logs

### Console Output
The system provides detailed logging:

```
🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 
🔔 OMI VOICE MESSAGE RECEIVED
🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 
📅 Timestamp: 2024-01-15T10:30:00.000Z
👤 User ID: user123
💬 User Said: Hello there!
📦 Full Request: { ... }
🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 🗣️ 

🤖 Bot Response: I have heard you!
📤 Attempting to send OMI notification...
🔔 Sending OMI notification to user: user123
📝 Message: "I have heard you!"
✅ OMI notification sent successfully
📊 Response: { success: true, ... }
✅ Processing complete
```

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
- **Problem**: `OMI_APP_ID environment variable is not set`
- **Solution**: Ensure environment variables are properly set in `.env`

#### 2. API Errors
- **Problem**: `OMI API Error (401): Unauthorized`
- **Solution**: Verify your `OMI_APP_SECRET` is correct

#### 3. User Not Found
- **Problem**: `OMI API Error (404): User not found`
- **Solution**: Verify the user ID exists and is valid

#### 4. Rate Limiting
- **Problem**: `OMI API Error (429): Too many requests`
- **Solution**: Implement delays between notifications

### Error Response Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 401 | Unauthorized | Check API credentials |
| 404 | User not found | Verify user ID |
| 429 | Too many requests | Implement rate limiting |
| 500 | Server error | Retry with backoff |

## Best Practices

### 1. Rate Limiting
- Implement reasonable delays between notifications
- Avoid sending duplicate notifications
- Group related notifications when possible

### 2. Content Guidelines
- Keep messages concise and clear
- Include relevant context
- Use appropriate urgency levels

### 3. Error Handling
- Always implement fallback responses
- Log errors for debugging
- Monitor notification delivery status

### 4. Security
- Store API credentials securely
- Validate user IDs before sending
- Implement request timeouts

## Next Steps

1. **Configure your OMI credentials** in the `.env` file
2. **Test the notification system** with the provided curl commands
3. **Customize the response logic** in the `processUserText` function
4. **Monitor the logs** to ensure notifications are being sent successfully
5. **Implement advanced features** like AI processing or database integration

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your OMI credentials are correct
3. Test with the provided curl commands
4. Review the OMI API documentation for any updates

The notification system provides a robust foundation for OMI integration with proper error handling and fallback mechanisms.