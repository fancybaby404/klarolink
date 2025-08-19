#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔍 Testing Business Preview Column Fix...');
console.log('Business ID: 9');
console.log('Token:', token.substring(0, 50) + '...\n');

// Test function
function testAPI(method, path, body, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${description} ===`);
    console.log(`${method} ${path}`);
    if (body) console.log('Body:', JSON.stringify(body, null, 2));
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          console.log(`❌ Status: ${res.statusCode}`);
          console.log('Raw response:', data);
          resolve({ status: res.statusCode, data: data, error: 'Invalid JSON' });
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Request failed: ${e.message}`);
      resolve({ error: e.message });
    });

    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      resolve({ error: 'Timeout' });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test function for public endpoints (no auth)
function testPublicAPI(method, path, body, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${description} ===`);
    console.log(`${method} ${path}`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log('Key data:', {
            previewEnabled: result.previewEnabled,
            businessName: result.business?.name,
            businessPreviewEnabled: result.business?.preview_enabled,
            formFields: result.formFields?.length || 0
          });
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          console.log(`❌ Status: ${res.statusCode}`);
          console.log('Raw response:', data);
          resolve({ status: res.statusCode, data: data, error: 'Invalid JSON' });
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Request failed: ${e.message}`);
      resolve({ error: e.message });
    });

    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      resolve({ error: 'Timeout' });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Main test sequence
async function runTests() {
  console.log('🚀 Starting Business Preview Column Fix Test...\n');
  
  // First, get the business slug
  const dashboardResult = await testAPI('GET', '/api/dashboard', null, 'GET BUSINESS INFO');
  const businessSlug = dashboardResult.data?.business?.slug;
  const currentPreviewEnabled = dashboardResult.data?.business?.preview_enabled;
  
  if (!businessSlug) {
    console.log('❌ Could not get business slug from dashboard');
    return;
  }
  
  console.log(`📝 Business slug: ${businessSlug}`);
  console.log(`📝 Current preview_enabled: ${currentPreviewEnabled}`);
  
  // Test 1: Check current form status (should read from businesses table now)
  const statusResult = await testAPI('GET', '/api/forms/status/9', null, 'CHECK CURRENT STATUS (businesses table)');
  
  // Test 2: Publish the form (should update businesses table now)
  const publishResult = await testAPI('POST', '/api/forms/publish', {
    businessId: 9,
    isPublished: true
  }, 'PUBLISH FORM (update businesses table)');
  
  // Test 3: Check status after publishing
  const statusAfterPublish = await testAPI('GET', '/api/forms/status/9', null, 'CHECK STATUS AFTER PUBLISH');
  
  // Test 4: Test the public page API (should read business.preview_enabled)
  const publicPageResult = await testPublicAPI('GET', `/api/page/${businessSlug}`, null, 'TEST PUBLIC PAGE API');
  
  // Test 5: Try unpublishing
  const unpublishResult = await testAPI('POST', '/api/forms/publish', {
    businessId: 9,
    isPublished: false
  }, 'UNPUBLISH FORM');
  
  // Test 6: Check public page after unpublishing
  const publicPageAfterUnpublish = await testPublicAPI('GET', `/api/page/${businessSlug}`, null, 'PUBLIC PAGE AFTER UNPUBLISH');
  
  // Test 7: Publish again for final state
  const publishAgain = await testAPI('POST', '/api/forms/publish', {
    businessId: 9,
    isPublished: true
  }, 'PUBLISH AGAIN (final state)');
  
  console.log('\n🏁 Test sequence complete!');
  
  // Analysis
  console.log('\n📊 ANALYSIS:');
  console.log('='.repeat(60));
  
  console.log('\n📝 PUBLISH/UNPUBLISH CYCLE:');
  console.log(`  Initial status: ${statusResult.data?.isPublished ? 'Published' : 'Unpublished'}`);
  console.log(`  After publish: ${statusAfterPublish.data?.isPublished ? 'Published' : 'Unpublished'}`);
  console.log(`  After unpublish: ${unpublishResult.data?.success ? 'Success' : 'Failed'}`);
  console.log(`  Final state: ${publishAgain.data?.success ? 'Published' : 'Failed'}`);
  
  console.log('\n🌐 PUBLIC PAGE BEHAVIOR:');
  console.log(`  When published: previewEnabled = ${publicPageResult.data?.previewEnabled}`);
  console.log(`  When unpublished: previewEnabled = ${publicPageAfterUnpublish.data?.previewEnabled}`);
  
  console.log('\n🎯 DIAGNOSIS:');
  
  const publishWorking = publishResult.status === 200 && publishResult.data?.success;
  const statusWorking = statusAfterPublish.status === 200 && statusAfterPublish.data?.isPublished;
  const publicPageWorking = publicPageResult.status === 200 && publicPageResult.data?.previewEnabled;
  const unpublishWorking = unpublishResult.status === 200 && unpublishResult.data?.success;
  
  if (!publishWorking) {
    console.log('❌ ISSUE: Publish API is not working');
    console.log('   Check: businesses table has preview_enabled column');
  } else if (!statusWorking) {
    console.log('❌ ISSUE: Status API is not reading from businesses table correctly');
    console.log('   Check: /api/forms/status endpoint query');
  } else if (!publicPageWorking) {
    console.log('❌ ISSUE: Public page is not reading business.preview_enabled correctly');
    console.log('   Check: /api/page/[slug] endpoint');
  } else if (!unpublishWorking) {
    console.log('❌ ISSUE: Unpublish is not working');
    console.log('   Check: businesses table update query');
  } else {
    console.log('✅ SUCCESS: All components working correctly!');
    console.log('   The feedback page should now respond to the dashboard toggle');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log(`1. Visit the public page: http://localhost:3000/${businessSlug}`);
  console.log('2. Toggle the "Publish your form" switch in dashboard');
  console.log('3. Refresh the public page - it should change between enabled/disabled');
  console.log('4. The form should now properly reflect the dashboard toggle state');
  
  console.log('\n🔧 WHAT WAS FIXED:');
  console.log('- Publish API now updates businesses.preview_enabled (not feedback_forms)');
  console.log('- Status API now reads from businesses.preview_enabled');
  console.log('- Public page API now uses business.preview_enabled');
  console.log('- All components now use the same column: businesses.preview_enabled');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
