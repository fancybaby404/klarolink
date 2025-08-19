import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database-adapter'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const businessId = payload.businessId
    console.log(`🔍 PRODUCT REVIEWS SCHEMA CHECK: Checking for business ID: ${businessId}`)

    // Check if we have a real database connection
    if (!db.query) {
      console.log('📝 Using mock database - cannot check real schema')
      return NextResponse.json({
        success: false,
        message: 'Mock database in use - cannot check real schema'
      })
    }

    // === STEP 1: Check product_reviews table schema ===
    let productReviewsSchema: any[] = []
    let schemaError = null

    try {
      productReviewsSchema = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'product_reviews' 
        ORDER BY ordinal_position
      `)
    } catch (error: any) {
      schemaError = error.message
    }

    // === STEP 2: Check products table schema ===
    let productsSchema: any[] = []
    let productsSchemaError = null

    try {
      productsSchema = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        ORDER BY ordinal_position
      `)
    } catch (error: any) {
      productsSchemaError = error.message
    }

    // === STEP 3: Get sample product_reviews data ===
    let sampleReviews: any[] = []
    let reviewsError = null

    try {
      sampleReviews = await db.query(`
        SELECT * FROM product_reviews 
        WHERE business_id = $1 
        ORDER BY created_at DESC 
        LIMIT 5
      `, [businessId])
    } catch (error: any) {
      reviewsError = error.message
    }

    // === STEP 4: Get sample products data ===
    let sampleProducts: any[] = []
    let productsError = null

    try {
      sampleProducts = await db.query(`
        SELECT * FROM products 
        LIMIT 5
      `)
    } catch (error: any) {
      productsError = error.message
    }

    // === STEP 5: Test the JOIN query used in analytics ===
    let joinTestResults: any[] = []
    let joinError = null

    try {
      joinTestResults = await db.query(`
        SELECT 
          pr.id as review_id,
          pr.rating,
          pr.comment,
          pr.created_at,
          pr.business_id,
          pr.product_id as review_product_id,
          p.product_id as product_product_id,
          p.product_name,
          p.product_description
        FROM product_reviews pr
        JOIN products p ON pr.product_id = p.product_id
        WHERE pr.business_id = $1
        ORDER BY pr.created_at DESC
        LIMIT 5
      `, [businessId])
    } catch (error: any) {
      joinError = error.message
    }

    // === STEP 6: Alternative JOIN query (in case column names are different) ===
    let alternativeJoinResults: any[] = []
    let alternativeJoinError = null

    try {
      alternativeJoinResults = await db.query(`
        SELECT 
          pr.id as review_id,
          pr.rating,
          pr.comment,
          pr.created_at,
          pr.business_id,
          pr.product_id as review_product_id,
          p.id as product_id,
          p.name as product_name,
          p.description as product_description
        FROM product_reviews pr
        JOIN products p ON pr.product_id = p.id
        WHERE pr.business_id = $1
        ORDER BY pr.created_at DESC
        LIMIT 5
      `, [businessId])
    } catch (error: any) {
      alternativeJoinError = error.message
    }

    return NextResponse.json({
      businessId,
      
      // Table Schemas
      schemas: {
        productReviews: {
          columns: productReviewsSchema,
          error: schemaError,
          exists: productReviewsSchema.length > 0
        },
        products: {
          columns: productsSchema,
          error: productsSchemaError,
          exists: productsSchema.length > 0
        }
      },
      
      // Sample Data
      sampleData: {
        reviews: {
          data: sampleReviews,
          count: sampleReviews.length,
          error: reviewsError
        },
        products: {
          data: sampleProducts,
          count: sampleProducts.length,
          error: productsError
        }
      },
      
      // JOIN Tests
      joinTests: {
        standardJoin: {
          data: joinTestResults,
          count: joinTestResults.length,
          error: joinError,
          query: "pr.product_id = p.product_id"
        },
        alternativeJoin: {
          data: alternativeJoinResults,
          count: alternativeJoinResults.length,
          error: alternativeJoinError,
          query: "pr.product_id = p.id"
        }
      },
      
      // Analysis
      analysis: {
        productReviewsTableExists: productReviewsSchema.length > 0,
        productsTableExists: productsSchema.length > 0,
        hasReviewsForBusiness: sampleReviews.length > 0,
        hasProducts: sampleProducts.length > 0,
        standardJoinWorks: joinTestResults.length > 0,
        alternativeJoinWorks: alternativeJoinResults.length > 0,
        
        issues: [
          !productReviewsSchema.length && "product_reviews table does not exist",
          !productsSchema.length && "products table does not exist", 
          sampleReviews.length === 0 && "No product reviews found for this business",
          sampleProducts.length === 0 && "No products found",
          joinTestResults.length === 0 && alternativeJoinResults.length === 0 && "JOIN queries not working"
        ].filter(Boolean)
      },
      
      // Recommendations
      recommendations: [
        productReviewsSchema.length === 0 && "Create product_reviews table",
        sampleReviews.length === 0 && "Add product reviews with business_id = " + businessId,
        joinTestResults.length === 0 && alternativeJoinResults.length > 0 && "Use alternative JOIN: pr.product_id = p.id",
        joinTestResults.length > 0 && "Standard JOIN working: pr.product_id = p.product_id"
      ].filter(Boolean),
      
      success: true
    })

  } catch (error: any) {
    console.error('❌ Product reviews schema check error:', error)
    return NextResponse.json(
      { 
        error: 'Schema check failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
