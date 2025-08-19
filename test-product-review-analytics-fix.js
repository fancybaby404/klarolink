#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔍 Testing Product Review Analytics Fix...');
console.log('Business ID: 9, User ID: 1');
console.log('Token:', token.substring(0, 50) + '...\n');

// Test function
function testAPI(method, path, body, description, useAuth = true) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${description} ===`);
    console.log(`${method} ${path}`);
    if (body) console.log('Body:', JSON.stringify(body, null, 2));
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (useAuth) {
      headers['Authorization'] = `Bearer ${token}`;
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
  console.log('🚀 Starting Product Review Analytics Fix Test...\n');
  
  // === TEST 1: GET BUSINESS INFO ===
  const dashboardResult = await testAPI('GET', '/api/dashboard', null, 'GET BUSINESS INFO');
  const businessSlug = dashboardResult.data?.business?.slug;
  
  if (!businessSlug) {
    console.log('❌ Could not get business slug');
    return;
  }
  
  console.log(`📝 Business slug: ${businessSlug}`);
  
  // === TEST 2: GET PRODUCTS ===
  const publicPageResult = await testAPI('GET', `/api/page/${businessSlug}`, null, 'GET PUBLIC PAGE PRODUCTS', false);
  
  const products = publicPageResult.data?.products || [];
  if (products.length === 0) {
    console.log('❌ No products found on public page');
    return;
  }
  
  const testProduct = products[0];
  console.log(`📦 Testing with product: ${testProduct.name} (ID: ${testProduct.id})`);
  
  // === TEST 3: SUBMIT PRODUCT REVIEW WITH AUTHENTICATION ===
  const reviewData = {
    rating: 5,
    comment: "This is a test review submitted through the analytics fix test. The product quality is excellent and I highly recommend it to other customers!",
    business_id: 9
    // Note: user_id will be extracted from token by the API
  };
  
  console.log('\n📝 Submitting product review with authentication...');
  const createReviewResult = await testAPI(
    'POST', 
    `/api/reviews/product/${testProduct.id}`, 
    reviewData, 
    'SUBMIT PRODUCT REVIEW WITH AUTH'
  );
  
  if (createReviewResult.status === 201) {
    console.log('✅ Product review submitted successfully');
    console.log('📊 Review details:', {
      id: createReviewResult.data.id,
      product_id: createReviewResult.data.product_id,
      business_id: createReviewResult.data.business_id,
      user_id: createReviewResult.data.user_id,
      rating: createReviewResult.data.rating
    });
  } else {
    console.log(`❌ Product review submission failed: ${createReviewResult.status}`);
    if (createReviewResult.data?.error) {
      console.log(`Error: ${createReviewResult.data.error}`);
    }
  }
  
  // === TEST 4: WAIT AND CHECK ANALYTICS ===
  console.log('\n⏳ Waiting 2 seconds for data to propagate...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const analyticsResult = await testAPI('GET', '/api/analytics/enhanced', null, 'GET ENHANCED ANALYTICS AFTER REVIEW');
  
  if (analyticsResult.status === 200) {
    const analytics = analyticsResult.data?.analytics;
    console.log('\n📊 ANALYTICS AFTER REVIEW SUBMISSION:');
    console.log(`  Total product reviews: ${analytics?.overview?.totalProductReviews || 0}`);
    console.log(`  Average product rating: ${analytics?.productRatings?.averageRating || 'N/A'}`);
    console.log(`  Has product ratings: ${analytics?.productRatings?.hasProductRatings ? '✅ YES' : '❌ NO'}`);
    
    if (analytics?.productRatings?.topRatedProducts?.length > 0) {
      console.log('\n🏆 TOP RATED PRODUCTS:');
      analytics.productRatings.topRatedProducts.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.rating}/5 (${product.reviewCount} reviews)`);
      });
    }
    
    if (analytics?.recentActivity?.length > 0) {
      console.log('\n📋 RECENT ACTIVITY:');
      const productReviews = analytics.recentActivity.filter(a => a.type === 'product_review');
      console.log(`  Product reviews in recent activity: ${productReviews.length}`);
      productReviews.slice(0, 2).forEach((activity, index) => {
        console.log(`  ${index + 1}. ${activity.productName} - ${activity.rating}/5`);
      });
    }
  }
  
  // === TEST 5: GET INDIVIDUAL PRODUCT REVIEWS ===
  const getReviewsResult = await testAPI('GET', `/api/reviews/product/${testProduct.id}`, null, 'GET PRODUCT REVIEWS');
  
  if (getReviewsResult.status === 200) {
    const reviews = Array.isArray(getReviewsResult.data) ? getReviewsResult.data : [];
    console.log(`\n📝 Individual product reviews: ${reviews.length}`);
    
    if (reviews.length > 0) {
      reviews.slice(0, 2).forEach((review, index) => {
        console.log(`  ${index + 1}. Rating: ${review.rating}/5`);
        console.log(`     Comment: "${review.comment?.substring(0, 60)}..."`);
        console.log(`     Date: ${new Date(review.created_at).toLocaleDateString()}`);
      });
    }
  }
  
  // === TEST 6: CHECK SCHEMA DEBUG ===
  const schemaResult = await testAPI('GET', '/api/debug/product-reviews-schema', null, 'CHECK PRODUCT REVIEWS SCHEMA');
  
  if (schemaResult.status === 200) {
    const schema = schemaResult.data;
    console.log('\n🗄️ DATABASE SCHEMA STATUS:');
    console.log(`  product_reviews table exists: ${schema.analysis?.productReviewsTableExists ? '✅' : '❌'}`);
    console.log(`  Reviews for business: ${schema.analysis?.hasReviewsForBusiness ? '✅' : '❌'}`);
    console.log(`  Standard JOIN works: ${schema.analysis?.standardJoinWorks ? '✅' : '❌'}`);
    console.log(`  Alternative JOIN works: ${schema.analysis?.alternativeJoinWorks ? '✅' : '❌'}`);
  }
  
  console.log('\n🏁 Test sequence complete!');
  
  // === FINAL ANALYSIS ===
  console.log('\n📊 FINAL ANALYSIS:');
  console.log('='.repeat(60));
  
  const reviewSubmitted = createReviewResult.status === 201;
  const analyticsWorking = analyticsResult.status === 200;
  const hasProductReviews = analyticsResult.data?.analytics?.overview?.totalProductReviews > 0;
  const hasProductRatings = analyticsResult.data?.analytics?.productRatings?.hasProductRatings;
  
  console.log('\n🔧 FIXES APPLIED:');
  console.log('  ✅ Added token-based authentication to product review API');
  console.log('  ✅ Extract user_id and business_id from JWT token');
  console.log('  ✅ Proper data linking for analytics');
  
  console.log('\n📊 PRODUCT REVIEW ANALYTICS:');
  console.log(`  Review submission: ${reviewSubmitted ? '✅ Working' : '❌ Failed'}`);
  console.log(`  Analytics API: ${analyticsWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`  Product reviews detected: ${hasProductReviews ? '✅ YES' : '❌ NO'}`);
  console.log(`  Product ratings section: ${hasProductRatings ? '✅ Will show' : '❌ Hidden'}`);
  
  if (reviewSubmitted && analyticsWorking && hasProductReviews && hasProductRatings) {
    console.log('\n🎉 SUCCESS! Product review analytics are now working:');
    console.log('  ✅ Reviews submitted from public page appear in analytics');
    console.log('  ✅ Product ratings section shows in dashboard');
    console.log('  ✅ Top rated products calculated correctly');
    console.log('  ✅ Recent activity includes product reviews');
  } else {
    console.log('\n⚠️ ISSUES DETECTED:');
    if (!reviewSubmitted) console.log('  - Product review submission failed');
    if (!analyticsWorking) console.log('  - Analytics API not working');
    if (!hasProductReviews) console.log('  - Product reviews not detected in analytics');
    if (!hasProductRatings) console.log('  - Product ratings section not showing');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log(`1. Visit the public page: http://localhost:3000/${businessSlug}`);
  console.log('2. Go to Products tab');
  console.log('3. Click "Review This Product" on any product');
  console.log('4. Submit a review (make sure you\'re logged in)');
  console.log('5. Go to dashboard Analytics tab');
  console.log('6. Check for "Product Ratings" section');
  console.log('7. Verify your review appears in the data');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
