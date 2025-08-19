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

    const { rating, comment, user_id, business_id } = body

    console.log(`📝 Creating product review for product ${productId}:`, {
      rating,
      comment: comment?.substring(0, 50) + '...',
      business_id
    })

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
        rating,
        comment: comment.trim(),
        created_at: new Date().toISOString(),
        business_id
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

    const result = await db.query(reviewQuery, [
      productId,
      business_id || null,
      user_id || null,
      rating,
      comment.trim()
    ])

    const review = result[0]
    console.log(`✅ Product review created successfully:`, review)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating product review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
