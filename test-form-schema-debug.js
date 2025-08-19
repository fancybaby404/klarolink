#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔍 Testing Form Schema and Publish Toggle...');
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
          
          // Extract key information based on endpoint
          if (path.includes('check-form-schema')) {
            console.log('\n📊 SCHEMA CHECK RESULTS:');
            console.log(`Has preview_enabled column: ${result.schema?.hasPreviewEnabled ? '✅' : '❌'}`);
            console.log(`Form exists: ${result.currentForm?.exists ? '✅' : '❌'}`);
            console.log(`Current preview_enabled: ${result.currentForm?.previewEnabled}`);
            console.log(`Status API working: ${result.apiTests?.status?.success ? '✅' : '❌'}`);
            console.log(`Publish API working: ${result.apiTests?.publish?.success ? '✅' : '❌'}`);
            
            if (result.analysis?.issues?.length > 0) {
              console.log('\n❌ Issues found:');
              result.analysis.issues.forEach(issue => console.log(`  - ${issue}`));
            }
            
            if (result.recommendations?.length > 0) {
              console.log('\n💡 Recommendations:');
              result.recommendations.forEach(rec => console.log(`  - ${rec}`));
            }
          } else {
            console.log('Response:', JSON.stringify(result, null, 2));
          }
          
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
  console.log('🚀 Starting Form Schema Debug Test Sequence...\n');
  
  // Test 1: Check form schema and current state
  const schemaResult = await testAPI('GET', '/api/debug/check-form-schema', null, 'FORM SCHEMA CHECK');
  
  // Test 2: Check current form status
  const statusResult = await testAPI('GET', '/api/forms/status/9', null, 'CURRENT FORM STATUS');
  
  // Test 3: Get dashboard data to see form info
  const dashboardResult = await testAPI('GET', '/api/dashboard', null, 'DASHBOARD DATA');
  
  // Test 4: Try to publish the form
  const publishResult = await testAPI('POST', '/api/forms/publish', {
    businessId: 9,
    isPublished: true
  }, 'PUBLISH FORM');
  
  // Test 5: Check status after publishing
  const statusAfterPublish = await testAPI('GET', '/api/forms/status/9', null, 'STATUS AFTER PUBLISH');
  
  console.log('\n🏁 Test sequence complete!');
  
  // Analysis
  console.log('\n📊 ANALYSIS:');
  console.log('='.repeat(60));
  
  const schema = schemaResult.data?.schema;
  const currentForm = schemaResult.data?.currentForm;
  const apiTests = schemaResult.data?.apiTests;
  
  console.log('\n🗄️ DATABASE SCHEMA:');
  console.log(`  preview_enabled column exists: ${schema?.hasPreviewEnabled ? '✅ YES' : '❌ NO'}`);
  console.log(`  is_published column exists: ${schema?.hasIsPublished ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📝 CURRENT FORM:');
  console.log(`  Form exists: ${currentForm?.exists ? '✅ YES' : '❌ NO'}`);
  console.log(`  preview_enabled value: ${currentForm?.previewEnabled}`);
  console.log(`  is_active value: ${currentForm?.isActive}`);
  
  console.log('\n🔌 API ENDPOINTS:');
  console.log(`  Status API: ${statusResult.status === 200 ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`  Publish API: ${publishResult.status === 200 ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (statusResult.status === 200) {
    console.log(`  Status API returns: isPublished = ${statusResult.data?.isPublished}`);
  }
  
  if (publishResult.status === 200) {
    console.log(`  Publish API returns: success = ${publishResult.data?.success}`);
  }
  
  console.log('\n🎯 DIAGNOSIS:');
  
  if (!schema?.hasPreviewEnabled) {
    console.log('❌ CRITICAL: preview_enabled column is missing from feedback_forms table');
    console.log('   Solution: Run database migration to add the column');
  } else if (!currentForm?.exists) {
    console.log('❌ ISSUE: No form exists for this business');
    console.log('   Solution: Create a form first in the dashboard');
  } else if (statusResult.status !== 200) {
    console.log('❌ ISSUE: Status API is not working');
    console.log('   Solution: Check API endpoint and database connection');
  } else if (publishResult.status !== 200) {
    console.log('❌ ISSUE: Publish API is not working');
    console.log('   Solution: Check API endpoint and database connection');
  } else {
    console.log('✅ GOOD: All components appear to be working');
    console.log('   The toggle should work correctly now');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Check the diagnosis above for any critical issues');
  console.log('2. If all looks good, try the toggle in the dashboard');
  console.log('3. Check browser console for any frontend errors');
  console.log('4. Refresh the page and check if the toggle state persists');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
