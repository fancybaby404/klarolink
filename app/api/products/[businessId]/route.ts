import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = parseInt(params.businessId)
    console.log('Fetching products for business ID:', businessId)

    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 400 }
      )
    }

    // Fetch products with their pricing
    const productsQuery = `
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pp.id,
            'product_id', pp.product_id,
            'price', pp.price,
            'currency', pp.currency,
            'is_active', pp.is_active,
            'created_at', pp.created_at,
            'updated_at', pp.updated_at
          )
        ) FILTER (WHERE pp.id IS NOT NULL) as pricing
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp.product_id
      WHERE p.business_id = $1 AND p.is_active = true
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `

    const result = await db.query!(productsQuery, [businessId])
    console.log('Products query result:', result)

    // Transform the data to match our TypeScript interfaces
    const products = result.map(row => ({
      ...row,
      pricing: row.pricing || []
    }))

    console.log('Transformed products:', products)
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = parseInt(params.businessId)
    const body = await request.json()

    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 400 }
      )
    }

    const { name, description, product_image, category, pricing } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Insert product
    const productQuery = `
      INSERT INTO products (business_id, name, description, product_image, category, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `

    const productResult = await db.query!(productQuery, [
      businessId,
      name,
      description || null,
      product_image || null,
      category || null
    ])

    const product = productResult[0]

    // Insert pricing if provided
    if (pricing && pricing.length > 0) {
      const pricingQueries = pricing.map((price: any) => {
        return db.query!(
          `INSERT INTO product_pricing (product_id, price, currency, is_active)
           VALUES ($1, $2, $3, $4)`,
          [product.id, price.price, price.currency || 'USD', price.is_active !== false]
        )
      })

      await Promise.all(pricingQueries)
    }

    // Fetch the complete product with pricing
    const completeProductQuery = `
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pp.id,
            'product_id', pp.product_id,
            'price', pp.price,
            'currency', pp.currency,
            'is_active', pp.is_active,
            'created_at', pp.created_at,
            'updated_at', pp.updated_at
          )
        ) FILTER (WHERE pp.id IS NOT NULL) as pricing
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `

    const completeResult = await db.query!(completeProductQuery, [product.id])
    const completeProduct = {
      ...completeResult[0],
      pricing: completeResult[0].pricing || []
    }

    return NextResponse.json(completeProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
