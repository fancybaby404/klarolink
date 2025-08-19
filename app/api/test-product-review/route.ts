import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST: Product Review API Test Starting...')
    
    const body = await request.json()
    const { productId = 1, rating = 5, comment = "Test review from API test", business_id = 9, user_id = 1 } = body
    
    console.log('📝 Test parameters:', { productId, rating, comment, business_id, user_id })
    
    // === STEP 1: Check Database Connection ===
    if (!db.query) {
      console.log('❌ No database connection available')
      return NextResponse.json({
        success: false,
        error: 'No database connection',
        step: 'database_connection'
      }, { status: 500 })
    }
    
    console.log('✅ Database connection available')
    
    // === STEP 2: Test Basic Query ===
    try {
      await db.query('SELECT 1 as test')
      console.log('✅ Basic database query working')
    } catch (queryError: any) {
      console.log('❌ Basic database query failed:', queryError.message)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: queryError.message,
        step: 'basic_query'
      }, { status: 500 })
    }
    
    // === STEP 3: Check if product exists ===
    let productExists = false
    try {
      const productCheck = await db.query('SELECT * FROM products WHERE product_id = $1 OR id = $1 LIMIT 1', [productId])
      productExists = productCheck.length > 0
      console.log(`📦 Product ${productId} exists:`, productExists)
      if (productExists) {
        console.log('Product data:', productCheck[0])
      }
    } catch (productError: any) {
      console.log('❌ Product check failed:', productError.message)
      return NextResponse.json({
        success: false,
        error: 'Product check failed',
        details: productError.message,
        step: 'product_check'
      }, { status: 500 })
    }
    
    // === STEP 4: Create product_reviews table if needed ===
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS product_reviews (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL,
          business_id INTEGER,
          user_id INTEGER,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `)
      console.log('✅ product_reviews table ready')
    } catch (tableError: any) {
      console.log('❌ Table creation failed:', tableError.message)
      return NextResponse.json({
        success: false,
        error: 'Table creation failed',
        details: tableError.message,
        step: 'table_creation'
      }, { status: 500 })
    }
    
    // === STEP 5: Insert test review ===
    let insertedReview = null
    try {
      const insertQuery = `
        INSERT INTO product_reviews (product_id, business_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `
      
      console.log('📝 Executing INSERT with params:', [productId, business_id, user_id, rating, comment])
      
      const result = await db.query(insertQuery, [productId, business_id, user_id, rating, comment])
      
      if (result && result.length > 0) {
        insertedReview = result[0]
        console.log('✅ Review inserted successfully:', insertedReview)
      } else {
        console.log('❌ INSERT returned no results')
        return NextResponse.json({
          success: false,
          error: 'INSERT returned no results',
          step: 'insert_review'
        }, { status: 500 })
      }
    } catch (insertError: any) {
      console.log('❌ Review insertion failed:', insertError.message)
      console.log('Error details:', {
        code: insertError.code,
        detail: insertError.detail,
        constraint: insertError.constraint
      })
      return NextResponse.json({
        success: false,
        error: 'Review insertion failed',
        details: insertError.message,
        code: insertError.code,
        step: 'insert_review'
      }, { status: 500 })
    }
    
    // === STEP 6: Verify the review was saved ===
    let verificationResult = null
    try {
      const verifyQuery = 'SELECT * FROM product_reviews WHERE id = $1'
      const verifyResult = await db.query(verifyQuery, [insertedReview.id])
      
      if (verifyResult && verifyResult.length > 0) {
        verificationResult = verifyResult[0]
        console.log('✅ Review verification successful:', verificationResult)
      } else {
        console.log('❌ Review not found in verification')
      }
    } catch (verifyError: any) {
      console.log('⚠️ Verification failed:', verifyError.message)
    }
    
    // === STEP 7: Get total review count ===
    let totalReviews = 0
    try {
      const countResult = await db.query('SELECT COUNT(*) as count FROM product_reviews')
      totalReviews = parseInt(countResult[0].count)
      console.log(`📊 Total reviews in database: ${totalReviews}`)
    } catch (countError: any) {
      console.log('⚠️ Count query failed:', countError.message)
    }
    
    // === STEP 8: Test analytics query ===
    let analyticsTest = null
    try {
      const analyticsQuery = `
        SELECT 
          pr.rating,
          pr.comment,
          pr.created_at,
          p.product_name as product_name,
          p.product_id as product_id
        FROM product_reviews pr
        JOIN products p ON pr.product_id = p.product_id
        WHERE pr.business_id = $1
        ORDER BY pr.created_at DESC
        LIMIT 5
      `
      
      const analyticsResult = await db.query(analyticsQuery, [business_id])
      analyticsTest = {
        query: 'standard_join',
        success: true,
        count: analyticsResult.length,
        data: analyticsResult
      }
      console.log(`✅ Analytics query (standard) found ${analyticsResult.length} reviews`)
    } catch (analyticsError: any) {
      console.log('❌ Standard analytics query failed:', analyticsError.message)
      
      // Try alternative query
      try {
        const altQuery = `
          SELECT 
            pr.rating,
            pr.comment,
            pr.created_at,
            COALESCE(p.product_name, p.name) as product_name,
            COALESCE(p.product_id, p.id) as product_id
          FROM product_reviews pr
          JOIN products p ON pr.product_id = COALESCE(p.product_id, p.id)
          WHERE pr.business_id = $1
          ORDER BY pr.created_at DESC
          LIMIT 5
        `
        
        const altResult = await db.query(altQuery, [business_id])
        analyticsTest = {
          query: 'alternative_join',
          success: true,
          count: altResult.length,
          data: altResult
        }
        console.log(`✅ Analytics query (alternative) found ${altResult.length} reviews`)
      } catch (altError: any) {
        analyticsTest = {
          query: 'both_failed',
          success: false,
          error: altError.message
        }
        console.log('❌ Both analytics queries failed:', altError.message)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product review test completed successfully',
      results: {
        databaseConnection: true,
        productExists,
        tableCreated: true,
        reviewInserted: !!insertedReview,
        reviewVerified: !!verificationResult,
        totalReviews,
        analyticsTest,
        insertedReview,
        verificationResult
      },
      summary: {
        allStepsSuccessful: productExists && !!insertedReview && !!verificationResult,
        readyForProduction: productExists && !!insertedReview && !!verificationResult && analyticsTest?.success
      }
    })
    
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed', 
        details: error.message,
        stack: error.stack?.split('\n').slice(0, 5)
      },
      { status: 500 }
    )
  }
}
