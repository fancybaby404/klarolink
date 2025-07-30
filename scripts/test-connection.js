require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

async function testConnection() {
  console.log('🔍 Testing Neon database connection...')
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL)
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables')
    return
  }
  
  console.log('DATABASE_URL:', process.env.DATABASE_URL.substring(0, 50) + '...')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔌 Connecting to database...')
    const client = await pool.connect()
    
    console.log('✅ Connected successfully!')
    
    // Test basic query
    console.log('📊 Testing basic query...')
    const result = await client.query('SELECT NOW() as current_time')
    console.log('Current time from database:', result.rows[0].current_time)
    
    // Check if businesses table exists
    console.log('🏢 Checking if businesses table exists...')
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'businesses'
      );
    `)
    
    const tableExists = tableCheck.rows[0].exists
    console.log('Businesses table exists:', tableExists)
    
    if (tableExists) {
      // Count businesses
      const countResult = await client.query('SELECT COUNT(*) as count FROM businesses')
      console.log('Number of businesses in database:', countResult.rows[0].count)
      
      // List businesses
      const businessResult = await client.query('SELECT id, name, email, slug FROM businesses LIMIT 5')
      console.log('Businesses in database:')
      businessResult.rows.forEach(business => {
        console.log(`  - ID: ${business.id}, Name: ${business.name}, Email: ${business.email}, Slug: ${business.slug}`)
      })
    } else {
      console.log('⚠️ Businesses table does not exist. You may need to run the initialization script.')
    }
    
    client.release()
    console.log('✅ Database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await pool.end()
  }
}

testConnection()
