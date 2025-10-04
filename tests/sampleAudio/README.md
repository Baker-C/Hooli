# Sample Audio Files for Testing

These audio files are generated for testing the OMI voice integration endpoints.

## Files:

- **greeting.wav** (2s, 440Hz) - Simulates a short greeting
- **question.wav** (3s, 523Hz) - Simulates a customer question
- **support-request.wav** (4s, 330Hz) - Simulates a support request
- **noise-sample.wav** (1s, white noise) - Tests noise handling
- **long-sample.wav** (10s, 220Hz) - Tests longer audio processing
- **tiny-sample.wav** (0.1s, 880Hz) - Tests very short audio

## Usage:

Use these files with the test utilities:

```bash
# Test with specific audio file
node tests/runTests.js audio <sessionId> tests/sampleAudio/greeting.wav

# Or use the test utilities directly
const testUtils = new TestUtils();
await testUtils.testAudioProcessing(sessionId, './tests/sampleAudio/greeting.wav');
```

## Note:

These are synthetic audio files created for testing purposes only.
They contain simple tones and noise, not actual speech.
