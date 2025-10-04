# OMI Response Guide

## How to Send Responses Back to OMI

This guide explains how your webhook can send responses back to OMI that it will speak to the user.

## Current Setup

Your OMI webhook is configured at:
```
https://impavid-cris-doziest.ngrok-free.dev/api/webhooks/omi
```

## Response Format

When OMI sends a message to your webhook, your application should respond with a JSON object containing the text you want OMI to speak back to the user.

### Basic Response Structure

```json
{
  "success": true,
  "message": "Your response text here",
  "text": "Your response text here",
  "response": "Your response text here",
  "reply": "Your response text here",
  "content": "Your response text here"
}
```

### Why Multiple Fields?

Different OMI configurations may look for different field names. By including multiple fields with the same content, we ensure compatibility across different OMI setups:

- `message` - Common field for response messages
- `text` - Standard field for text content
- `response` - Direct response field
- `reply` - Alternative reply field
- `content` - General content field

## Current Default Response

The webhook is currently set to respond with: **"I have heard you!"**

## How to Customize Responses

### 1. Simple Static Response

To change the default response, edit the `processUserText` function in `/api/routes/webhooks.js`:

```javascript
async function processUserText(text) {
  return "Your custom response here!";
}
```

### 2. Dynamic Responses Based on Input

You can create conditional responses based on what the user says:

```javascript
async function processUserText(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('hello')) {
    return "Hello! Nice to meet you!";
  } else if (lowerText.includes('weather')) {
    return "I'd love to help with weather, but I don't have access to weather data right now.";
  } else if (lowerText.includes('time')) {
    return `The current time is ${new Date().toLocaleTimeString()}.`;
  } else {
    return "I have heard you!";
  }
}
```

### 3. Advanced Processing

For more complex responses, you can:

- Call external APIs
- Process the text with AI/LLM services
- Query databases
- Perform calculations

```javascript
async function processUserText(text) {
  try {
    // Example: Call an external API
    const response = await fetch('https://api.example.com/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });
    
    const result = await response.json();
    return result.reply || "I processed your request!";
  } catch (error) {
    return "Sorry, I encountered an error processing your request.";
  }
}
```

## Testing Your Responses

### 1. Using curl/PowerShell

Test your webhook directly:

```powershell
Invoke-WebRequest -Uri "https://impavid-cris-doziest.ngrok-free.dev/api/webhooks/omi" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"text": "Hello there"}'
```

### 2. Expected Response

You should receive a JSON response like:

```json
{
  "success": true,
  "message": "I have heard you!",
  "text": "I have heard you!",
  "response": "I have heard you!",
  "reply": "I have heard you!",
  "content": "I have heard you!"
}
```

### 3. Monitor Server Logs

Watch the server logs in terminal 3 to see detailed information about incoming requests and responses:

```
🔔 OMI VOICE MESSAGE RECEIVED
📅 Timestamp: 2025-10-04T22:15:58.989Z
💬 User Said: Hello there
🤖 Bot Response: I have heard you!
✅ Processing complete
```

## OMI Configuration

### 1. Webhook URL Setup

In your OMI device/app settings, configure:
- **Webhook URL**: `https://impavid-cris-doziest.ngrok-free.dev/api/webhooks/omi`
- **Method**: POST
- **Content-Type**: application/json

### 2. Expected Flow

1. **You speak** → "Hello there"
2. **OMI converts** → Speech to text
3. **OMI sends** → `{"text": "Hello there"}` to your webhook
4. **Your app processes** → Returns response JSON
5. **OMI receives** → Response with text to speak
6. **OMI speaks** → "I have heard you!" (or your custom response)

## Troubleshooting

### Common Issues

1. **OMI not speaking responses**
   - Check that your response includes the `text` or `message` field
   - Ensure the response is valid JSON
   - Verify the webhook URL is correct

2. **Server not receiving requests**
   - Ensure ngrok tunnel is running (`ngrok http 3000`)
   - Check that your server is running on port 3000
   - Verify the webhook URL in OMI settings

3. **Response format errors**
   - Always return a JSON object
   - Include the `success: true` field
   - Ensure text content is a string

### Monitoring Tools

- **ngrok Web Interface**: http://localhost:4040 (view all webhook traffic)
- **Server Logs**: Terminal 3 (detailed request/response logging)
- **Test Endpoint**: `https://impavid-cris-doziest.ngrok-free.dev/api/webhooks/test`

## Next Steps

1. **Customize your response** by editing the `processUserText` function
2. **Test thoroughly** using the PowerShell command above
3. **Configure OMI** with your webhook URL
4. **Monitor logs** to ensure everything is working correctly

## Important Notes

- The ngrok URL will change each time you restart ngrok
- Keep your server running on port 3000 for the webhook to work
- OMI expects a quick response (usually within a few seconds)
- Always return valid JSON to avoid errors

---

**Happy coding! Your OMI integration is ready to respond to voice messages!** 🎤✨