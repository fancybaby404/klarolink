import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    console.log('Fetching products for business ID:', businessId)

    // Get products with pricing
    const query = `
      SELECT
        p.product_id as id,
        p.product_name as name,
        p.product_description as description,
        p.product_image,
        p.product_category as category,
        p.created_at,
        p.updated_at,
        pp.price,
        pp.currency
      FROM products p
      LEFT JOIN product_pricing pp ON p.product_id = pp.product_id AND pp.is_active = true
      WHERE p.business_id = $1
      ORDER BY p.created_at DESC
    `

    const result = await db.query!(query, [businessId])
    console.log('Products query result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, name, description, product_image, category, price, currency = 'USD' } = body

    if (!businessId || !name) {
      return NextResponse.json({ error: 'Business ID and name are required' }, { status: 400 })
    }

    // Insert product
    const productQuery = `
      INSERT INTO products (business_id, product_name, product_description, product_image, product_category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING product_id as id, product_name as name, product_description as description, product_image, product_category as category, created_at, updated_at
    `

    const productResult = await db.query!(productQuery, [
      businessId,
      name,
      description,
      product_image,
      category
    ])

    const product = productResult[0]

    // Insert pricing if provided
    if (price) {
      const pricingQuery = `
        INSERT INTO product_pricing (product_id, price, currency, is_active)
        VALUES ($1, $2, $3, true)
      `
      await db.query!(pricingQuery, [product.id, price, currency])
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
