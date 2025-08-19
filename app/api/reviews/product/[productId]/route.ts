import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Fetch reviews for the product
    const reviewsQuery = `
      SELECT
        pr.*,
        p.product_name as product_name,
        p.product_image
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.product_id
      WHERE pr.product_id = $1
      ORDER BY pr.created_at DESC
    `

    const result = await db.query!(reviewsQuery, [productId])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId)
    const body = await request.json()

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Extract user info from token if available
    let authenticatedUserId = null
    let authenticatedBusinessId = null

    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const { verifyToken, verifyUserToken, verifyCustomerToken } = await import('@/lib/auth')
        const token = authHeader.substring(7)
        console.log('🔑 Attempting to verify token...')

        // Try business token first
        const businessPayload = verifyToken(token)
        if (businessPayload) {
          authenticatedBusinessId = businessPayload.businessId
          console.log('✅ Business token verified, businessId:', businessPayload.businessId)
        } else {
          // Try user token
          const userPayload = verifyUserToken(token)
          if (userPayload) {
            authenticatedUserId = userPayload.userId
            console.log('✅ User token verified, userId:', userPayload.userId)
          } else {
            // Try customer token (most likely for public feedback)
            try {
              const customerPayload = verifyCustomerToken(token)
              if (customerPayload) {
                authenticatedUserId = customerPayload.customerId
                console.log('✅ Customer token verified, customerId:', customerPayload.customerId)
              } else {
                console.log('❌ Token verification failed for business, user, and customer')
              }
            } catch (customerError) {
              console.log('❌ Customer token verification failed:', customerError)
            }
          }
        }
      } catch (authError) {
        console.log('❌ Token verification error:', authError)
      }
    } else {
      console.log('❌ No authorization header found')
    }

    const { rating, comment, user_id, business_id } = body

    // Use authenticated user ID if available, otherwise use provided user_id
    const finalUserId = authenticatedUserId || user_id || 1 // Default to user ID 1 if none provided
    const finalBusinessId = authenticatedBusinessId || business_id

    console.log(`📝 Creating product review for product ${productId}:`, {
      rating,
      comment: comment?.substring(0, 50) + '...',
      business_id: finalBusinessId,
      user_id: finalUserId,
      authenticated: !!authenticatedUserId,
      authType: authenticatedBusinessId ? 'business' : authenticatedUserId ? 'user/customer' : 'none'
    })

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      console.log('❌ Invalid rating:', rating)
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!comment || !comment.trim()) {
      console.log('❌ Missing comment')
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      )
    }

    // Check if we have a real database connection
    if (!db.query) {
      console.log('📝 Using mock database - simulating product review creation')
      return NextResponse.json({
        id: Math.floor(Math.random() * 1000),
        product_id: productId,
        business_id: finalBusinessId,
        user_id: finalUserId,
        rating,
        comment: comment.trim(),
        created_at: new Date().toISOString()
      }, { status: 201 })
    }

    // Check if product exists
    const productCheck = await db.query(
      'SELECT product_id FROM products WHERE product_id = $1',
      [productId]
    )

    if (productCheck.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create product_reviews table if it doesn't exist
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
    } catch (createError) {
      console.log('Product reviews table creation skipped or failed:', createError)
    }

    // Insert review
    const reviewQuery = `
      INSERT INTO product_reviews (product_id, business_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `

    console.log(`📝 Executing INSERT query with params:`, {
      productId,
      finalBusinessId: finalBusinessId || null,
      finalUserId: finalUserId || null,
      rating,
      comment: comment.trim().substring(0, 50) + '...'
    })

    const result = await db.query(reviewQuery, [
      productId,
      finalBusinessId || null,
      finalUserId || null,
      rating,
      comment.trim()
    ])

    if (!result || result.length === 0) {
      console.log('❌ INSERT query returned no results')
      return NextResponse.json(
        { error: 'Review creation failed - no data returned' },
        { status: 500 }
      )
    }

    const review = result[0]
    console.log(`✅ Product review created successfully:`, {
      id: review.id,
      product_id: review.product_id,
      business_id: review.business_id,
      user_id: review.user_id,
      rating: review.rating,
      created_at: review.created_at
    })

    // Verify the review was actually saved
    try {
      const verifyResult = await db.query('SELECT COUNT(*) as count FROM product_reviews WHERE id = $1', [review.id])
      console.log(`🔍 Verification: Review ${review.id} exists in database:`, verifyResult[0].count > 0)
    } catch (verifyError) {
      console.log('⚠️ Could not verify review was saved:', verifyError)
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error creating product review:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack?.split('\n').slice(0, 3)
    })

    return NextResponse.json(
      {
        error: 'Failed to create review',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
