#!/usr/bin/env node

/**
 * Test Runner for OMI Voice Integration
 * Run this script to test your OMI backend endpoints
 */

const TestUtils = require('./testUtils');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  
  // Default to localhost, but allow override
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const testUtils = new TestUtils(baseUrl);

  console.log(`🔧 Testing OMI Backend at: ${baseUrl}`);
  console.log(`📋 Command: ${command}\n`);

  try {
    switch (command) {
      case 'health':
        await testUtils.testHealth();
        break;
        
      case 'session':
        const session = await testUtils.createTestSession();
        console.log('Session ID:', session.sessionId);
        break;
        
      case 'text':
        if (!args[1]) {
          console.error('❌ Please provide session ID: npm run test:text <sessionId>');
          process.exit(1);
        }
        await testUtils.testTextProcessing(args[1], args[2] || 'Hello, test message');
        break;
        
      case 'audio':
        if (!args[1]) {
          console.error('❌ Please provide session ID: npm run test:audio <sessionId>');
          process.exit(1);
        }
        await testUtils.testAudioProcessing(args[1], args[2]);
        break;
        
      case 'webhook':
        await testUtils.testWebhook(args[1] || 'session.created');
        break;
        
      case 'performance':
        const iterations = parseInt(args[1]) || 10;
        await testUtils.performanceTest(iterations);
        break;
        
      case 'full':
      default:
        await testUtils.runFullTestSuite();
        break;
    }
    
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

// Show usage if --help is provided
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🧪 OMI Voice Integration Test Runner

Usage: node tests/runTests.js [command] [options]

Commands:
  full                    Run complete test suite (default)
  health                  Test health endpoint only
  session                 Create a test session
  text <sessionId> [msg]  Test text processing
  audio <sessionId> [file] Test audio processing
  webhook [eventType]     Test webhook endpoint
  performance [iterations] Run performance tests

Environment Variables:
  TEST_BASE_URL          Base URL for testing (default: http://localhost:3000)
  USE_MOCK_OMI          Set to 'true' to use mock OMI service

Examples:
  npm run test           # Run full test suite
  npm run test:health    # Test health only
  npm run test:perf 20   # Run 20 performance iterations
  
  node tests/runTests.js session
  node tests/runTests.js text session_123 "Hello world"
  node tests/runTests.js audio session_123 ./sample.wav
`);
  process.exit(0);
}

main();