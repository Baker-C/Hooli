#!/usr/bin/env node

/**
 * OMI API Debug Script
 * Tests different API endpoints and configurations to troubleshoot the connection
 */

require('dotenv').config();
const https = require('https');

const APP_ID = process.env.OMI_APP_ID;
const APP_SECRET = process.env.OMI_APP_SECRET;

console.log('🔍 OMI API Debug Script');
console.log('========================\n');

console.log('📋 Configuration:');
console.log(`   OMI_APP_ID: ${APP_ID}`);
console.log(`   OMI_APP_SECRET: ${APP_SECRET ? APP_SECRET.substring(0, 10) + '...' : 'Not set'}`);
console.log(`   OMI_TEST_USER_ID: ${process.env.OMI_TEST_USER_ID ? process.env.OMI_TEST_USER_ID : 'Using fallback test_user'}`);
console.log('');

async function testApiEndpoint(hostname, path, headers, description) {
  console.log(`🔗 Testing: ${description}`);
  console.log(`   URL: https://${hostname}${path}`);
  console.log(`   Headers:`, JSON.stringify(headers, null, 4));
  
  return new Promise((resolve) => {
    const options = {
      hostname,
      path,
      method: 'POST',
      headers,
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   📊 Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`   📝 Response: ${data}`);
        console.log(`   🔧 Response Headers:`, JSON.stringify(res.headers, null, 4));
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          statusCode: res.statusCode,
          data,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Request Error: ${error.message}`);
      resolve({
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`   ⏰ Request Timeout`);
      resolve({
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function debugOmiApi() {
  console.log('🚀 Starting API debug tests...\n');

  // Test 1: Basic API connectivity
  await testApiEndpoint(
    'api.omi.me',
    '/',
    {},
    'Basic API connectivity (root endpoint)'
  );
  console.log('');

  // Test 2: App info endpoint (if exists)
  await testApiEndpoint(
    'api.omi.me',
    `/v2/integrations/${APP_ID}`,
    {
      'Authorization': `Bearer ${APP_SECRET}`,
      'Content-Type': 'application/json'
    },
    'App info endpoint'
  );
  console.log('');

  // Test 3: Notification endpoint with real user ID
  const testUserId = process.env.OMI_TEST_USER_ID || 'test_user';
  await testApiEndpoint(
    'api.omi.me',
    `/v2/integrations/${APP_ID}/notification?uid=${encodeURIComponent(testUserId)}&message=test`,
    {
      'Authorization': `Bearer ${APP_SECRET}`,
      'Content-Type': 'application/json',
      'Content-Length': '0'
    },
    'Notification endpoint (original format)'
  );
  console.log('');

  // Test 4: Try different auth format
  await testApiEndpoint(
    'api.omi.me',
    `/v2/integrations/${APP_ID}/notification?uid=${encodeURIComponent(testUserId)}&message=test`,
    {
      'Authorization': APP_SECRET,
      'Content-Type': 'application/json',
      'Content-Length': '0'
    },
    'Notification endpoint (without Bearer prefix)'
  );
  console.log('');

  // Test 5: Try different hostname
  await testApiEndpoint(
    'omi.me',
    `/v2/integrations/${APP_ID}/notification?uid=${encodeURIComponent(testUserId)}&message=test`,
    {
      'Authorization': `Bearer ${APP_SECRET}`,
      'Content-Type': 'application/json',
      'Content-Length': '0'
    },
    'Alternative hostname (omi.me)'
  );
  console.log('');

  // Test 6: Try v1 API
  await testApiEndpoint(
    'api.omi.me',
    `/v1/integrations/${APP_ID}/notification?uid=${encodeURIComponent(testUserId)}&message=test`,
    {
      'Authorization': `Bearer ${APP_SECRET}`,
      'Content-Type': 'application/json',
      'Content-Length': '0'
    },
    'v1 API endpoint'
  );
  console.log('');

  console.log('🏁 Debug tests completed!\n');
  
  console.log('💡 Troubleshooting Tips:');
  console.log('========================');
  console.log('1. If you see 404 "App not found" - verify your OMI_APP_ID');
  console.log('2. If you see 401/403 "Unauthorized" - verify your OMI_APP_SECRET');
  console.log('3. If you see connection errors - check your internet connection');
  console.log('4. If all tests fail - the OMI API might be down or changed');
  console.log('5. Contact OMI support with these debug results for assistance');
  console.log('');
}

// Run the debug
if (require.main === module) {
  debugOmiApi().catch(error => {
    console.error('❌ Debug script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { debugOmiApi };