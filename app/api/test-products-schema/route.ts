import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing products table schema...')
    
    // Check if products table exists and get its structure
    const tableExistsResult = await db.query!(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      )`
    )
    
    const tableExists = tableExistsResult[0].exists
    
    if (!tableExists) {
      return NextResponse.json({
        tableExists: false,
        message: 'Products table does not exist',
        recommendation: 'Need to create products table with required fields'
      })
    }
    
    // Get table structure
    const columnsResult = await db.query!(
      `SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position`
    )
    
    // Test a simple query to see what columns actually exist
    let testQueryResult = null
    let testQueryError = null
    
    try {
      testQueryResult = await db.query!(
        `SELECT * FROM products LIMIT 1`
      )
    } catch (error: any) {
      testQueryError = error.message
    }
    
    // Try to get count of products for business 9
    let businessProductsCount = 0
    let businessProductsError = null
    
    try {
      const countResult = await db.query!(
        `SELECT COUNT(*) as count FROM products WHERE business_id = $1`,
        [9]
      )
      businessProductsCount = countResult[0].count
    } catch (error: any) {
      businessProductsError = error.message
    }
    
    return NextResponse.json({
      tableExists: true,
      columns: columnsResult,
      testQuery: {
        success: !testQueryError,
        error: testQueryError,
        sampleData: testQueryResult?.[0] || null
      },
      businessProducts: {
        count: businessProductsCount,
        error: businessProductsError
      },
      recommendations: {
        expectedColumns: [
          'product_id (SERIAL PRIMARY KEY)',
          'business_id (INTEGER)',
          'product_name (VARCHAR)',
          'product_description (TEXT)',
          'product_image (TEXT)',
          'product_category (VARCHAR)'
        ]
      }
    })
  } catch (error: any) {
    console.error('❌ Products schema test error:', error)
    return NextResponse.json(
      { 
        error: 'Products schema test failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
