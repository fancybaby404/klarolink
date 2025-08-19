#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔍 Testing Neon Database Product Reviews...');
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

// Main test sequence
async function runTests() {
  console.log('🚀 Starting Neon Database Product Reviews Test...\n');

  // === TEST 0: CHECK PRODUCT REVIEWS SCHEMA ===
  const schemaResult = await testAPI('GET', '/api/debug/product-reviews-schema', null, 'CHECK PRODUCT REVIEWS SCHEMA');

  if (schemaResult.status === 200) {
    const schema = schemaResult.data;
    console.log('\n🗄️ DATABASE SCHEMA ANALYSIS:');
    console.log(`  product_reviews table exists: ${schema.analysis?.productReviewsTableExists ? '✅' : '❌'}`);
    console.log(`  products table exists: ${schema.analysis?.productsTableExists ? '✅' : '❌'}`);
    console.log(`  Reviews for business: ${schema.analysis?.hasReviewsForBusiness ? '✅' : '❌'}`);
    console.log(`  Standard JOIN works: ${schema.analysis?.standardJoinWorks ? '✅' : '❌'}`);
    console.log(`  Alternative JOIN works: ${schema.analysis?.alternativeJoinWorks ? '✅' : '❌'}`);

    if (schema.analysis?.issues?.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      schema.analysis.issues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (schema.recommendations?.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      schema.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    if (schema.sampleData?.reviews?.data?.length > 0) {
      console.log('\n📝 SAMPLE REVIEWS FOUND:');
      schema.sampleData.reviews.data.slice(0, 2).forEach((review, index) => {
        console.log(`  ${index + 1}. Product ID: ${review.product_id}, Rating: ${review.rating}/5`);
        console.log(`     Comment: "${review.comment?.substring(0, 50)}..."`);
      });
    }
  }

  // === TEST 1: GET ENHANCED ANALYTICS (should show product reviews) ===
  const analyticsResult = await testAPI('GET', '/api/analytics/enhanced', null, 'GET ENHANCED ANALYTICS');
  
  if (analyticsResult.status === 200) {
    const analytics = analyticsResult.data?.analytics;
    console.log('\n📊 ANALYTICS RESULTS:');
    console.log(`  Total feedback: ${analytics?.overview?.totalFeedback || 0}`);
    console.log(`  Total product reviews: ${analytics?.overview?.totalProductReviews || 0}`);
    console.log(`  Average product rating: ${analytics?.productRatings?.averageRating || 'N/A'}`);
    console.log(`  Has product ratings: ${analytics?.productRatings?.hasProductRatings ? '✅ YES' : '❌ NO'}`);
    
    if (analytics?.productRatings?.topRatedProducts?.length > 0) {
      console.log('\n🏆 TOP RATED PRODUCTS:');
      analytics.productRatings.topRatedProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.rating}/5 (${product.reviewCount} reviews)`);
      });
    }
    
    if (analytics?.recentActivity?.length > 0) {
      console.log('\n📋 RECENT ACTIVITY:');
      const productReviews = analytics.recentActivity.filter(a => a.type === 'product_review');
      console.log(`  Product reviews in recent activity: ${productReviews.length}`);
      productReviews.slice(0, 3).forEach((activity, index) => {
        console.log(`  ${index + 1}. ${activity.productName} - ${activity.rating}/5`);
      });
    }
  }
  
  // === TEST 2: GET PRODUCTS AND TEST INDIVIDUAL PRODUCT REVIEWS ===
  const dashboardResult = await testAPI('GET', '/api/dashboard', null, 'GET DASHBOARD DATA');
  
  if (dashboardResult.status === 200) {
    const products = dashboardResult.data?.products || [];
    console.log(`\n🛍️ FOUND ${products.length} PRODUCTS:`);
    
    // Test reviews for each product
    for (let i = 0; i < Math.min(products.length, 3); i++) {
      const product = products[i];
      console.log(`\n📦 Testing product: ${product.name} (ID: ${product.id})`);
      
      const reviewsResult = await testAPI('GET', `/api/reviews/product/${product.id}`, null, `GET REVIEWS FOR ${product.name}`);
      
      if (reviewsResult.status === 200) {
        const reviews = Array.isArray(reviewsResult.data) ? reviewsResult.data : [];
        console.log(`  📝 Reviews found: ${reviews.length}`);
        
        if (reviews.length > 0) {
          reviews.slice(0, 2).forEach((review, index) => {
            console.log(`    ${index + 1}. Rating: ${review.rating}/5`);
            console.log(`       Comment: "${review.comment?.substring(0, 60)}..."`);
            console.log(`       Date: ${new Date(review.created_at).toLocaleDateString()}`);
          });
        }
      } else {
        console.log(`  ❌ Failed to get reviews: ${reviewsResult.status}`);
      }
    }
  }
  
  // === TEST 3: TEST PRODUCT REVIEW SUBMISSION (to ensure API works) ===
  if (dashboardResult.data?.products?.length > 0) {
    const testProduct = dashboardResult.data.products[0];
    console.log(`\n🧪 TESTING REVIEW SUBMISSION FOR: ${testProduct.name}`);
    
    const testReview = {
      rating: 5,
      comment: "Test review from automated test - this product is excellent!",
      business_id: 9,
      user_id: 1
    };
    
    const submitResult = await testAPI('POST', `/api/reviews/product/${testProduct.id}`, testReview, 'SUBMIT TEST REVIEW');
    
    if (submitResult.status === 201) {
      console.log('  ✅ Review submission working');
      console.log(`  📝 Created review ID: ${submitResult.data?.id}`);
    } else {
      console.log(`  ❌ Review submission failed: ${submitResult.status}`);
      if (submitResult.data?.error) {
        console.log(`  Error: ${submitResult.data.error}`);
      }
    }
  }
  
  console.log('\n🏁 Test sequence complete!');
  
  // === FINAL ANALYSIS ===
  console.log('\n📊 FINAL ANALYSIS:');
  console.log('='.repeat(60));
  
  const analytics = analyticsResult.data?.analytics;
  const hasProductReviews = analytics?.overview?.totalProductReviews > 0;
  const hasProductRatings = analytics?.productRatings?.hasProductRatings;
  const analyticsWorking = analyticsResult.status === 200;
  
  console.log('\n🎯 NEON DATABASE INTEGRATION:');
  console.log(`  Analytics API: ${analyticsWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`  Product reviews found: ${hasProductReviews ? '✅ YES' : '❌ NO'}`);
  console.log(`  Product ratings section: ${hasProductRatings ? '✅ Will show' : '❌ Hidden'}`);
  
  if (hasProductReviews && hasProductRatings) {
    console.log('\n🎉 SUCCESS! Your manually added product reviews are working:');
    console.log(`  📊 ${analytics.overview.totalProductReviews} product reviews detected`);
    console.log(`  ⭐ Average rating: ${analytics.productRatings.averageRating}/5`);
    console.log(`  🏆 ${analytics.productRatings.topRatedProducts?.length || 0} products with ratings`);
    console.log('\n📋 What you should see in dashboard:');
    console.log('  ✅ Analytics tab shows "Product Ratings" section');
    console.log('  ✅ Top rated products list');
    console.log('  ✅ Recent activity includes product reviews');
    console.log('  ✅ Enhanced overview metrics');
  } else if (analyticsWorking && !hasProductReviews) {
    console.log('\n⚠️ ISSUE: Analytics working but no product reviews detected');
    console.log('📋 Possible causes:');
    console.log('  - Product reviews not linked to correct business_id');
    console.log('  - Product reviews not linked to existing products');
    console.log('  - Database query not finding the reviews');
    console.log('\n🔧 Check your product_reviews table:');
    console.log('  - Ensure business_id = 9');
    console.log('  - Ensure product_id matches existing products');
    console.log('  - Check column names match expected schema');
  } else {
    console.log('\n❌ ISSUE: Analytics API not working properly');
    console.log('📋 Check server logs for database connection errors');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Go to Analytics tab in your dashboard');
  console.log('2. Look for "Product Ratings" section');
  console.log('3. Check if your manually added reviews appear');
  console.log('4. Verify top rated products list');
  console.log('5. Check recent activity for product reviews');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
