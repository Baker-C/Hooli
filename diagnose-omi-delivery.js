#!/usr/bin/env node

/**
 * OMI Notification Delivery Diagnostic Script
 * Comprehensive testing to identify why notifications aren't reaching the user's device
 */

require('dotenv').config();
const https = require('https');
const { sendOmiNotification } = require('./api/services/omiNotificationService');

console.log('🔍 OMI Notification Delivery Diagnostics');
console.log('=========================================\n');

// Configuration
const config = {
  appId: process.env.OMI_APP_ID,
  appSecret: process.env.OMI_APP_SECRET,
  testUserId: process.env.OMI_TEST_USER_ID,
  baseUrl: 'api.omi.me'
};

console.log('📋 Configuration:');
console.log(`   App ID: ${config.appId ? config.appId.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`   App Secret: ${config.appSecret ? config.appSecret.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`   Test User ID: ${config.testUserId || 'NOT SET'}`);
console.log(`   Base URL: ${config.baseUrl}\n`);

if (!config.appId || !config.appSecret || !config.testUserId) {
  console.error('❌ Missing required configuration. Please check your .env file.');
  process.exit(1);
}

/**
 * Enhanced HTTPS request with detailed response logging
 */
function makeDetailedRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data,
          duration: duration,
          success: res.statusCode >= 200 && res.statusCode < 300,
          timestamp: new Date().toISOString()
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

/**
 * Test notification with enhanced logging
 */
async function testNotificationWithDetails(userId, message, testName) {
  console.log(`\n📤 ${testName}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Message: "${message}"`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  
  try {
    const options = {
      hostname: config.baseUrl,
      path: `/v2/integrations/${config.appId}/notification?uid=${encodeURIComponent(userId)}&message=${encodeURIComponent(message)}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.appSecret}`,
        'Content-Type': 'application/json',
        'Content-Length': 0,
        'User-Agent': 'Aviado-OMI-Diagnostic/1.0'
      },
      timeout: 15000
    };

    console.log(`   📡 Request URL: https://${config.baseUrl}${options.path}`);
    console.log(`   📡 Request Headers:`, JSON.stringify(options.headers, null, 6));
    
    const response = await makeDetailedRequest(options);
    
    console.log(`   📊 Response Details:`);
    console.log(`      Status: ${response.statusCode} ${response.statusMessage}`);
    console.log(`      Duration: ${response.duration}ms`);
    console.log(`      Timestamp: ${response.timestamp}`);
    console.log(`      Headers:`, JSON.stringify(response.headers, null, 8));
    console.log(`      Body: ${response.body}`);
    
    // Parse response if JSON
    let parsedResponse = null;
    try {
      parsedResponse = JSON.parse(response.body);
      console.log(`      Parsed Response:`, JSON.stringify(parsedResponse, null, 8));
    } catch (e) {
      console.log(`      Raw Response: ${response.body}`);
    }
    
    if (response.success) {
      console.log(`   ✅ API Success - Check your phone for notification`);
      
      // Check for delivery indicators in response
      if (parsedResponse) {
        if (parsedResponse.delivered !== undefined) {
          console.log(`      📱 Delivery Status: ${parsedResponse.delivered ? 'Delivered' : 'Pending'}`);
        }
        if (parsedResponse.messageId) {
          console.log(`      🆔 Message ID: ${parsedResponse.messageId}`);
        }
        if (parsedResponse.queueTime) {
          console.log(`      ⏰ Queue Time: ${parsedResponse.queueTime}`);
        }
      }
      
      return { success: true, response: parsedResponse || response.body, duration: response.duration };
    } else {
      console.log(`   ❌ API Failed: ${response.statusCode} - ${response.body}`);
      return { success: false, error: response.body, statusCode: response.statusCode };
    }
    
  } catch (error) {
    console.log(`   ❌ Request Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test different notification scenarios
 */
async function runDeliveryDiagnostics() {
  console.log('🚀 Starting Delivery Diagnostics...\n');
  
  const testScenarios = [
    {
      name: 'Test 1: Simple Short Message',
      message: 'Hi! 👋',
      description: 'Testing with very short message'
    },
    {
      name: 'Test 2: Standard Message',
      message: 'Hello from your OMI app! This is a test notification.',
      description: 'Testing with standard length message'
    },
    {
      name: 'Test 3: Message with Emojis',
      message: '🔔 Notification Test! 📱 Check your phone 🚀',
      description: 'Testing with emoji characters'
    },
    {
      name: 'Test 4: Urgent Message',
      message: 'URGENT: Test notification - please check your phone immediately!',
      description: 'Testing with urgent/caps message'
    },
    {
      name: 'Test 5: Long Message',
      message: 'This is a longer test message to see if message length affects delivery. Sometimes longer messages can have different delivery characteristics or may be truncated by the notification system.',
      description: 'Testing with longer message content'
    },
    {
      name: 'Test 6: Special Characters',
      message: 'Test with special chars: @#$%^&*()_+-=[]{}|;:,.<>?',
      description: 'Testing with special characters'
    }
  ];

  const results = [];
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n${'='.repeat(60)}`);
    
    const result = await testNotificationWithDetails(
      config.testUserId,
      scenario.message,
      scenario.name
    );
    
    results.push({
      ...scenario,
      ...result
    });
    
    // Wait between tests to avoid rate limiting
    if (i < testScenarios.length - 1) {
      console.log(`\n⏳ Waiting 3 seconds before next test...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  return results;
}

/**
 * Test with delays to check for eventual delivery
 */
async function testDelayedDelivery() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('⏰ Testing Delayed Delivery Check');
  console.log('='.repeat(60));
  
  const testMessage = `Delayed delivery test - ${new Date().toLocaleTimeString()}`;
  
  console.log('\n📤 Sending notification...');
  const result = await testNotificationWithDetails(
    config.testUserId,
    testMessage,
    'Delayed Delivery Test'
  );
  
  if (result.success) {
    console.log('\n⏳ Waiting for potential delayed delivery...');
    
    const checkIntervals = [5, 10, 30, 60]; // seconds
    
    for (const interval of checkIntervals) {
      console.log(`\n⏰ Checking after ${interval} seconds...`);
      await new Promise(resolve => setTimeout(resolve, interval * 1000));
      
      console.log(`   📱 Please check your phone now for the notification sent ${interval} seconds ago`);
      console.log(`   💬 Message was: "${testMessage}"`);
      
      // Prompt user to check
      console.log(`   ❓ Did you receive the notification? (Check manually)`);
    }
  }
}

/**
 * Check OMI app status and user verification
 */
async function checkUserStatus() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('👤 User Status Verification');
  console.log('='.repeat(60));
  
  try {
    // Try to get user info (if endpoint exists)
    const options = {
      hostname: config.baseUrl,
      path: `/v2/integrations/${config.appId}/users/${config.testUserId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.appSecret}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    console.log(`\n📡 Checking user status...`);
    console.log(`   URL: https://${config.baseUrl}${options.path}`);
    
    const response = await makeDetailedRequest(options);
    
    console.log(`\n📊 User Status Response:`);
    console.log(`   Status: ${response.statusCode} ${response.statusMessage}`);
    console.log(`   Body: ${response.body}`);
    
    if (response.success) {
      try {
        const userData = JSON.parse(response.body);
        console.log(`   📱 User Data:`, JSON.stringify(userData, null, 6));
        
        if (userData.active !== undefined) {
          console.log(`   ✅ User Active: ${userData.active}`);
        }
        if (userData.notificationsEnabled !== undefined) {
          console.log(`   🔔 Notifications Enabled: ${userData.notificationsEnabled}`);
        }
        if (userData.lastSeen) {
          console.log(`   👀 Last Seen: ${userData.lastSeen}`);
        }
      } catch (e) {
        console.log(`   📄 Raw response: ${response.body}`);
      }
    } else {
      console.log(`   ℹ️  User status endpoint not available or user not found`);
    }
    
  } catch (error) {
    console.log(`   ℹ️  Could not check user status: ${error.message}`);
  }
}

/**
 * Generate troubleshooting report
 */
function generateTroubleshootingReport(results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 TROUBLESHOOTING REPORT');
  console.log('='.repeat(60));
  
  console.log('\n🔍 Test Results Summary:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.name}: ${result.success ? 'API Success' : 'API Failed'}`);
  });
  
  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n📊 Success Rate: ${successfulTests}/${totalTests} (${Math.round(successfulTests/totalTests*100)}%)`);
  
  console.log('\n🔧 TROUBLESHOOTING STEPS:');
  console.log('\n1. 📱 OMI App Check:');
  console.log('   • Is the OMI app installed and logged in on your phone?');
  console.log('   • Is the app running in the background?');
  console.log('   • Check if you\'re logged in with the correct account');
  
  console.log('\n2. 🔔 Notification Settings:');
  console.log('   • Check phone notification settings for OMI app');
  console.log('   • Ensure notifications are enabled in phone settings');
  console.log('   • Check if "Do Not Disturb" mode is enabled');
  console.log('   • Verify notification permissions for OMI app');
  
  console.log('\n3. 🌐 Connectivity:');
  console.log('   • Ensure phone has internet connection');
  console.log('   • Try switching between WiFi and mobile data');
  console.log('   • Check if phone is in airplane mode');
  
  console.log('\n4. 🆔 User ID Verification:');
  console.log(`   • Your User ID: ${config.testUserId}`);
  console.log('   • Verify this is the correct OMI user ID');
  console.log('   • Check if you completed the OMI app authorization flow');
  
  console.log('\n5. ⏰ Timing Issues:');
  console.log('   • Notifications might be delayed (check after a few minutes)');
  console.log('   • Try sending notifications at different times');
  console.log('   • Check if there are rate limits affecting delivery');
  
  console.log('\n6. 🔄 App Restart:');
  console.log('   • Try force-closing and reopening the OMI app');
  console.log('   • Restart your phone');
  console.log('   • Log out and log back into the OMI app');
  
  if (successfulTests === totalTests) {
    console.log('\n✅ All API calls succeeded! The issue is likely:');
    console.log('   • OMI app notification settings on your phone');
    console.log('   • Phone notification permissions');
    console.log('   • Network connectivity on your phone');
    console.log('   • OMI app not running or logged out');
  } else {
    console.log('\n❌ Some API calls failed. Check:');
    console.log('   • OMI credentials (APP_ID, APP_SECRET)');
    console.log('   • User ID validity');
    console.log('   • Network connectivity from server');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Check all the troubleshooting items above');
  console.log('   2. Try sending a test notification from OMI dashboard (if available)');
  console.log('   3. Contact OMI support with your User ID if issues persist');
  console.log('   4. Test with a different OMI user ID if possible');
}

/**
 * Main diagnostic function
 */
async function runFullDiagnostics() {
  try {
    console.log('🎯 Starting comprehensive OMI notification delivery diagnostics...\n');
    
    // Run notification tests
    const results = await runDeliveryDiagnostics();
    
    // Check user status
    await checkUserStatus();
    
    // Test delayed delivery
    await testDelayedDelivery();
    
    // Generate report
    generateTroubleshootingReport(results);
    
    console.log('\n🏁 Diagnostics completed!');
    console.log('\n📞 If notifications still don\'t work after checking all items:');
    console.log('   • Contact OMI support with this diagnostic report');
    console.log('   • Provide your User ID and App ID');
    console.log('   • Mention that API calls succeed but notifications don\'t reach device');
    
  } catch (error) {
    console.error('❌ Diagnostic script failed:', error.message);
    process.exit(1);
  }
}

// Run diagnostics
if (require.main === module) {
  runFullDiagnostics();
}

module.exports = { runFullDiagnostics };