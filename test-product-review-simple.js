#!/usr/bin/env node

const http = require('http');

console.log('🧪 Simple Product Review Test...\n');

// Test function
function testAPI(method, path, body, description) {
  return new Promise((resolve, reject) => {
    console.log(`=== ${description} ===`);
    console.log(`${method} ${path}`);
    if (body) console.log('Body:', JSON.stringify(body, null, 2));
    
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
          console.log(`Status: ${res.statusCode}`);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          console.log(`Status: ${res.statusCode}`);
          console.log('Raw response:', data);
          resolve({ status: res.statusCode, data: data, error: 'Invalid JSON' });
        }
      });
    });

    req.on('error', (e) => {
      console.log(`Request failed: ${e.message}`);
      resolve({ error: e.message });
    });

    req.setTimeout(10000, () => {
      console.log('Request timeout');
      req.destroy();
      resolve({ error: 'Timeout' });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Main test
async function runTest() {
  console.log('🚀 Testing Product Review System...\n');
  
  // === TEST 1: Test the test endpoint ===
  const testResult = await testAPI('POST', '/api/test-product-review', {
    productId: 1,
    rating: 5,
    comment: "Test review to verify the system is working",
    business_id: 9,
    user_id: 1
  }, 'TEST PRODUCT REVIEW API');
  
  if (testResult.status === 200) {
    const results = testResult.data.results;
    console.log('\n📊 TEST RESULTS:');
    console.log(`  Database connection: ${results.databaseConnection ? '✅' : '❌'}`);
    console.log(`  Product exists: ${results.productExists ? '✅' : '❌'}`);
    console.log(`  Table created: ${results.tableCreated ? '✅' : '❌'}`);
    console.log(`  Review inserted: ${results.reviewInserted ? '✅' : '❌'}`);
    console.log(`  Review verified: ${results.reviewVerified ? '✅' : '❌'}`);
    console.log(`  Total reviews: ${results.totalReviews}`);
    console.log(`  Analytics test: ${results.analyticsTest?.success ? '✅' : '❌'}`);
    
    if (results.insertedReview) {
      console.log('\n📝 INSERTED REVIEW:');
      console.log(`  ID: ${results.insertedReview.id}`);
      console.log(`  Product ID: ${results.insertedReview.product_id}`);
      console.log(`  Business ID: ${results.insertedReview.business_id}`);
      console.log(`  User ID: ${results.insertedReview.user_id}`);
      console.log(`  Rating: ${results.insertedReview.rating}/5`);
      console.log(`  Comment: "${results.insertedReview.comment}"`);
      console.log(`  Created: ${results.insertedReview.created_at}`);
    }
    
    if (results.analyticsTest?.data?.length > 0) {
      console.log('\n📊 ANALYTICS DATA:');
      results.analyticsTest.data.slice(0, 2).forEach((review, index) => {
        console.log(`  ${index + 1}. ${review.product_name} - ${review.rating}/5`);
      });
    }
    
    console.log('\n🎯 SUMMARY:');
    if (testResult.data.summary.readyForProduction) {
      console.log('✅ SYSTEM READY! Product reviews are working correctly.');
      console.log('📋 Next steps:');
      console.log('  1. Try submitting a review from the public page');
      console.log('  2. Check your Neon database product_reviews table');
      console.log('  3. Verify analytics show product ratings');
    } else {
      console.log('❌ SYSTEM NEEDS ATTENTION');
      console.log('📋 Issues found:');
      if (!results.productExists) console.log('  - Product does not exist in database');
      if (!results.reviewInserted) console.log('  - Review insertion failed');
      if (!results.reviewVerified) console.log('  - Review verification failed');
      if (!results.analyticsTest?.success) console.log('  - Analytics queries not working');
    }
  } else {
    console.log('\n❌ TEST FAILED');
    console.log('Status:', testResult.status);
    if (testResult.data?.error) {
      console.log('Error:', testResult.data.error);
      console.log('Details:', testResult.data.details);
    }
  }
  
  console.log('\n📋 MANUAL TESTING:');
  console.log('1. Visit your feedback page');
  console.log('2. Go to Products tab');
  console.log('3. Click "Review This Product"');
  console.log('4. Submit a review');
  console.log('5. Check server console for detailed logs');
  console.log('6. Check Neon database product_reviews table');
}

// Run the test
runTest().catch(console.error);
