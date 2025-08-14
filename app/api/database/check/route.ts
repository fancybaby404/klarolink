import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'

export async function GET(request: NextRequest) {
  try {
    console.log('Checking database tables...')

    // Check if products table exists
    const productsTableCheck = await db.query!(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      )`
    )

    // Check if product_pricing table exists
    const pricingTableCheck = await db.query!(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_pricing'
      )`
    )

    // Get table structures
    let productsStructure = null
    let pricingStructure = null

    if (productsTableCheck[0].exists) {
      productsStructure = await db.query!(
        `SELECT column_name, data_type, is_nullable 
         FROM information_schema.columns 
         WHERE table_name = 'products' 
         ORDER BY ordinal_position`
      )
    }

    if (pricingTableCheck[0].exists) {
      pricingStructure = await db.query!(
        `SELECT column_name, data_type, is_nullable 
         FROM information_schema.columns 
         WHERE table_name = 'product_pricing' 
         ORDER BY ordinal_position`
      )
    }

    // Count existing products
    let productCount = 0
    if (productsTableCheck[0].exists) {
      const countResult = await db.query!('SELECT COUNT(*) as count FROM products')
      productCount = parseInt(countResult[0].count)
    }

    return NextResponse.json({
      tables: {
        products: {
          exists: productsTableCheck[0].exists,
          structure: productsStructure,
          count: productCount
        },
        product_pricing: {
          exists: pricingTableCheck[0].exists,
          structure: pricingStructure
        }
      }
    })
  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json(
      { error: 'Database check failed', details: error.message },
      { status: 500 }
    )
  }
}
