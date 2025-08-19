#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔄 Testing Form Publish Toggle...');
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
          console.log('Response:', JSON.stringify(result, null, 2));
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
  console.log('🚀 Starting Form Publish Toggle Test Sequence...\n');
  
  // Test 1: Check current form status
  const statusResult = await testAPI('GET', '/api/forms/status/9', null, 'CHECK CURRENT STATUS');
  
  // Test 2: Publish the form (set to true)
  const publishResult = await testAPI('POST', '/api/forms/publish', {
    businessId: 9,
    isPublished: true
  }, 'PUBLISH FORM (SET TO TRUE)');
  
  // Test 3: Check status after publishing
  const statusAfterPublish = await testAPI('GET', '/api/forms/status/9', null, 'CHECK STATUS AFTER PUBLISH');
  
  // Test 4: Unpublish the form (set to false)
  const unpublishResult = await testAPI('POST', '/api/forms/publish', {
    businessId: 9,
    isPublished: false
  }, 'UNPUBLISH FORM (SET TO FALSE)');
  
  // Test 5: Check status after unpublishing
  const statusAfterUnpublish = await testAPI('GET', '/api/forms/status/9', null, 'CHECK STATUS AFTER UNPUBLISH');
  
  // Test 6: Publish again to leave it in published state
  const publishAgain = await testAPI('POST', '/api/forms/publish', {
    businessId: 9,
    isPublished: true
  }, 'PUBLISH AGAIN (FINAL STATE)');
  
  console.log('\n🏁 Test sequence complete!');
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Initial Status Check', result: statusResult },
    { name: 'Publish Form', result: publishResult },
    { name: 'Status After Publish', result: statusAfterPublish },
    { name: 'Unpublish Form', result: unpublishResult },
    { name: 'Status After Unpublish', result: statusAfterUnpublish },
    { name: 'Final Publish', result: publishAgain }
  ];
  
  tests.forEach((test, index) => {
    const success = test.result.status === 200 && !test.result.error;
    console.log(`${index + 1}. ${test.name}: ${success ? '✅ PASS' : '❌ FAIL'}`);
    if (!success && test.result.data?.error) {
      console.log(`   Error: ${test.result.data.error}`);
    }
  });
  
  const allPassed = tests.every(test => test.result.status === 200 && !test.result.error);
  
  console.log('\n🎯 RESULT:');
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED! Form publish toggle should work correctly.');
    console.log('💡 The toggle should now save immediately when changed in the UI.');
  } else {
    console.log('❌ Some tests failed. Check the errors above.');
    console.log('💡 The form publish toggle may not work correctly.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to the Forms tab in your dashboard');
  console.log('2. Toggle the "Publish your form" switch');
  console.log('3. You should see immediate feedback and the change should persist');
  console.log('4. Check the browser console for detailed logs');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
