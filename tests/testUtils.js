/**
 * Test Utilities for OMI Voice Integration
 * Provides helper functions for testing voice endpoints
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class TestUtils {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000
    });
  }

  /**
   * Test health endpoint
   */
  async testHealth() {
    try {
      const response = await this.client.get('/api/health');
      console.log('✅ Health check passed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    }
  }

  /**
   * Create a test session
   */
  async createTestSession(userId = 'test_user_123') {
    try {
      const response = await this.client.post('/api/voice/session', {
        userId,
        context: {
          testMode: true,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log('✅ Session created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Session creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Test text processing
   */
  async testTextProcessing(sessionId, text = 'Hello, I need help with my account') {
    try {
      const response = await this.client.post('/api/voice/process', {
        sessionId,
        text
      });
      
      console.log('✅ Text processing successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Text processing failed:', error.message);
      throw error;
    }
  }

  /**
   * Test audio processing with mock audio file
   */
  async testAudioProcessing(sessionId, audioFilePath = null) {
    try {
      let audioBuffer;
      
      if (audioFilePath && fs.existsSync(audioFilePath)) {
        audioBuffer = fs.readFileSync(audioFilePath);
      } else {
        // Create mock audio buffer for testing
        audioBuffer = this.createMockAudioBuffer();
      }

      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('audio', audioBuffer, {
        filename: 'test-audio.wav',
        contentType: 'audio/wav'
      });

      const response = await this.client.post('/api/voice/process', formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      
      console.log('✅ Audio processing successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Audio processing failed:', error.message);
      throw error;
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(eventType = 'session.created', data = {}) {
    try {
      const payload = {
        event: eventType,
        data: {
          sessionId: 'test_session_123',
          timestamp: new Date().toISOString(),
          ...data
        }
      };

      const response = await this.client.post('/api/webhooks/omi', payload);
      
      console.log('✅ Webhook test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Webhook test failed:', error.message);
      throw error;
    }
  }

  /**
   * Run complete test suite
   */
  async runFullTestSuite() {
    console.log('🚀 Starting OMI Voice Integration Test Suite...\n');
    
    try {
      // 1. Health check
      console.log('1. Testing health endpoint...');
      await this.testHealth();
      console.log('');

      // 2. Create session
      console.log('2. Creating test session...');
      const sessionResult = await this.createTestSession();
      const sessionId = sessionResult.sessionId;
      console.log('');

      // 3. Test text processing
      console.log('3. Testing text processing...');
      await this.testTextProcessing(sessionId, 'Hello, can you help me with customer support?');
      console.log('');

      // 4. Test audio processing
      console.log('4. Testing audio processing...');
      await this.testAudioProcessing(sessionId);
      console.log('');

      // 5. Test webhook
      console.log('5. Testing webhook...');
      await this.testWebhook('session.message', { sessionId });
      console.log('');

      console.log('🎉 All tests passed successfully!');
      return { success: true, message: 'All tests completed successfully' };
      
    } catch (error) {
      console.error('💥 Test suite failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create mock audio buffer for testing
   */
  createMockAudioBuffer() {
    // Create a simple mock audio buffer (sine wave)
    const sampleRate = 44100;
    const duration = 2; // 2 seconds
    const samples = sampleRate * duration;
    const buffer = Buffer.alloc(samples * 2); // 16-bit samples
    
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.5; // 440Hz tone
      const intSample = Math.round(sample * 32767);
      buffer.writeInt16LE(intSample, i * 2);
    }
    
    return buffer;
  }

  /**
   * Load test scenarios from file
   */
  loadTestScenarios(scenarioFile = 'testScenarios.json') {
    try {
      const scenarioPath = path.join(__dirname, scenarioFile);
      if (fs.existsSync(scenarioPath)) {
        return JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
      }
      return this.getDefaultScenarios();
    } catch (error) {
      console.warn('Could not load test scenarios, using defaults');
      return this.getDefaultScenarios();
    }
  }

  /**
   * Get default test scenarios
   */
  getDefaultScenarios() {
    return {
      textInputs: [
        'Hello, I need help with my account',
        'Can you help me resolve a billing issue?',
        'I want to cancel my subscription',
        'How do I reset my password?',
        'I need to speak with customer support'
      ],
      contexts: [
        { userType: 'premium', priority: 'high' },
        { userType: 'basic', priority: 'normal' },
        { userType: 'trial', priority: 'low' }
      ]
    };
  }

  /**
   * Performance test - measure response times
   */
  async performanceTest(iterations = 10) {
    console.log(`🏃 Running performance test with ${iterations} iterations...\n`);
    
    const results = {
      sessionCreation: [],
      textProcessing: [],
      audioProcessing: []
    };

    for (let i = 0; i < iterations; i++) {
      console.log(`Iteration ${i + 1}/${iterations}`);
      
      // Test session creation
      const sessionStart = Date.now();
      const session = await this.createTestSession(`perf_test_${i}`);
      results.sessionCreation.push(Date.now() - sessionStart);
      
      // Test text processing
      const textStart = Date.now();
      await this.testTextProcessing(session.sessionId, `Performance test message ${i}`);
      results.textProcessing.push(Date.now() - textStart);
      
      // Test audio processing
      const audioStart = Date.now();
      await this.testAudioProcessing(session.sessionId);
      results.audioProcessing.push(Date.now() - audioStart);
    }

    // Calculate averages
    const avgSessionCreation = results.sessionCreation.reduce((a, b) => a + b, 0) / iterations;
    const avgTextProcessing = results.textProcessing.reduce((a, b) => a + b, 0) / iterations;
    const avgAudioProcessing = results.audioProcessing.reduce((a, b) => a + b, 0) / iterations;

    console.log('\n📊 Performance Results:');
    console.log(`Session Creation: ${avgSessionCreation.toFixed(2)}ms average`);
    console.log(`Text Processing: ${avgTextProcessing.toFixed(2)}ms average`);
    console.log(`Audio Processing: ${avgAudioProcessing.toFixed(2)}ms average`);

    return {
      sessionCreation: avgSessionCreation,
      textProcessing: avgTextProcessing,
      audioProcessing: avgAudioProcessing,
      rawResults: results
    };
  }
}

module.exports = TestUtils;