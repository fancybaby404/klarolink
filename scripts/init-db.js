require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function initializeDatabase() {
  console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('Connecting to database...')
    const client = await pool.connect()
    
    console.log('Reading SQL file...')
    const sqlFile = path.join(__dirname, 'neon-init-complete.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    console.log('Executing SQL...')
    await client.query(sql)
    
    console.log('Database initialized successfully!')
    client.release()
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    await pool.end()
  }
}

initializeDatabase()
