#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔍 Testing Product Disable Functionality...');
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
  console.log('🚀 Starting Product Disable Test...\n');
  
  // === TEST 1: GET BUSINESS INFO ===
  const dashboardResult = await testAPI('GET', '/api/dashboard', null, 'GET BUSINESS INFO');
  const businessSlug = dashboardResult.data?.business?.slug;
  
  if (!businessSlug) {
    console.log('❌ Could not get business slug');
    return;
  }
  
  console.log(`📝 Business slug: ${businessSlug}`);
  
  // === TEST 2: GET CURRENT ENABLED PRODUCTS ===
  const currentEnabledResult = await testAPI('GET', '/api/products/enabled', null, 'GET CURRENT ENABLED PRODUCTS');
  
  if (currentEnabledResult.status === 200) {
    const currentEnabled = currentEnabledResult.data.enabledProducts || [];
    console.log(`📊 Currently enabled products: ${currentEnabled.length}`);
    console.log('Current enabled IDs:', currentEnabled);
  }
  
  // === TEST 3: DISABLE ALL PRODUCTS (empty array) ===
  console.log('\n🚫 Testing: Disable all products...');
  
  const disableAllResult = await testAPI('POST', '/api/products/enabled', {
    enabledProductIds: [] // Empty array = disable all
  }, 'DISABLE ALL PRODUCTS');
  
  if (disableAllResult.status === 200) {
    console.log('✅ Disable all API call successful');
    console.log('Response:', disableAllResult.data);
  } else {
    console.log(`❌ Disable all failed: ${disableAllResult.status}`);
    if (disableAllResult.data?.error) {
      console.log('Error:', disableAllResult.data.error);
    }
  }
  
  // === TEST 4: VERIFY PRODUCTS ARE DISABLED ===
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  const verifyDisabledResult = await testAPI('GET', '/api/products/enabled', null, 'VERIFY PRODUCTS DISABLED');
  
  if (verifyDisabledResult.status === 200) {
    const enabledAfterDisable = verifyDisabledResult.data.enabledProducts || [];
    console.log(`📊 Enabled products after disable: ${enabledAfterDisable.length}`);
    console.log('Enabled IDs after disable:', enabledAfterDisable);
    
    if (enabledAfterDisable.length === 0) {
      console.log('✅ CORRECT: All products successfully disabled');
    } else {
      console.log('❌ ISSUE: Some products still enabled after disable');
    }
  }
  
  // === TEST 5: CHECK PUBLIC PAGE (should show no products) ===
  const publicPageResult = await testPublicAPI('GET', `/api/page/${businessSlug}`, null, 'PUBLIC PAGE - NO PRODUCTS');
  
  if (publicPageResult.status === 200) {
    const products = publicPageResult.data?.products || [];
    console.log(`📦 Products on public page: ${products.length}`);
    
    if (products.length === 0) {
      console.log('✅ CORRECT: No products shown on public page');
    } else {
      console.log('❌ ISSUE: Products still showing on public page');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`);
      });
    }
  }
  
  // === TEST 6: ENABLE SOME PRODUCTS ===
  console.log('\n✅ Testing: Enable some products...');
  
  const enableSomeResult = await testAPI('POST', '/api/products/enabled', {
    enabledProductIds: [1, 2] // Enable first 2 products
  }, 'ENABLE SOME PRODUCTS');
  
  if (enableSomeResult.status === 200) {
    console.log('✅ Enable some API call successful');
    console.log('Response:', enableSomeResult.data);
  } else {
    console.log(`❌ Enable some failed: ${enableSomeResult.status}`);
  }
  
  // === TEST 7: VERIFY SOME PRODUCTS ARE ENABLED ===
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  const verifyEnabledResult = await testAPI('GET', '/api/products/enabled', null, 'VERIFY SOME PRODUCTS ENABLED');
  
  if (verifyEnabledResult.status === 200) {
    const enabledAfterEnable = verifyEnabledResult.data.enabledProducts || [];
    console.log(`📊 Enabled products after enable: ${enabledAfterEnable.length}`);
    console.log('Enabled IDs after enable:', enabledAfterEnable);
    
    if (enabledAfterEnable.length === 2 && enabledAfterEnable.includes(1) && enabledAfterEnable.includes(2)) {
      console.log('✅ CORRECT: Products 1 and 2 successfully enabled');
    } else {
      console.log('❌ ISSUE: Enabled products do not match expected');
    }
  }
  
  // === TEST 8: CHECK PUBLIC PAGE (should show enabled products) ===
  const publicPageWithProductsResult = await testPublicAPI('GET', `/api/page/${businessSlug}`, null, 'PUBLIC PAGE - WITH PRODUCTS');
  
  if (publicPageWithProductsResult.status === 200) {
    const products = publicPageWithProductsResult.data?.products || [];
    console.log(`📦 Products on public page: ${products.length}`);
    
    if (products.length === 2) {
      console.log('✅ CORRECT: 2 products shown on public page');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    } else {
      console.log('❌ ISSUE: Wrong number of products on public page');
    }
  }
  
  console.log('\n🏁 Test sequence complete!');
  
  // === FINAL ANALYSIS ===
  console.log('\n📊 FINAL ANALYSIS:');
  console.log('='.repeat(60));
  
  const disableWorked = disableAllResult.status === 200;
  const enableWorked = enableSomeResult.status === 200;
  const verificationWorked = verifyDisabledResult.status === 200 && verifyEnabledResult.status === 200;
  const publicPageWorked = publicPageResult.status === 200 && publicPageWithProductsResult.status === 200;
  
  console.log('\n🎯 API FUNCTIONALITY:');
  console.log(`  Disable all products: ${disableWorked ? '✅ Working' : '❌ Failed'}`);
  console.log(`  Enable some products: ${enableWorked ? '✅ Working' : '❌ Failed'}`);
  console.log(`  State verification: ${verificationWorked ? '✅ Working' : '❌ Failed'}`);
  console.log(`  Public page updates: ${publicPageWorked ? '✅ Working' : '❌ Failed'}`);
  
  console.log('\n🔍 SPECIFIC ISSUES:');
  const disabledCorrectly = verifyDisabledResult.data?.enabledProducts?.length === 0;
  const enabledCorrectly = verifyEnabledResult.data?.enabledProducts?.length === 2;
  const publicPageEmpty = publicPageResult.data?.products?.length === 0;
  const publicPageHasProducts = publicPageWithProductsResult.data?.products?.length === 2;
  
  console.log(`  All products disabled correctly: ${disabledCorrectly ? '✅' : '❌'}`);
  console.log(`  Some products enabled correctly: ${enabledCorrectly ? '✅' : '❌'}`);
  console.log(`  Public page empty when disabled: ${publicPageEmpty ? '✅' : '❌'}`);
  console.log(`  Public page shows enabled products: ${publicPageHasProducts ? '✅' : '❌'}`);
  
  if (disableWorked && enableWorked && disabledCorrectly && enabledCorrectly) {
    console.log('\n🎉 SUCCESS! Product disable/enable functionality working correctly');
    console.log('📋 The issue might be in the frontend state management');
    console.log('📋 Check browser console for frontend errors');
  } else {
    console.log('\n❌ ISSUES DETECTED:');
    if (!disableWorked) console.log('  - API disable call failed');
    if (!enableWorked) console.log('  - API enable call failed');
    if (!disabledCorrectly) console.log('  - Products not properly disabled in database');
    if (!enabledCorrectly) console.log('  - Products not properly enabled in database');
  }
  
  console.log('\n📋 MANUAL TESTING STEPS:');
  console.log('1. Go to Dashboard → Products tab');
  console.log('2. Deselect all products (uncheck all)');
  console.log('3. Click "Disable Products Tab" button');
  console.log('4. Check browser console for any errors');
  console.log('5. Refresh the page and verify selection state');
  console.log(`6. Visit public page: http://localhost:3000/${businessSlug}`);
  console.log('7. Verify no Products tab is shown');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
