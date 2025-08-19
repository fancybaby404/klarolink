import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, verifyUserToken } from '@/lib/auth'
import { db } from '@/lib/database-adapter'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Product Review Flow Test Starting...')
    
    const body = await request.json()
    const { productId, rating, comment, business_id } = body
    
    console.log('📝 Request body:', { productId, rating, comment, business_id })
    
    // === STEP 1: Check Authentication ===
    let authResult = {
      hasAuthHeader: false,
      tokenValid: false,
      businessId: null,
      userId: null,
      tokenType: null
    }
    
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      authResult.hasAuthHeader = true
      const token = authHeader.substring(7)
      console.log('🔑 Token found, length:', token.length)
      
      // Try business token first
      const businessPayload = verifyToken(token)
      if (businessPayload) {
        authResult.tokenValid = true
        authResult.businessId = businessPayload.businessId
        authResult.tokenType = 'business'
        console.log('✅ Business token valid, businessId:', businessPayload.businessId)
      } else {
        // Try user token
        const userPayload = verifyUserToken(token)
        if (userPayload) {
          authResult.tokenValid = true
          authResult.userId = userPayload.userId
          authResult.tokenType = 'user'
          console.log('✅ User token valid, userId:', userPayload.userId)
        } else {
          console.log('❌ Token verification failed')
        }
      }
    } else {
      console.log('❌ No authorization header found')
    }
    
    // === STEP 2: Check Database Connection ===
    let dbResult = {
      hasConnection: false,
      canQuery: false,
      error: null
    }
    
    if (db.query) {
      dbResult.hasConnection = true
      try {
        await db.query('SELECT 1 as test')
        dbResult.canQuery = true
        console.log('✅ Database connection working')
      } catch (error: any) {
        dbResult.error = error.message
        console.log('❌ Database query failed:', error.message)
      }
    } else {
      console.log('❌ No database connection (using mock)')
    }
    
    // === STEP 3: Check Product Exists ===
    let productResult = {
      exists: false,
      productData: null,
      error: null
    }
    
    if (dbResult.canQuery && productId) {
      try {
        // Try different product ID column names
        let productCheck = []
        try {
          productCheck = await db.query('SELECT * FROM products WHERE product_id = $1', [productId])
        } catch (e) {
          productCheck = await db.query('SELECT * FROM products WHERE id = $1', [productId])
        }
        
        if (productCheck.length > 0) {
          productResult.exists = true
          productResult.productData = productCheck[0]
          console.log('✅ Product found:', productCheck[0])
        } else {
          console.log('❌ Product not found with ID:', productId)
        }
      } catch (error: any) {
        productResult.error = error.message
        console.log('❌ Product check failed:', error.message)
      }
    }
    
    // === STEP 4: Check product_reviews Table ===
    let tableResult = {
      exists: false,
      schema: null,
      sampleData: [],
      error: null
    }
    
    if (dbResult.canQuery) {
      try {
        // Check if table exists
        const tableCheck = await db.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'product_reviews'
          ORDER BY ordinal_position
        `)
        
        if (tableCheck.length > 0) {
          tableResult.exists = true
          tableResult.schema = tableCheck
          console.log('✅ product_reviews table exists with columns:', tableCheck.map(c => c.column_name))
          
          // Get sample data
          const sampleData = await db.query('SELECT * FROM product_reviews ORDER BY created_at DESC LIMIT 5')
          tableResult.sampleData = sampleData
          console.log(`📊 Found ${sampleData.length} existing reviews`)
        } else {
          console.log('❌ product_reviews table does not exist')
        }
      } catch (error: any) {
        tableResult.error = error.message
        console.log('❌ Table check failed:', error.message)
      }
    }
    
    // === STEP 5: Try Creating Table ===
    let createTableResult = {
      attempted: false,
      success: false,
      error: null
    }
    
    if (dbResult.canQuery && !tableResult.exists) {
      createTableResult.attempted = true
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
        createTableResult.success = true
        console.log('✅ product_reviews table created successfully')
      } catch (error: any) {
        createTableResult.error = error.message
        console.log('❌ Table creation failed:', error.message)
      }
    }
    
    // === STEP 6: Try Inserting Test Review ===
    let insertResult = {
      attempted: false,
      success: false,
      reviewId: null,
      error: null
    }
    
    if (dbResult.canQuery && (tableResult.exists || createTableResult.success) && productResult.exists) {
      insertResult.attempted = true
      try {
        const finalBusinessId = authResult.businessId || business_id || 9
        const finalUserId = authResult.userId || 1
        
        const insertQuery = `
          INSERT INTO product_reviews (product_id, business_id, user_id, rating, comment)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `
        
        const result = await db.query(insertQuery, [
          productId,
          finalBusinessId,
          finalUserId,
          rating || 5,
          comment || 'Test review from debug endpoint'
        ])
        
        if (result.length > 0) {
          insertResult.success = true
          insertResult.reviewId = result[0].id
          console.log('✅ Test review inserted successfully:', result[0])
        }
      } catch (error: any) {
        insertResult.error = error.message
        console.log('❌ Review insertion failed:', error.message)
      }
    }
    
    // === STEP 7: Final Verification ===
    let verificationResult = {
      reviewCount: 0,
      latestReview: null
    }
    
    if (dbResult.canQuery && insertResult.success) {
      try {
        const countResult = await db.query('SELECT COUNT(*) as count FROM product_reviews')
        verificationResult.reviewCount = parseInt(countResult[0].count)
        
        const latestResult = await db.query('SELECT * FROM product_reviews ORDER BY created_at DESC LIMIT 1')
        if (latestResult.length > 0) {
          verificationResult.latestReview = latestResult[0]
        }
        
        console.log(`📊 Total reviews in database: ${verificationResult.reviewCount}`)
      } catch (error: any) {
        console.log('❌ Verification failed:', error.message)
      }
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        authentication: authResult,
        database: dbResult,
        product: productResult,
        table: tableResult,
        createTable: createTableResult,
        insert: insertResult,
        verification: verificationResult
      },
      summary: {
        canAuthenticate: authResult.tokenValid,
        canConnectDB: dbResult.canQuery,
        productExists: productResult.exists,
        tableExists: tableResult.exists || createTableResult.success,
        canInsertReview: insertResult.success,
        totalReviews: verificationResult.reviewCount
      },
      recommendations: [
        !authResult.hasAuthHeader && "Add Authorization header with Bearer token",
        !authResult.tokenValid && "Check token validity - may be expired or invalid",
        !dbResult.canQuery && "Check database connection and credentials",
        !productResult.exists && "Ensure product exists in database with correct ID",
        !tableResult.exists && !createTableResult.success && "Create product_reviews table manually",
        insertResult.error && `Fix insertion error: ${insertResult.error}`
      ].filter(Boolean)
    })
    
  } catch (error: any) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Debug test failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
