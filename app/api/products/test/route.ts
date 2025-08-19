import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json()
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    console.log('Creating test products for business ID:', businessId)

    // Create test products
    const testProducts = [
      {
        name: 'Premium Coffee Blend',
        description: 'Our signature coffee blend with rich, smooth flavor',
        category: 'Beverages',
        pricing: [{ price: 12.99, currency: 'USD', is_active: true }]
      },
      {
        name: 'Artisan Pastry',
        description: 'Freshly baked pastries made with organic ingredients',
        category: 'Food',
        pricing: [{ price: 4.50, currency: 'USD', is_active: true }]
      },
      {
        name: 'Specialty Sandwich',
        description: 'Gourmet sandwich with premium ingredients',
        category: 'Food',
        pricing: [{ price: 8.99, currency: 'USD', is_active: true }]
      }
    ]

    const createdProducts = []

    for (const productData of testProducts) {
      // Insert product
      const productQuery = `
        INSERT INTO products (business_id, product_name, product_description, product_category)
        VALUES ($1, $2, $3, $4)
        RETURNING product_id as id, product_name as name, product_description as description, product_category as category, created_at, updated_at
      `

      const productResult = await db.query!(productQuery, [
        businessId,
        productData.name,
        productData.description,
        productData.category
      ])

      const product = productResult[0]

      // Insert pricing
      if (productData.pricing && productData.pricing.length > 0) {
        for (const price of productData.pricing) {
          await db.query!(
            `INSERT INTO product_pricing (product_id, price, currency, is_active)
             VALUES ($1, $2, $3, $4)`,
            [product.id, price.price, price.currency, price.is_active]
          )
        }
      }

      createdProducts.push(product)
    }

    console.log('Created test products:', createdProducts)

    return NextResponse.json({
      message: 'Test products created successfully',
      products: createdProducts
    })
  } catch (error) {
    console.error('Error creating test products:', error)
    return NextResponse.json(
      { error: 'Failed to create test products', details: error.message },
      { status: 500 }
    )
  }
}
