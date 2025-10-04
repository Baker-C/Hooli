# OMI Integration Setup Guide

This guide will walk you through setting up OMI (Open Memory Interface) credentials and configuring the integration for the Hooli C2B Customer Service Agentic AI backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting OMI API Credentials](#getting-omi-api-credentials)
3. [OMI Platform Configuration](#omi-platform-configuration)
4. [Backend Project Configuration](#backend-project-configuration)
5. [Testing with Real Credentials](#testing-with-real-credentials)
6. [Troubleshooting](#troubleshooting)
7. [Security Best Practices](#security-best-practices)

## Prerequisites

Before starting, ensure you have:
- Access to the OMI platform/dashboard
- Administrative permissions for your OMI account
- The Hooli backend project set up locally
- Node.js and npm installed

## Getting OMI API Credentials

### Step 1: Access OMI Developer Portal

1. **Visit the OMI Developer Portal**
   - Go to `https://developer.omi.com` (or your OMI provider's developer portal)
   - Sign in with your OMI account credentials

2. **Navigate to API Management**
   - Look for "API Keys", "Credentials", or "Developer Tools" section
   - This is typically found in the main dashboard or settings menu

### Step 2: Create a New Application

1. **Register Your Application**
   ```
   Application Name: Hooli C2B Customer Service AI
   Description: Voice-enabled customer service automation
   Application Type: Server-side Application
   Callback URLs: https://your-domain.vercel.app/api/webhook
   ```

2. **Configure Application Settings**
   - **Environment**: Choose "Development" for testing, "Production" for live use
   - **Permissions**: Request the following scopes:
     - `voice:process` - Process voice inputs
     - `sessions:manage` - Create and manage conversation sessions
     - `webhooks:receive` - Receive webhook notifications
     - `ai:interact` - Interact with OMI's AI models

### Step 3: Generate API Credentials

After creating your application, you'll receive:

1. **API Key** (`OMI_API_KEY`)
   - Primary authentication token
   - Format: `omi_live_1234567890abcdef...` or similar

2. **API Secret** (`OMI_API_SECRET`)
   - Secret key for request signing (if required)
   - Keep this secure and never expose in client-side code

3. **Application ID** (`OMI_APP_ID`)
   - Unique identifier for your application
   - Used in API requests to identify your app

4. **Webhook Secret** (`OMI_WEBHOOK_SECRET`)
   - Used to verify webhook authenticity
   - Prevents unauthorized webhook calls

## OMI Platform Configuration

### Step 1: Configure Webhooks

1. **Set Webhook URL**
   ```
   Development: http://localhost:3000/api/webhook
   Production: https://your-app.vercel.app/api/webhook
   ```

2. **Select Webhook Events**
   Enable the following events:
   - `session.created` - When a new session starts
   - `session.updated` - When session context changes
   - `session.ended` - When a session completes
   - `voice.processed` - When voice input is processed
   - `ai.response` - When AI generates a response
   - `error.occurred` - When errors happen

3. **Configure Webhook Security**
   - Enable webhook signature verification
   - Set the webhook secret (you'll use this in your `.env`)

### Step 2: Set API Rate Limits

Configure appropriate rate limits for your use case:
```
Requests per minute: 1000
Concurrent sessions: 50
Audio file size limit: 10MB
Session timeout: 30 minutes
```

### Step 3: Configure AI Model Settings

1. **Select AI Model**
   - Choose the appropriate OMI AI model for your use case
   - Common options: `omi-standard`, `omi-advanced`, `omi-enterprise`

2. **Set Model Parameters**
   ```json
   {
     "temperature": 0.7,
     "max_tokens": 1000,
     "context_window": 4000,
     "voice_model": "standard"
   }
   ```

## Backend Project Configuration

### Step 1: Update Environment Variables

1. **Copy the environment template**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your OMI credentials**
   ```env
   # OMI Configuration
   OMI_API_KEY=omi_live_your_actual_api_key_here
   OMI_API_SECRET=your_actual_api_secret_here
   OMI_APP_ID=your_actual_app_id_here
   OMI_WEBHOOK_SECRET=your_actual_webhook_secret_here
   OMI_BASE_URL=https://api.omi.com/v1
   OMI_MODEL=omi-standard
   
   # Environment
   NODE_ENV=development
   PORT=3000
   
   # Security
   JWT_SECRET=your_jwt_secret_for_session_management
   CORS_ORIGIN=http://localhost:3000
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### Step 2: Verify Configuration

1. **Test API connectivity**
   ```bash
   npm run test:health
   ```

2. **Validate credentials**
   ```bash
   npm run test:integration
   ```

### Step 3: Switch from Mock to Real OMI

1. **Update `services/omiIntegration.js`**
   
   Find this line:
   ```javascript
   const USE_MOCK = process.env.OMI_USE_MOCK === 'true';
   ```
   
   Set `OMI_USE_MOCK=false` in your `.env` file:
   ```env
   OMI_USE_MOCK=false
   ```

2. **Restart your development server**
   ```bash
   npm start
   ```

## Testing with Real Credentials

### Step 1: Basic Connectivity Test

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "omi": "connected"
  }
}
```

### Step 2: Create a Test Session

```bash
curl -X POST http://localhost:3000/api/voice/session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "context": {
      "customerName": "John Doe",
      "issue": "Internet connectivity problem"
    }
  }'
```

### Step 3: Test Voice Processing

```bash
curl -X POST http://localhost:3000/api/voice/process \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your-session-id",
    "input": {
      "type": "text",
      "content": "Hello, I need help with my internet connection"
    }
  }'
```

### Step 4: Monitor Webhooks

Check your server logs for incoming webhook events:
```bash
npm start
# Watch for webhook logs in the console
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Errors

**Error**: `401 Unauthorized` or `Invalid API Key`

**Solutions**:
- Verify your `OMI_API_KEY` is correct and active
- Check if your API key has the required permissions
- Ensure you're using the correct environment (dev/prod)

```bash
# Test API key validity
curl -H "Authorization: Bearer $OMI_API_KEY" \
  https://api.omi.com/v1/auth/verify
```

#### 2. Webhook Verification Failures

**Error**: `Webhook signature verification failed`

**Solutions**:
- Verify `OMI_WEBHOOK_SECRET` matches your OMI dashboard setting
- Check webhook URL configuration in OMI dashboard
- Ensure webhook endpoint is accessible from OMI servers

#### 3. Rate Limiting Issues

**Error**: `429 Too Many Requests`

**Solutions**:
- Implement exponential backoff in your requests
- Check your rate limits in OMI dashboard
- Consider upgrading your OMI plan if needed

#### 4. Session Management Problems

**Error**: `Session not found` or `Session expired`

**Solutions**:
- Implement proper session cleanup
- Check session timeout settings
- Verify session ID format and storage

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
LOG_LEVEL=debug
```

This will provide detailed logs for troubleshooting.

## Security Best Practices

### 1. Credential Management

- **Never commit credentials to version control**
- Use environment variables for all sensitive data
- Rotate API keys regularly (recommended: every 90 days)
- Use different credentials for development and production

### 2. Webhook Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoints in production
- Implement rate limiting for webhook endpoints
- Log and monitor webhook activity

### 3. API Security

- Implement request signing for sensitive operations
- Use HTTPS for all API communications
- Validate all input data
- Implement proper error handling without exposing sensitive information

### 4. Environment Separation

```env
# Development
OMI_API_KEY=omi_dev_...
OMI_BASE_URL=https://api-dev.omi.com/v1

# Production
OMI_API_KEY=omi_live_...
OMI_BASE_URL=https://api.omi.com/v1
```

### 5. Monitoring and Logging

- Monitor API usage and costs
- Set up alerts for unusual activity
- Log all API interactions (without sensitive data)
- Implement health checks and uptime monitoring

## Next Steps

After completing this setup:

1. **Test thoroughly** with your specific use cases
2. **Monitor performance** and adjust rate limits as needed
3. **Set up production environment** with proper security measures
4. **Implement monitoring** and alerting for production use
5. **Review and update** security settings regularly

For additional support, refer to:
- [OMI Official Documentation](https://docs.omi.com)
- [API Reference](https://api-docs.omi.com)
- [Community Forum](https://community.omi.com)
- [Support Portal](https://support.omi.com)