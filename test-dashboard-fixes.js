#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a test token
const token = jwt.sign(
  { businessId: 9, userId: 1 }, 
  'your-secret-key'
);

console.log('🔍 Testing Dashboard Fixes...');
console.log('Business ID: 9');
console.log('Token:', token.substring(0, 50) + '...\n');

// Test function
function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${description} ===`);
    console.log(`Testing: ${path}`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
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
          
          if (res.statusCode === 200) {
            // Extract key information based on endpoint
            if (path.includes('comprehensive-test')) {
              console.log('\n📊 COMPREHENSIVE TEST RESULTS:');
              console.log(`Products working: ${result.summary?.productsWorking ? '✅' : '❌'}`);
              console.log(`Passives working: ${result.summary?.passivesWorking ? '✅' : '❌'}`);
              console.log(`Overall status: ${result.summary?.overallStatus}`);
              
              if (result.tests?.products) {
                console.log(`\n🛍️ Products Test:`);
                console.log(`  Direct query: ${result.tests.products.directQuery.count} products found`);
                console.log(`  Adapter method: ${result.tests.products.adapterMethod.count} products returned`);
                if (result.tests.products.directQuery.error) {
                  console.log(`  Direct query error: ${result.tests.products.directQuery.error}`);
                }
                if (result.tests.products.adapterMethod.error) {
                  console.log(`  Adapter error: ${result.tests.products.adapterMethod.error}`);
                }
              }
              
              if (result.tests?.audience) {
                console.log(`\n👥 Audience Test:`);
                console.log(`  Feedback submissions: ${result.tests.audience.feedbackSubmissions.count}`);
                console.log(`  Ratings extracted: ${result.tests.audience.dataExtraction.ratingsFound}`);
                console.log(`  Customer profiles: ${result.tests.audience.customerProfiles.count}`);
                console.log(`  Passives found: ${result.tests.audience.passivesCalculation.passives}`);
                console.log(`  Promoters found: ${result.tests.audience.passivesCalculation.promoters}`);
                console.log(`  Detractors found: ${result.tests.audience.passivesCalculation.detractors}`);
              }
              
              if (result.quickFixes && result.quickFixes.length > 0) {
                console.log(`\n🔧 Quick Fixes Needed:`);
                result.quickFixes.forEach((fix, index) => {
                  console.log(`  ${index + 1}. ${fix.issue}`);
                  console.log(`     Fix: ${fix.fix}`);
                  console.log(`     Action: ${fix.action}`);
                });
              }
              
            } else if (path.includes('products-investigation')) {
              console.log('\n🛍️ PRODUCTS INVESTIGATION:');
              console.log(`Table exists: ${result.investigation?.tableCheck?.exists ? '✅' : '❌'}`);
              console.log(`Total products: ${result.investigation?.directQuery?.totalProducts || 0}`);
              console.log(`Products for business: ${result.investigation?.businessQuery?.productsForBusiness || 0}`);
              console.log(`Adapter returned: ${result.investigation?.adapterTest?.productsReturned || 0}`);
              
              if (result.diagnosis?.possibleIssues?.length > 0) {
                console.log('\n❌ Issues found:');
                result.diagnosis.possibleIssues.forEach(issue => console.log(`  - ${issue}`));
              }
              
            } else {
              // Generic response
              console.log('Response keys:', Object.keys(result));
              if (result.error) {
                console.log(`❌ Error: ${result.error}`);
              }
            }
          } else {
            console.log(`❌ Error response: ${data}`);
          }
          
          resolve(result);
        } catch (e) {
          console.log('❌ Failed to parse JSON response');
          console.log('Raw response:', data);
          resolve({ error: 'Invalid JSON response', raw: data });
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

    req.end();
  });
}

// Main test sequence
async function runTests() {
  console.log('🚀 Starting Dashboard Fixes Test Sequence...\n');
  
  // Test 1: Comprehensive test (covers both issues)
  await testEndpoint('/api/debug/comprehensive-test', 'COMPREHENSIVE TEST');
  
  // Test 2: Products investigation (detailed products analysis)
  await testEndpoint('/api/debug/products-investigation', 'PRODUCTS INVESTIGATION');
  
  // Test 3: Try the actual products API
  await testEndpoint('/api/product-management?businessId=9', 'ACTUAL PRODUCTS API');
  
  // Test 4: Try the actual audience API
  await testEndpoint('/api/audience', 'ACTUAL AUDIENCE API');
  
  console.log('\n🏁 Test sequence complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. If products are still empty, check if business_id column exists in products table');
  console.log('2. If passives are still 0, run: POST /api/debug/insert-sample-data');
  console.log('3. Check the dashboard pages to see if issues are resolved');
  console.log('4. Review server logs for detailed debugging information');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
