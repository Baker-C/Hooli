const https = require('https');
require('dotenv').config();

/**
 * Test OMI API v1 endpoints
 * Based on search results showing OMI uses OAuth 2.0 flow with v1 endpoints
 */

console.log('🔍 Testing OMI API v1 Endpoints');
console.log('================================\n');

// Configuration
const config = {
  appId: process.env.OMI_APP_ID,
  appSecret: process.env.OMI_APP_SECRET,
  baseUrl: 'api.omi.me'
};

console.log('📋 Configuration:');
console.log(`   App ID: ${config.appId ? config.appId.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`   App Secret: ${config.appSecret ? config.appSecret.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`   Test User ID: ${process.env.OMI_TEST_USER_ID ? process.env.OMI_TEST_USER_ID : 'Using fallback test_user_123'}`);
console.log(`   Base URL: ${config.baseUrl}\n`);

/**
 * Make HTTPS request
 */
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          success: res.statusCode >= 200 && res.statusCode < 300
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
 * Test v1 OAuth token endpoint
 */
async function testV1TokenEndpoint() {
  console.log('📤 Test 1: v1 OAuth Token Endpoint');
  console.log('   Description: Testing OAuth token generation');
  
  try {
    const options = {
      hostname: config.baseUrl,
      path: '/v1/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    const postData = `grant_type=client_credentials&client_id=${config.appId}&client_secret=${config.appSecret}`;
    
    console.log(`   URL: https://${config.baseUrl}${options.path}`);
    console.log(`   Method: ${options.method}`);
    console.log(`   Headers: ${JSON.stringify(options.headers, null, 6)}`);
    
    const response = await makeRequest(options, postData);
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${response.body}`);
    
    if (response.success) {
      console.log('   ✅ Success: OAuth token endpoint responded');
      return JSON.parse(response.body);
    } else {
      console.log(`   ❌ Failed: ${response.statusCode} - ${response.body}`);
      return null;
    }
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return null;
  }
}

/**
 * Test v1 notification endpoint with different auth methods
 */
async function testV1NotificationEndpoint(userId, message, authMethod = 'bearer') {
  console.log(`📤 Test 2: v1 Notification Endpoint (${authMethod} auth)`);
  console.log('   Description: Testing notification with v1 API');
  console.log(`   User ID: "${userId}"`);
  console.log(`   Message: "${message}"`);
  
  try {
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Try different authentication methods
    if (authMethod === 'bearer') {
      headers['Authorization'] = `Bearer ${config.appSecret}`;
    } else if (authMethod === 'app-secret') {
      headers['X-App-Secret'] = config.appSecret;
    } else if (authMethod === 'api-key') {
      headers['X-API-Key'] = config.appSecret;
    }

    const options = {
      hostname: config.baseUrl,
      path: `/v1/integrations/${config.appId}/notification`,
      method: 'POST',
      headers: headers,
      timeout: 10000
    };

    const postData = JSON.stringify({
      uid: userId,
      message: message
    });
    
    console.log(`   URL: https://${config.baseUrl}${options.path}`);
    console.log(`   Method: ${options.method}`);
    console.log(`   Headers: ${JSON.stringify(options.headers, null, 6)}`);
    console.log(`   Body: ${postData}`);
    
    const response = await makeRequest(options, postData);
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${response.body}`);
    
    if (response.success) {
      console.log('   ✅ Success: Notification sent via v1 API');
      return true;
    } else {
      console.log(`   ❌ Failed: ${response.statusCode} - ${response.body}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

/**
 * Test v1 notification with query parameters (like v2)
 */
async function testV1NotificationQuery(userId, message) {
  console.log('📤 Test 3: v1 Notification with Query Parameters');
  console.log('   Description: Testing notification with query params like v2');
  console.log(`   User ID: "${userId}"`);
  console.log(`   Message: "${message}"`);
  
  try {
    const options = {
      hostname: config.baseUrl,
      path: `/v1/integrations/${config.appId}/notification?uid=${encodeURIComponent(userId)}&message=${encodeURIComponent(message)}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.appSecret}`,
        'Content-Type': 'application/json',
        'Content-Length': 0
      },
      timeout: 10000
    };
    
    console.log(`   URL: https://${config.baseUrl}${options.path}`);
    console.log(`   Method: ${options.method}`);
    console.log(`   Headers: ${JSON.stringify(options.headers, null, 6)}`);
    
    const response = await makeRequest(options);
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${response.body}`);
    
    if (response.success) {
      console.log('   ✅ Success: Notification sent via v1 API with query params');
      return true;
    } else {
      console.log(`   ❌ Failed: ${response.statusCode} - ${response.body}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting OMI API v1 Tests...\n');

  // Test 1: OAuth token endpoint
  const tokenResult = await testV1TokenEndpoint();
  console.log('');

  // Test 2: Notification with different auth methods
  const testUserId = process.env.OMI_TEST_USER_ID || 'test_user_123';
  const testMessage = 'Hello from v1 API test!';

  await testV1NotificationEndpoint(testUserId, testMessage, 'bearer');
  console.log('');

  await testV1NotificationEndpoint(testUserId, testMessage, 'app-secret');
  console.log('');

  await testV1NotificationEndpoint(testUserId, testMessage, 'api-key');
  console.log('');

  // Test 3: Query parameter method
  await testV1NotificationQuery(testUserId, testMessage);
  console.log('');

  console.log('🏁 v1 API Tests completed!');
  console.log('\n==================================================');
  console.log('📋 Test Summary:');
  console.log('==================================================');
  console.log('✅ v1 OAuth endpoint tested');
  console.log('✅ v1 notification endpoint tested with multiple auth methods');
  console.log('✅ v1 notification with query parameters tested');
  console.log('\n💡 Next steps:');
  console.log('   1. Check which endpoint/auth method works');
  console.log('   2. Update the notification service to use working endpoint');
  console.log('   3. Test with real OMI user IDs');
}

// Run the tests
runTests().catch(console.error);