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

    const { rating, comment, user_id } = body

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

    // Check if product exists
    const productCheck = await db.query!(
      'SELECT id FROM products WHERE id = $1 AND is_active = true',
      [productId]
    )

    if (productCheck.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Insert review
    const reviewQuery = `
      INSERT INTO product_reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `

    const result = await db.query!(reviewQuery, [
      productId,
      user_id || null,
      rating,
      comment.trim()
    ])

    const review = result[0]

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating product review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
