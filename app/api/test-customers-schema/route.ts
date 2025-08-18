import { NextRequest, NextResponse } from "next/server"
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking customers table schema...')
    
    const client = await pool.connect()
    
    try {
      // Check if customers table exists and get its structure
      const tableExistsResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'customers'
        );
      `)
      
      const tableExists = tableExistsResult.rows[0].exists
      
      if (!tableExists) {
        return NextResponse.json({
          tableExists: false,
          message: 'Customers table does not exist',
          recommendation: 'Need to create customers table with required fields'
        })
      }
      
      // Get table structure
      const columnsResult = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        ORDER BY ordinal_position;
      `)
      
      // Get sample data
      const sampleDataResult = await client.query(`
        SELECT * FROM customers LIMIT 3;
      `)
      
      // Check constraints
      const constraintsResult = await client.query(`
        SELECT 
          tc.constraint_name, 
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_name = 'customers';
      `)
      
      return NextResponse.json({
        tableExists: true,
        columns: columnsResult.rows,
        sampleData: sampleDataResult.rows,
        constraints: constraintsResult.rows,
        analysis: {
          hasRequiredFields: {
            business_id: columnsResult.rows.some(col => col.column_name === 'business_id'),
            first_name: columnsResult.rows.some(col => col.column_name === 'first_name'),
            last_name: columnsResult.rows.some(col => col.column_name === 'last_name'),
            email: columnsResult.rows.some(col => col.column_name === 'email'),
            phone_number: columnsResult.rows.some(col => col.column_name === 'phone_number'),
            password: columnsResult.rows.some(col => col.column_name === 'password'),
            registration_date: columnsResult.rows.some(col => col.column_name === 'registration_date'),
            customer_status: columnsResult.rows.some(col => col.column_name === 'customer_status'),
            preferred_contact_method: columnsResult.rows.some(col => col.column_name === 'preferred_contact_method'),
            created_at: columnsResult.rows.some(col => col.column_name === 'created_at')
          },
          missingFields: []
        }
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error checking customers table:', error)
    return NextResponse.json({
      error: 'Failed to check customers table',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
