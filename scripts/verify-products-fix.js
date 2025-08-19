#!/usr/bin/env node

/**
 * Verification script for products database fixes
 * Tests the main endpoints that were failing
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const BUSINESS_ID = 9;

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test functions
async function testProductsEndpoint() {
  console.log('\n🧪 Testing Products Endpoint...');
  console.log('=' .repeat(50));
  
  try {
    const url = `${BASE_URL}/api/product-management?businessId=${BUSINESS_ID}`;
    console.log(`📡 GET ${url}`);
    
    const response = await makeRequest(url);
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: Products endpoint is working!');
      console.log(`📦 Products found: ${response.data.products?.length || 0}`);
      
      if (response.data.products?.length > 0) {
        console.log('📋 Sample product:');
        console.log(JSON.stringify(response.data.products[0], null, 2));
      }
    } else {
      console.log('❌ FAILED: Products endpoint returned error');
      console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    }
    
    return response.status === 200;
  } catch (error) {
    console.log('❌ ERROR: Failed to test products endpoint');
    console.log('🔍 Error:', error.message);
    return false;
  }
}

async function testSchemaEndpoint() {
  console.log('\n🔍 Testing Schema Verification...');
  console.log('=' .repeat(50));
  
  try {
    const url = `${BASE_URL}/api/test-products-schema`;
    console.log(`📡 GET ${url}`);
    
    const response = await makeRequest(url);
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: Schema endpoint is working!');
      console.log(`🗃️ Table exists: ${response.data.tableExists}`);
      
      if (response.data.columns) {
        console.log('📋 Database columns:');
        response.data.columns.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`);
        });
      }
      
      if (response.data.businessProducts) {
        console.log(`📦 Products for business ${BUSINESS_ID}: ${response.data.businessProducts.count}`);
        if (response.data.businessProducts.error) {
          console.log(`⚠️ Error: ${response.data.businessProducts.error}`);
        }
      }
    } else {
      console.log('❌ FAILED: Schema endpoint returned error');
      console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    }
    
    return response.status === 200;
  } catch (error) {
    console.log('❌ ERROR: Failed to test schema endpoint');
    console.log('🔍 Error:', error.message);
    return false;
  }
}

async function testAlternativeProductsEndpoint() {
  console.log('\n🧪 Testing Alternative Products Endpoint...');
  console.log('=' .repeat(50));
  
  try {
    const url = `${BASE_URL}/api/products?businessId=${BUSINESS_ID}`;
    console.log(`📡 GET ${url}`);
    
    const response = await makeRequest(url);
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: Alternative products endpoint is working!');
      console.log(`📦 Products found: ${response.data.products?.length || 0}`);
    } else {
      console.log('❌ FAILED: Alternative products endpoint returned error');
      console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    }
    
    return response.status === 200;
  } catch (error) {
    console.log('❌ ERROR: Failed to test alternative products endpoint');
    console.log('🔍 Error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Products Database Fix Verification');
  console.log('=' .repeat(50));
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🏢 Business ID: ${BUSINESS_ID}`);
  
  const results = [];
  
  // Run tests
  results.push(await testSchemaEndpoint());
  results.push(await testProductsEndpoint());
  results.push(await testAlternativeProductsEndpoint());
  
  // Summary
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Products fix is working correctly.');
  } else {
    console.log(`⚠️ ${passed}/${total} tests passed. Some issues may remain.`);
  }
  
  console.log('\n💡 Next Steps:');
  if (passed === total) {
    console.log('   ✅ Products functionality is fully restored');
    console.log('   ✅ You can now fetch products for business ID 9');
    console.log('   ✅ All CRUD operations should work correctly');
  } else {
    console.log('   🔧 Check server logs for detailed error messages');
    console.log('   🔧 Verify database connection and schema');
    console.log('   🔧 Run: npm run dev (if not already running)');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the verification
main().catch(console.error);
