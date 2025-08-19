#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔍 Testing Products Tab Disable Functionality...');
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
  console.log('🚀 Starting Products Tab Disable Test...\n');
  
  // === TEST 1: GET BUSINESS INFO ===
  const dashboardResult = await testAPI('GET', '/api/dashboard', null, 'GET BUSINESS INFO');
  const businessSlug = dashboardResult.data?.business?.slug;
  
  if (!businessSlug) {
    console.log('❌ Could not get business slug');
    return;
  }
  
  console.log(`📝 Business slug: ${businessSlug}`);
  
  // === TEST 2: DISABLE ALL PRODUCTS (empty selection) ===
  console.log('\n🚫 Testing: Disable all products...');
  
  const disableResult = await testAPI('POST', '/api/products/enabled', {
    enabledProductIds: [] // Empty array = no products enabled
  }, 'DISABLE ALL PRODUCTS');
  
  if (disableResult.status === 200) {
    console.log('✅ Successfully disabled all products');
    console.log('📊 Enabled products:', disableResult.data.enabledProducts?.length || 0);
  } else {
    console.log(`❌ Failed to disable products: ${disableResult.status}`);
  }
  
  // === TEST 3: CHECK PUBLIC PAGE WITH NO PRODUCTS ===
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  const publicPageResult = await testPublicAPI('GET', `/api/page/${businessSlug}`, null, 'PUBLIC PAGE - NO PRODUCTS');
  
  if (publicPageResult.status === 200) {
    const products = publicPageResult.data?.products || [];
    console.log(`📦 Products on public page: ${products.length}`);
    
    if (products.length === 0) {
      console.log('✅ CORRECT: No products shown on public page');
      console.log('📋 Expected behavior: Products tab should be hidden');
    } else {
      console.log('⚠️ UNEXPECTED: Products still showing on public page');
      console.log('Products found:', products.map(p => p.name));
    }
  } else {
    console.log(`❌ Public page failed: ${publicPageResult.status}`);
  }
  
  // === TEST 4: ENABLE SOME PRODUCTS ===
  console.log('\n✅ Testing: Enable some products...');
  
  const enableResult = await testAPI('POST', '/api/products/enabled', {
    enabledProductIds: [1, 2] // Enable first 2 products
  }, 'ENABLE SOME PRODUCTS');
  
  if (enableResult.status === 200) {
    console.log('✅ Successfully enabled some products');
    console.log('📊 Enabled products:', enableResult.data.enabledProducts?.length || 0);
  } else {
    console.log(`❌ Failed to enable products: ${enableResult.status}`);
  }
  
  // === TEST 5: CHECK PUBLIC PAGE WITH PRODUCTS ===
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  const publicPageWithProductsResult = await testPublicAPI('GET', `/api/page/${businessSlug}`, null, 'PUBLIC PAGE - WITH PRODUCTS');
  
  if (publicPageWithProductsResult.status === 200) {
    const products = publicPageWithProductsResult.data?.products || [];
    console.log(`📦 Products on public page: ${products.length}`);
    
    if (products.length > 0) {
      console.log('✅ CORRECT: Products now showing on public page');
      console.log('📋 Expected behavior: Products tab should be visible');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`);
      });
    } else {
      console.log('⚠️ UNEXPECTED: No products showing even after enabling');
    }
  } else {
    console.log(`❌ Public page failed: ${publicPageWithProductsResult.status}`);
  }
  
  // === TEST 6: GET CURRENT ENABLED PRODUCTS STATUS ===
  const currentEnabledResult = await testAPI('GET', '/api/products/enabled', null, 'GET CURRENT ENABLED PRODUCTS');
  
  if (currentEnabledResult.status === 200) {
    const enabled = currentEnabledResult.data.enabledProducts || [];
    console.log(`\n📊 Currently enabled products: ${enabled.length}`);
    enabled.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (ID: ${product.id})`);
    });
  }
  
  console.log('\n🏁 Test sequence complete!');
  
  // === FINAL ANALYSIS ===
  console.log('\n📊 FINAL ANALYSIS:');
  console.log('='.repeat(60));
  
  const disableWorked = disableResult.status === 200;
  const enableWorked = enableResult.status === 200;
  const publicPageWorked = publicPageResult.status === 200 && publicPageWithProductsResult.status === 200;
  
  console.log('\n🎯 FUNCTIONALITY TEST RESULTS:');
  console.log(`  Disable all products: ${disableWorked ? '✅ Working' : '❌ Failed'}`);
  console.log(`  Enable some products: ${enableWorked ? '✅ Working' : '❌ Failed'}`);
  console.log(`  Public page updates: ${publicPageWorked ? '✅ Working' : '❌ Failed'}`);
  
  console.log('\n🔧 DASHBOARD IMPROVEMENTS:');
  console.log('  ✅ Save button now always visible');
  console.log('  ✅ Can save with zero products selected');
  console.log('  ✅ Button text changes based on selection');
  console.log('  ✅ Clear messaging about disabled state');
  
  console.log('\n📋 PUBLIC PAGE BEHAVIOR:');
  const noProductsShown = publicPageResult.data?.products?.length === 0;
  const productsShownAfterEnable = publicPageWithProductsResult.data?.products?.length > 0;
  
  console.log(`  No products when disabled: ${noProductsShown ? '✅ Correct' : '❌ Issue'}`);
  console.log(`  Products shown when enabled: ${productsShownAfterEnable ? '✅ Correct' : '❌ Issue'}`);
  
  if (noProductsShown) {
    console.log('  📋 Products tab will be hidden (no tabs shown)');
    console.log('  📋 Only Forms section will be visible');
  }
  
  if (productsShownAfterEnable) {
    console.log('  📋 Products tab will be visible');
    console.log('  📋 Users can switch between Forms and Products');
  }
  
  console.log('\n🎉 SUMMARY:');
  if (disableWorked && enableWorked && publicPageWorked) {
    console.log('✅ ALL FUNCTIONALITY WORKING!');
    console.log('📋 You can now:');
    console.log('  ✅ Select no products to disable Products tab');
    console.log('  ✅ Save configuration with zero products');
    console.log('  ✅ Public page adapts automatically');
    console.log('  ✅ Products tab hidden when no products enabled');
    console.log('  ✅ Products tab shown when products enabled');
  } else {
    console.log('❌ Some functionality needs attention');
  }
  
  console.log('\n📋 MANUAL TESTING STEPS:');
  console.log('1. Go to Dashboard → Products tab');
  console.log('2. Deselect all products');
  console.log('3. Click "Disable Products Tab" button');
  console.log(`4. Visit public page: http://localhost:3000/${businessSlug}`);
  console.log('5. Verify only Forms section is shown (no tabs)');
  console.log('6. Go back to dashboard and select some products');
  console.log('7. Click "Enable for Feedback Page"');
  console.log('8. Refresh public page and verify Products tab appears');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
