#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔍 Testing Product Review Fix...');
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
          if (res.statusCode === 201) {
            console.log('Review created:', {
              id: result.id,
              product_id: result.product_id,
              rating: result.rating,
              comment: result.comment?.substring(0, 50) + '...'
            });
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
  console.log('🚀 Starting Product Review Fix Test...\n');
  
  // Get business slug first
  const dashboardResult = await testAPI('GET', '/api/dashboard', null, 'GET BUSINESS INFO');
  const businessSlug = dashboardResult.data?.business?.slug;
  
  if (!businessSlug) {
    console.log('❌ Could not get business slug');
    return;
  }
  
  console.log(`📝 Business slug: ${businessSlug}`);
  
  // === TEST 1: GET PRODUCTS ON PUBLIC PAGE ===
  const publicPageResult = await testPublicAPI('GET', `/api/page/${businessSlug}`, null, 'GET PUBLIC PAGE PRODUCTS');
  
  const products = publicPageResult.data?.products || [];
  if (products.length === 0) {
    console.log('❌ No products found on public page');
    return;
  }
  
  const testProduct = products[0];
  console.log(`📦 Testing with product: ${testProduct.name} (ID: ${testProduct.id})`);
  
  // === TEST 2: CREATE PRODUCT REVIEW ===
  const reviewData = {
    rating: 4,
    comment: "This is a test review for the product. The quality is good and I would recommend it to others.",
    business_id: 9,
    user_id: 1
  };
  
  const createReviewResult = await testAPI(
    'POST', 
    `/api/reviews/product/${testProduct.id}`, 
    reviewData, 
    'CREATE PRODUCT REVIEW'
  );
  
  // === TEST 3: GET PRODUCT REVIEWS ===
  const getReviewsResult = await testAPI(
    'GET', 
    `/api/reviews/product/${testProduct.id}`, 
    null, 
    'GET PRODUCT REVIEWS'
  );
  
  // === TEST 4: TEST ENHANCED ANALYTICS (should now include product reviews) ===
  const analyticsResult = await testAPI('GET', '/api/analytics/enhanced', null, 'GET ENHANCED ANALYTICS');
  
  console.log('\n🏁 Test sequence complete!');
  
  // === ANALYSIS ===
  console.log('\n📊 ANALYSIS:');
  console.log('='.repeat(60));
  
  console.log('\n📦 PRODUCTS:');
  console.log(`  Products on public page: ${products.length}`);
  console.log(`  Test product: ${testProduct.name} (ID: ${testProduct.id})`);
  
  console.log('\n⭐ PRODUCT REVIEW CREATION:');
  if (createReviewResult.status === 201) {
    console.log('  ✅ Product review creation working');
    console.log(`  📝 Review ID: ${createReviewResult.data?.id}`);
    console.log(`  ⭐ Rating: ${createReviewResult.data?.rating}/5`);
  } else {
    console.log(`  ❌ Product review creation failed: ${createReviewResult.status}`);
    if (createReviewResult.data?.error) {
      console.log(`  Error: ${createReviewResult.data.error}`);
    }
  }
  
  console.log('\n📋 PRODUCT REVIEW RETRIEVAL:');
  if (getReviewsResult.status === 200) {
    const reviews = Array.isArray(getReviewsResult.data) ? getReviewsResult.data : [];
    console.log(`  ✅ Product review retrieval working`);
    console.log(`  📝 Reviews found: ${reviews.length}`);
  } else {
    console.log(`  ❌ Product review retrieval failed: ${getReviewsResult.status}`);
  }
  
  console.log('\n📊 ENHANCED ANALYTICS:');
  if (analyticsResult.status === 200) {
    const analytics = analyticsResult.data?.analytics;
    console.log(`  ✅ Enhanced analytics working`);
    console.log(`  📈 Total product reviews: ${analytics?.overview?.totalProductReviews || 0}`);
    console.log(`  ⭐ Has product ratings: ${analytics?.productRatings?.hasProductRatings ? 'YES' : 'NO'}`);
    console.log(`  📊 Average product rating: ${analytics?.productRatings?.averageRating || 'N/A'}`);
  } else {
    console.log(`  ❌ Enhanced analytics failed: ${analyticsResult.status}`);
  }
  
  console.log('\n🎯 SUMMARY:');
  const reviewCreationWorking = createReviewResult.status === 201;
  const reviewRetrievalWorking = getReviewsResult.status === 200;
  const analyticsWorking = analyticsResult.status === 200;
  
  if (reviewCreationWorking && reviewRetrievalWorking && analyticsWorking) {
    console.log('✅ ALL SYSTEMS WORKING!');
    console.log('📋 Product review functionality:');
    console.log('  ✅ "Review This Product" button should now work');
    console.log('  ✅ Product review modal should open');
    console.log('  ✅ Reviews can be submitted successfully');
    console.log('  ✅ Analytics will show product ratings (if reviews exist)');
  } else {
    console.log('❌ Some systems need attention');
    if (!reviewCreationWorking) console.log('  - Product review creation needs fixing');
    if (!reviewRetrievalWorking) console.log('  - Product review retrieval needs fixing');
    if (!analyticsWorking) console.log('  - Enhanced analytics needs fixing');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log(`1. Visit the public page: http://localhost:3000/${businessSlug}`);
  console.log('2. Go to Products tab');
  console.log('3. Click "Review This Product" on any product');
  console.log('4. Fill out the review form and submit');
  console.log('5. Check Analytics tab for product ratings data');
  console.log('6. Product ratings section should appear if reviews exist');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
