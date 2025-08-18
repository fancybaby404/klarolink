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
        p.id,
        p.name,
        p.description,
        p.product_image,
        p.category,
        p.is_active,
        p.display_order,
        p.created_at,
        p.updated_at,
        pp.price,
        pp.currency
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_active = true
      WHERE p.business_id = $1 AND p.is_active = true
      ORDER BY p.display_order ASC, p.created_at DESC
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

    // Get the next display order
    const orderQuery = `
      SELECT COALESCE(MAX(display_order), 0) + 1 as next_order
      FROM products 
      WHERE business_id = $1
    `
    const orderResult = await db.query!(orderQuery, [businessId])
    const nextOrder = orderResult[0].next_order

    // Insert product
    const productQuery = `
      INSERT INTO products (business_id, name, description, product_image, category, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    
    const productResult = await db.query!(productQuery, [
      businessId,
      name,
      description,
      product_image,
      category,
      nextOrder
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
