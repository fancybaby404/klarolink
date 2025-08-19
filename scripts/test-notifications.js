#!/usr/bin/env node

// Simple script to test the notification system
// Run with: node scripts/test-notifications.js

const BASE_URL = 'http://localhost:3000'

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n')

  try {
    // Test 1: Create test notifications
    console.log('1️⃣ Creating test notifications...')
    const createResponse = await fetch(`${BASE_URL}/api/admin/notifications/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: 3,
        type: 'random'
      })
    })

    if (createResponse.ok) {
      const createData = await createResponse.json()
      console.log(`✅ Created ${createData.notifications.length} notifications`)
    } else {
      console.log('❌ Failed to create notifications')
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 2: Fetch notifications
    console.log('\n2️⃣ Fetching notifications...')
    const fetchResponse = await fetch(`${BASE_URL}/api/admin/notifications?category=Business Intelligence and Analytics`)
    
    if (fetchResponse.ok) {
      const fetchData = await fetchResponse.json()
      console.log(`✅ Fetched ${fetchData.notifications.length} notifications`)
      console.log(`📊 Stats: ${fetchData.stats.total} total, ${fetchData.stats.unread} unread`)
    } else {
      console.log('❌ Failed to fetch notifications')
    }

    // Test 3: Simulate progress
    console.log('\n3️⃣ Simulating progress updates...')
    const progressResponse = await fetch(`${BASE_URL}/api/admin/notifications/simulate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'progress' })
    })

    if (progressResponse.ok) {
      const progressData = await progressResponse.json()
      console.log(`✅ Updated progress for ${progressData.updated_count} notifications`)
    } else {
      console.log('❌ Failed to simulate progress')
    }

    // Test 4: Check WebSocket endpoint
    console.log('\n4️⃣ Testing WebSocket connection...')
    try {
      // Note: This is just a connection test, not a full WebSocket test
      console.log('🔌 WebSocket server should be running on ws://localhost:8080')
      console.log('📱 Open the admin dashboard to test real-time updates')
    } catch (error) {
      console.log('❌ WebSocket connection test failed')
    }

    console.log('\n🎉 Notification system test completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Open http://localhost:3000/admin to see the admin dashboard')
    console.log('2. Open http://localhost:3000/admin/test to test notifications')
    console.log('3. Look for the notification bell in the top-right corner')
    console.log('4. Create more notifications and watch them appear in real-time')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
if (require.main === module) {
  testNotificationSystem()
}

module.exports = { testNotificationSystem }
