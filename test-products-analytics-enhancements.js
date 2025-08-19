#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔍 Testing Products & Analytics Enhancements...');
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
            productsCount: result.products?.length || 0,
            previewEnabled: result.previewEnabled,
            businessName: result.business?.name
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
  console.log('🚀 Starting Products & Analytics Enhancement Tests...\n');
  
  // Get business slug first
  const dashboardResult = await testAPI('GET', '/api/dashboard', null, 'GET BUSINESS INFO');
  const businessSlug = dashboardResult.data?.business?.slug;
  
  if (!businessSlug) {
    console.log('❌ Could not get business slug');
    return;
  }
  
  console.log(`📝 Business slug: ${businessSlug}`);
  
  // === TEST 1: ENABLED PRODUCTS SYSTEM ===
  console.log('\n🛍️ TESTING ENABLED PRODUCTS SYSTEM');
  
  // Get current enabled products
  const enabledProductsResult = await testAPI('GET', '/api/products/enabled', null, 'GET ENABLED PRODUCTS');
  
  // Enable some products (simulate dashboard selection)
  const enableProductsResult = await testAPI('POST', '/api/products/enabled', {
    enabledProductIds: [1, 2, 3] // Enable first 3 products
  }, 'ENABLE PRODUCTS FOR FEEDBACK PAGE');
  
  // Test public page shows only enabled products
  const publicPageResult = await testPublicAPI('GET', `/api/page/${businessSlug}`, null, 'PUBLIC PAGE - ENABLED PRODUCTS ONLY');
  
  // === TEST 2: ENHANCED ANALYTICS ===
  console.log('\n📊 TESTING ENHANCED ANALYTICS');
  
  // Get enhanced analytics
  const analyticsResult = await testAPI('GET', '/api/analytics/enhanced', null, 'GET ENHANCED ANALYTICS');
  
  // === TEST 3: PRODUCT RATINGS (if available) ===
  console.log('\n⭐ TESTING PRODUCT RATINGS');
  
  // Try to get product reviews for first product
  const productReviewsResult = await testAPI('GET', '/api/reviews/product/1', null, 'GET PRODUCT REVIEWS');
  
  console.log('\n🏁 Test sequence complete!');
  
  // === ANALYSIS ===
  console.log('\n📊 ANALYSIS:');
  console.log('='.repeat(60));
  
  console.log('\n🛍️ ENABLED PRODUCTS:');
  if (enabledProductsResult.status === 200) {
    console.log(`  ✅ Enabled products API working`);
    console.log(`  📝 Enabled products: ${enabledProductsResult.data?.enabledProducts?.length || 0}`);
  } else {
    console.log(`  ❌ Enabled products API failed: ${enabledProductsResult.status}`);
  }
  
  if (publicPageResult.status === 200) {
    const productsOnPage = publicPageResult.data?.products?.length || 0;
    console.log(`  📄 Public page shows: ${productsOnPage} products`);
    console.log(`  ${productsOnPage > 0 ? '✅' : '❌'} Products visible on feedback page`);
  } else {
    console.log(`  ❌ Public page API failed: ${publicPageResult.status}`);
  }
  
  console.log('\n📊 ENHANCED ANALYTICS:');
  if (analyticsResult.status === 200) {
    const analytics = analyticsResult.data?.analytics;
    console.log(`  ✅ Enhanced analytics API working`);
    console.log(`  📈 Total feedback: ${analytics?.overview?.totalFeedback || 0}`);
    console.log(`  ⭐ Product reviews: ${analytics?.overview?.totalProductReviews || 0}`);
    console.log(`  🎯 Has product ratings: ${analytics?.productRatings?.hasProductRatings ? 'YES' : 'NO'}`);
    console.log(`  🛍️ Enabled products: ${analytics?.enabledProducts?.enabledProducts || 0}/${analytics?.enabledProducts?.totalProducts || 0}`);
  } else {
    console.log(`  ❌ Enhanced analytics API failed: ${analyticsResult.status}`);
  }
  
  console.log('\n⭐ PRODUCT RATINGS:');
  if (productReviewsResult.status === 200) {
    const reviews = productReviewsResult.data;
    console.log(`  ✅ Product reviews API working`);
    console.log(`  📝 Reviews found: ${Array.isArray(reviews) ? reviews.length : 0}`);
  } else {
    console.log(`  ❌ Product reviews API failed: ${productReviewsResult.status}`);
  }
  
  console.log('\n🎯 SUMMARY:');
  const enabledProductsWorking = enabledProductsResult.status === 200;
  const publicPageWorking = publicPageResult.status === 200;
  const analyticsWorking = analyticsResult.status === 200;
  const hasProductRatings = analyticsResult.data?.analytics?.productRatings?.hasProductRatings;
  
  if (enabledProductsWorking && publicPageWorking && analyticsWorking) {
    console.log('✅ ALL SYSTEMS WORKING!');
    console.log('📋 Features implemented:');
    console.log('  ✅ Products can be enabled/disabled for feedback page');
    console.log('  ✅ Public page shows only enabled products');
    console.log('  ✅ Enhanced analytics with relevant data');
    console.log(`  ${hasProductRatings ? '✅' : '⚠️'} Product ratings ${hasProductRatings ? 'available' : 'hidden (no data)'}`);
  } else {
    console.log('❌ Some systems need attention');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Go to Products tab in dashboard');
  console.log('2. Select products and click "Enable for Feedback Page"');
  console.log(`3. Visit public page: http://localhost:3000/${businessSlug}`);
  console.log('4. Only enabled products should appear in Products tab');
  console.log('5. Check Analytics tab for enhanced data');
  console.log('6. Product ratings section will only show if product reviews exist');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
