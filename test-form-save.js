#!/usr/bin/env node

/**
 * Test script to verify form saving functionality
 */

const { default: fetch } = require('node-fetch');

async function testFormSave() {
  try {
    console.log('🧪 Testing form save functionality...');
    
    // First, login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@klarolink.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    const token = loginData.token;
    const businessId = loginData.business.id;

    // Test form save
    console.log('💾 Testing form save...');
    const formData = {
      business_id: businessId,
      title: 'Test Form Title',
      description: 'Test form description',
      fields: [
        {
          id: 'test_field',
          type: 'text',
          label: 'Test Field',
          required: true,
          placeholder: 'Enter test data'
        }
      ],
      preview_enabled: true
    };

    const saveResponse = await fetch('http://localhost:3000/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const saveData = await saveResponse.json();
    console.log('📝 Form save response:', saveData);

    if (saveResponse.ok) {
      console.log('✅ Form save successful!');
      
      // Verify the form was saved by fetching it back
      console.log('🔍 Verifying form was saved...');
      const dashboardResponse = await fetch('http://localhost:3000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('📊 Dashboard data:', {
          feedbackForm: dashboardData.feedbackForm
        });
        
        if (dashboardData.feedbackForm && dashboardData.feedbackForm.title === 'Test Form Title') {
          console.log('✅ Form persistence verified!');
        } else {
          console.log('❌ Form was not persisted correctly');
        }
      } else {
        console.log('❌ Failed to fetch dashboard data for verification');
      }
    } else {
      console.log('❌ Form save failed:', saveData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testFormSave();
}
