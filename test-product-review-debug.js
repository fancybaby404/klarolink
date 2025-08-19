#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate test tokens
const businessToken = jwt.sign({ businessId: 9 }, 'your-secret-key');
const userToken = jwt.sign({ userId: 1 }, 'your-secret-key');

console.log('🔍 COMPREHENSIVE Product Review Debug Test...');
console.log('Business Token:', businessToken.substring(0, 50) + '...');
console.log('User Token:', userToken.substring(0, 50) + '...\n');

// Test function
function testAPI(method, path, body, description, token = null) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${description} ===`);
    console.log(`${method} ${path}`);
    if (body) console.log('Body:', JSON.stringify(body, null, 2));
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using token:', token.substring(0, 30) + '...');
    }
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: headers
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

    req.setTimeout(15000, () => {
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
  console.log('🚀 Starting Comprehensive Product Review Debug...\n');
  
  // === TEST 1: GET BUSINESS INFO ===
  const dashboardResult = await testAPI('GET', '/api/dashboard', null, 'GET BUSINESS INFO', businessToken);
  
  if (dashboardResult.status !== 200) {
    console.log('❌ Cannot get business info, stopping tests');
    return;
  }
  
  const businessSlug = dashboardResult.data?.business?.slug;
  console.log(`📝 Business slug: ${businessSlug}`);
  
  // === TEST 2: GET PRODUCTS ===
  const publicPageResult = await testAPI('GET', `/api/page/${businessSlug}`, null, 'GET PUBLIC PAGE PRODUCTS');
  
  const products = publicPageResult.data?.products || [];
  if (products.length === 0) {
    console.log('❌ No products found, stopping tests');
    return;
  }
  
  const testProduct = products[0];
  console.log(`📦 Testing with product: ${testProduct.name} (ID: ${testProduct.id})`);
  
  // === TEST 3: DEBUG PRODUCT REVIEW FLOW ===
  const debugData = {
    productId: testProduct.id,
    rating: 5,
    comment: "Debug test review - checking if product reviews are working properly",
    business_id: 9
  };
  
  console.log('\n🔍 Running comprehensive debug test...');
  const debugResult = await testAPI('POST', '/api/debug/product-review-flow', debugData, 'DEBUG PRODUCT REVIEW FLOW', businessToken);
  
  if (debugResult.status === 200) {
    const debug = debugResult.data.debug;
    const summary = debugResult.data.summary;
    
    console.log('\n📊 DEBUG RESULTS:');
    console.log('='.repeat(50));
    
    console.log('\n🔐 AUTHENTICATION:');
    console.log(`  Has auth header: ${debug.authentication.hasAuthHeader ? '✅' : '❌'}`);
    console.log(`  Token valid: ${debug.authentication.tokenValid ? '✅' : '❌'}`);
    console.log(`  Token type: ${debug.authentication.tokenType || 'None'}`);
    console.log(`  Business ID: ${debug.authentication.businessId || 'None'}`);
    console.log(`  User ID: ${debug.authentication.userId || 'None'}`);
    
    console.log('\n🗄️ DATABASE:');
    console.log(`  Has connection: ${debug.database.hasConnection ? '✅' : '❌'}`);
    console.log(`  Can query: ${debug.database.canQuery ? '✅' : '❌'}`);
    if (debug.database.error) {
      console.log(`  Error: ${debug.database.error}`);
    }
    
    console.log('\n📦 PRODUCT:');
    console.log(`  Product exists: ${debug.product.exists ? '✅' : '❌'}`);
    if (debug.product.productData) {
      console.log(`  Product name: ${debug.product.productData.product_name || debug.product.productData.name}`);
      console.log(`  Product ID column: ${debug.product.productData.product_id ? 'product_id' : 'id'}`);
    }
    if (debug.product.error) {
      console.log(`  Error: ${debug.product.error}`);
    }
    
    console.log('\n📋 PRODUCT_REVIEWS TABLE:');
    console.log(`  Table exists: ${debug.table.exists ? '✅' : '❌'}`);
    if (debug.table.schema) {
      console.log(`  Columns: ${debug.table.schema.map(c => c.column_name).join(', ')}`);
    }
    console.log(`  Existing reviews: ${debug.table.sampleData.length}`);
    if (debug.table.error) {
      console.log(`  Error: ${debug.table.error}`);
    }
    
    console.log('\n🔨 TABLE CREATION:');
    console.log(`  Attempted: ${debug.createTable.attempted ? '✅' : '❌'}`);
    console.log(`  Success: ${debug.createTable.success ? '✅' : '❌'}`);
    if (debug.createTable.error) {
      console.log(`  Error: ${debug.createTable.error}`);
    }
    
    console.log('\n💾 REVIEW INSERTION:');
    console.log(`  Attempted: ${debug.insert.attempted ? '✅' : '❌'}`);
    console.log(`  Success: ${debug.insert.success ? '✅' : '❌'}`);
    console.log(`  Review ID: ${debug.insert.reviewId || 'None'}`);
    if (debug.insert.error) {
      console.log(`  Error: ${debug.insert.error}`);
    }
    
    console.log('\n✅ VERIFICATION:');
    console.log(`  Total reviews: ${debug.verification.reviewCount}`);
    if (debug.verification.latestReview) {
      console.log(`  Latest review: ID ${debug.verification.latestReview.id}, Rating ${debug.verification.latestReview.rating}/5`);
    }
    
    if (debugResult.data.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      debugResult.data.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }
  }
  
  // === TEST 4: TRY ACTUAL PRODUCT REVIEW SUBMISSION ===
  console.log('\n🧪 Testing actual product review submission...');
  
  const reviewData = {
    rating: 4,
    comment: "This is a real test review to verify the product review system is working correctly.",
    business_id: 9
  };
  
  // Test with business token
  const businessReviewResult = await testAPI('POST', `/api/reviews/product/${testProduct.id}`, reviewData, 'SUBMIT REVIEW (BUSINESS TOKEN)', businessToken);
  
  // Test with user token
  const userReviewResult = await testAPI('POST', `/api/reviews/product/${testProduct.id}`, reviewData, 'SUBMIT REVIEW (USER TOKEN)', userToken);
  
  // === TEST 5: CHECK ANALYTICS AFTER SUBMISSION ===
  console.log('\n⏳ Waiting 2 seconds for data to propagate...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const analyticsResult = await testAPI('GET', '/api/analytics/enhanced', null, 'CHECK ANALYTICS', businessToken);
  
  console.log('\n🏁 Test sequence complete!');
  
  // === FINAL ANALYSIS ===
  console.log('\n📊 FINAL ANALYSIS:');
  console.log('='.repeat(60));
  
  const debugWorked = debugResult.status === 200 && debugResult.data.summary.canInsertReview;
  const businessReviewWorked = businessReviewResult.status === 201;
  const userReviewWorked = userReviewResult.status === 201;
  const analyticsWorked = analyticsResult.status === 200;
  
  console.log('\n🎯 RESULTS SUMMARY:');
  console.log(`  Debug test: ${debugWorked ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Business token review: ${businessReviewWorked ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  User token review: ${userReviewWorked ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Analytics integration: ${analyticsWorked ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (analyticsWorked) {
    const analytics = analyticsResult.data?.analytics;
    console.log(`  Product reviews in analytics: ${analytics?.overview?.totalProductReviews || 0}`);
    console.log(`  Product ratings section: ${analytics?.productRatings?.hasProductRatings ? '✅ VISIBLE' : '❌ HIDDEN'}`);
  }
  
  console.log('\n🔧 ISSUES FOUND:');
  if (!debugWorked) {
    console.log('  ❌ Basic product review flow has issues');
    if (debugResult.data?.recommendations) {
      debugResult.data.recommendations.forEach(rec => console.log(`     - ${rec}`));
    }
  }
  
  if (!businessReviewWorked) {
    console.log('  ❌ Business token review submission failed');
    if (businessReviewResult.data?.error) {
      console.log(`     Error: ${businessReviewResult.data.error}`);
    }
  }
  
  if (!userReviewWorked) {
    console.log('  ❌ User token review submission failed');
    if (userReviewResult.data?.error) {
      console.log(`     Error: ${userReviewResult.data.error}`);
    }
  }
  
  if (!analyticsWorked) {
    console.log('  ❌ Analytics integration not working');
  }
  
  console.log('\n📋 NEXT STEPS:');
  if (debugWorked && (businessReviewWorked || userReviewWorked)) {
    console.log('✅ Product review system is working!');
    console.log('1. Try submitting a review from the public page');
    console.log('2. Check the product_reviews table in your database');
    console.log('3. Verify analytics show the product ratings section');
  } else {
    console.log('❌ Product review system needs fixing:');
    console.log('1. Check database connection and credentials');
    console.log('2. Ensure product_reviews table exists');
    console.log('3. Verify authentication tokens are valid');
    console.log('4. Check server logs for detailed error messages');
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
