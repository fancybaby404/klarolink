#!/usr/bin/env node

const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_J1gloZUcFQS2@ep-still-truth-a1051s4o-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].postgres_version.split(' ')[0]);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:');
    if (tablesResult.rows.length === 0) {
      console.log('   No tables found. Database needs to be initialized.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    // Check businesses table if it exists
    try {
      const businessCount = await client.query('SELECT COUNT(*) as count FROM businesses');
      console.log(`👥 Businesses in database: ${businessCount.rows[0].count}`);
      
      if (businessCount.rows[0].count > 0) {
        const businesses = await client.query('SELECT id, name, email, slug FROM businesses LIMIT 5');
        console.log('📊 Sample businesses:');
        businesses.rows.forEach(business => {
          console.log(`   - ID: ${business.id}, Name: ${business.name}, Slug: ${business.slug}`);
        });
      }
    } catch (error) {
      console.log('⚠️  Businesses table not found or empty');
    }
    
    client.release();
    console.log('✅ Database connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 This might be a network connectivity issue');
    } else if (error.code === '28P01') {
      console.log('💡 This appears to be an authentication issue - check your credentials');
    } else if (error.code === '3D000') {
      console.log('💡 Database does not exist');
    }
    
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('🎉 Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed');
      process.exit(1);
    });
}

module.exports = { testConnection };
