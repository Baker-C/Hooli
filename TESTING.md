# OMI Voice Integration Backend - Testing Guide

This guide provides comprehensive instructions for testing the OMI voice integration backend, including local development setup, API testing, and integration testing.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Testing Environment Setup](#testing-environment-setup)
3. [Running Tests](#running-tests)
4. [API Testing with Collections](#api-testing-with-collections)
5. [Manual Testing](#manual-testing)
6. [Mock vs Real OMI Testing](#mock-vs-real-omi-testing)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Copy the environment template:
```bash
cp .env.example .env
```

For testing with mock OMI service (recommended for initial testing):
```bash
# In .env file
NODE_ENV=development
USE_MOCK_OMI=true
PORT=3000
```

### 3. Start the Server

```bash
npm run dev
```

### 4. Run Basic Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:health
npm run test:integration
npm run test:performance
```

## Testing Environment Setup

### Local Development with Mock OMI

The backend includes a mock OMI service that simulates the real OMI API responses. This allows you to test all functionality without requiring actual OMI credentials.

**Environment Variables for Mock Testing:**
```env
NODE_ENV=development
USE_MOCK_OMI=true
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### Testing with Real OMI API

To test with the actual OMI API, you'll need valid credentials:

```env
NODE_ENV=development
USE_MOCK_OMI=false
OMI_API_KEY=your_actual_omi_api_key
OMI_BASE_URL=https://api.omi.com
PORT=3000
```

## Running Tests

### Automated Test Scripts

The project includes several test scripts:

```bash
# Run all tests with mock OMI
npm test

# Run health check tests
npm run test:health

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance

# Run tests against specific URL
npm run test:custom -- --url=http://localhost:3000
```

### Test Script Details

#### 1. Health Check Tests
```bash
npm run test:health
```
- Tests `/api/health` endpoint
- Verifies server is running
- Checks response format and timing

#### 2. Integration Tests
```bash
npm run test:integration
```
- Tests complete voice processing workflow
- Session creation → Text processing → Audio processing
- Webhook event handling
- Error scenarios

#### 3. Performance Tests
```bash
npm run test:performance
```
- Measures response times for all endpoints
- Tests concurrent request handling
- Memory and CPU usage monitoring

### Manual Test Execution

You can also run tests manually using the test utilities:

```javascript
// tests/runTests.js
const { runAllTests } = require('./testUtils');

// Run with custom configuration
runAllTests({
  baseUrl: 'http://localhost:3000',
  useMock: true,
  verbose: true
});
```

## API Testing with Collections

### Thunder Client Collection

Import `tests/thunder-client.json` into Thunder Client (VS Code extension):

1. Install Thunder Client extension in VS Code
2. Open Thunder Client panel
3. Click "Import" → Select `tests/thunder-client.json`
4. Set environment to "Local Development"

### Postman Collection

Import `tests/api-collection.json` into Postman:

1. Open Postman
2. Click "Import" → Select `tests/api-collection.json`
3. Set environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `sessionId`: (will be set automatically)

### Collection Test Flow

1. **Health Check** - Verify server is running
2. **Create Session** - Creates a new voice session (saves sessionId)
3. **Process Text** - Send text input for processing
4. **Process Audio** - Upload audio file for transcription
5. **Get Session Info** - Retrieve session details
6. **Webhook Tests** - Test webhook endpoints
7. **Error Scenarios** - Test error handling

## Manual Testing

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "omi": "connected"
  }
}
```

### 2. Create Session

```bash
curl -X POST http://localhost:3000/api/voice/session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "context": {
      "userType": "premium",
      "testMode": true
    }
  }'
```

### 3. Process Text

```bash
curl -X POST http://localhost:3000/api/voice/process-text \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "text": "Hello, I need help with my account",
    "context": {
      "testMode": true
    }
  }'
```

### 4. Process Audio

```bash
curl -X POST http://localhost:3000/api/voice/process-audio \
  -F "sessionId=YOUR_SESSION_ID" \
  -F "audio=@tests/sampleAudio/greeting.wav" \
  -F "context={\"testMode\": true}"
