// Test script to verify the products API fixes
// Run this with: node test-products-api.js

const BASE_URL = 'http://localhost:3000'; // Adjust if your app runs on a different port

async function testProductsAPI() {
  console.log('🧪 Testing Products API fixes...\n');

  try {
    // Test 1: GET /api/products?businessId=9
    console.log('1️⃣ Testing GET /api/products?businessId=9');
    const response1 = await fetch(`${BASE_URL}/api/products?businessId=9`);
    console.log(`Status: ${response1.status}`);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Success! Sample response:', JSON.stringify(data1.slice(0, 1), null, 2));
    } else {
      const error1 = await response1.text();
      console.log('❌ Error:', error1);
    }
    console.log('');

    // Test 2: GET /api/products/9
    console.log('2️⃣ Testing GET /api/products/9');
    const response2 = await fetch(`${BASE_URL}/api/products/9`);
    console.log(`Status: ${response2.status}`);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Success! Sample response:', JSON.stringify(data2.slice(0, 1), null, 2));
    } else {
      const error2 = await response2.text();
      console.log('❌ Error:', error2);
    }
    console.log('');

    // Test 3: Check database structure
    console.log('3️⃣ Testing database structure check');
    const response3 = await fetch(`${BASE_URL}/api/database/check`);
    console.log(`Status: ${response3.status}`);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Database structure:', JSON.stringify(data3, null, 2));
    } else {
      const error3 = await response3.text();
      console.log('❌ Error:', error3);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testProductsAPI();
