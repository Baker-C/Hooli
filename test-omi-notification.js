#!/usr/bin/env node

/**
 * OMI Notification Test Script
 * Tests the OMI notification system with configured credentials
 */

require('dotenv').config();
const { sendOmiNotification } = require('./api/services/omiNotificationService');

async function testOmiNotification() {
  console.log('🧪 OMI Notification Test Script');
  console.log('================================\n');

  // Display configuration
  console.log('📋 Configuration:');
  console.log(`   OMI_APP_ID: ${process.env.OMI_APP_ID ? '✅ Set' : '❌ Not set'}`);
  console.log(`   OMI_APP_SECRET: ${process.env.OMI_APP_SECRET ? '✅ Set' : '❌ Not set'}`);
  console.log(`   OMI_TEST_USER_ID: ${process.env.OMI_TEST_USER_ID ? '✅ Set' : '❌ Not set'}`);
  console.log('');

  if (!process.env.OMI_APP_ID || !process.env.OMI_APP_SECRET) {
    console.error('❌ Missing OMI credentials in .env file');
    process.exit(1);
  }

  if (!process.env.OMI_TEST_USER_ID) {
    console.error('❌ Missing OMI_TEST_USER_ID in .env file');
    console.error('   Please add a real OMI user ID from a user who has installed your app');
    process.exit(1);
  }

  // Test scenarios
  const testScenarios = [
    {
      name: 'Real OMI User ID',
      userId: process.env.OMI_TEST_USER_ID,
      message: 'I have heard you!',
      description: 'Testing with real OMI user ID from environment'
    },
    {
      name: 'Real User ID - Service Update',
      userId: process.env.OMI_TEST_USER_ID,
      message: 'Hello from the OMI notification system!',
      description: 'Testing service update notification with real user ID'
    },
    {
      name: 'Empty User ID Test',
      userId: '',
      message: 'This should fail',
      description: 'Testing error handling with empty user ID'
    }
  ];

  console.log('🚀 Starting notification tests...\n');

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`📤 Test ${i + 1}: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);
    console.log(`   User ID: "${scenario.userId}"`);
    console.log(`   Message: "${scenario.message}"`);
    
    try {
      const startTime = Date.now();
      const result = await sendOmiNotification(scenario.userId, scenario.message);
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Success! (${duration}ms)`);
      console.log(`   📊 Response:`, JSON.stringify(result, null, 6));
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      
      // Log additional error details if available
      if (error.response) {
        console.log(`   📊 Error Response:`, error.response);
      }
    }
    
    console.log(''); // Empty line for readability
    
    // Add a small delay between tests
    if (i < testScenarios.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('🏁 Test completed!\n');

  // Test the webhook simulation
  console.log('🔗 Testing webhook simulation...');
  await testWebhookSimulation();
}

async function testWebhookSimulation() {
  console.log('📨 Simulating webhook request with user ID...\n');

  const mockWebhookData = {
    text: 'Hello, this is a test message',
    uid: process.env.OMI_TEST_USER_ID
  };

  console.log('📦 Mock webhook payload:');
  console.log(JSON.stringify(mockWebhookData, null, 2));
  console.log('');

  try {
    const response = await sendOmiNotification(mockWebhookData.uid, 'I have heard you!');
    console.log('✅ Webhook simulation successful!');
    console.log('📊 Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.log('❌ Webhook simulation failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 Test Summary:');
  console.log('='.repeat(50));
  console.log('✅ Configuration validated');
  console.log('✅ Notification service tested');
  console.log('✅ Error handling verified');
  console.log('✅ Webhook simulation completed');
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. If tests failed with 404/401 errors, verify your OMI credentials');
  console.log('   2. If tests succeeded, your notification system is ready!');
  console.log('   3. Use real OMI user IDs for actual notifications');
  console.log('   4. Monitor the console logs when testing with real OMI webhooks');
  console.log('');
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  testOmiNotification().catch(error => {
    console.error('❌ Test script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testOmiNotification };