```

### 5. Test Webhooks

```bash
curl -X POST http://localhost:3000/api/webhooks/omi \
  -H "Content-Type: application/json" \
  -d '{
    "event": "session.created",
    "data": {
      "sessionId": "YOUR_SESSION_ID",
      "userId": "test_user_123",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  }'
```

## Mock vs Real OMI Testing

### Mock OMI Service Features

The mock service simulates:
- Session creation and management
- Text processing with AI-like responses
- Audio transcription (returns mock transcriptions)
- Webhook event handling
- Error scenarios and edge cases

### Mock Response Examples

**Text Processing:**
```json
{
  "success": true,
  "response": "I understand you need help with your account. Let me assist you with that.",
  "sessionId": "mock_session_123",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Audio Processing:**
```json
{
  "success": true,
  "transcription": "Hello, I need help with my account",
  "response": "I've received your audio message. How can I help you today?",
  "sessionId": "mock_session_123",
  "confidence": 0.95
}
```

### Switching to Real OMI

To test with real OMI API:

1. Set environment variables:
   ```env
   USE_MOCK_OMI=false
   OMI_API_KEY=your_real_api_key
   OMI_BASE_URL=https://api.omi.com
   ```

2. Restart the server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Sample Audio Files

The project includes generated sample audio files for testing:

- `tests/sampleAudio/greeting.wav` - Short greeting message
- `tests/sampleAudio/question.wav` - Question audio
- `tests/sampleAudio/support-request.wav` - Support request
- `tests/sampleAudio/noise-sample.wav` - Background noise test
- `tests/sampleAudio/long-sample.wav` - Long audio (10 seconds)
- `tests/sampleAudio/tiny-sample.wav` - Very short audio (0.1 seconds)

### Generating New Sample Audio

```bash
cd tests/sampleAudio
node generateSamples.js
```

## Test Scenarios

The project includes comprehensive test scenarios in `tests/testScenarios.json`:

### Text Input Scenarios
- Greetings and introductions
- Support requests
- Technical questions
- Billing inquiries
- Account management

### Audio Scenarios
- Clear speech samples
- Background noise handling
- Different audio qualities
- Various durations

### Error Scenarios
- Invalid session IDs
- Empty inputs
- Malformed requests
- Network timeouts
- Rate limiting

### Performance Scenarios
- Concurrent requests
- Large file uploads
- Extended sessions
- Memory usage tests

## Troubleshooting

### Common Issues

#### 1. Server Won't Start
```bash
# Check if port is in use
netstat -an | findstr :3000

# Kill process using port
taskkill /F /PID <process_id>
```

#### 2. Tests Failing
```bash
# Check server logs
npm run dev

# Run tests with verbose output
npm test -- --verbose

# Test specific endpoint
curl -v http://localhost:3000/api/health
```

#### 3. Audio Upload Issues
- Ensure audio files exist in `tests/sampleAudio/`
- Check file permissions
- Verify file formats (WAV supported)
- Check file size limits (10MB max)

#### 4. Mock OMI Not Working
- Verify `USE_MOCK_OMI=true` in `.env`
- Check `NODE_ENV=development`
- Restart server after environment changes

### Debug Mode

Enable debug logging:
```env
DEBUG=omi:*
LOG_LEVEL=debug
```

### Performance Monitoring

Monitor performance during tests:
```bash
# Run with performance monitoring
npm run test:performance

# Check memory usage
node --inspect tests/runTests.js
```

## Advanced Testing

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Run load tests
artillery run tests/load-test.yml
```

### Integration with CI/CD

Add to your CI pipeline:
```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: |
    npm install
    npm test
    npm run test:integration
```

### Custom Test Scenarios

Create custom test scenarios by modifying `tests/testScenarios.json`:

```json
{
  "customScenario": {
    "text": "Your custom test input",
    "expectedKeywords": ["keyword1", "keyword2"],
    "context": {
      "testMode": true,
      "customFlag": true
    }
  }
}
```

## Support

For additional help:
1. Check server logs for detailed error messages
2. Review the API documentation in `README.md`
3. Examine test output for specific failure details
4. Use debug mode for verbose logging

## Next Steps

After successful testing:
1. Deploy to Vercel using `npm run deploy`
2. Update environment variables for production
3. Set up monitoring and logging
4. Configure real OMI API credentials
5. Implement additional security measures