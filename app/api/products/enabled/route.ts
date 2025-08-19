import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database-adapter'

// GET - Get enabled products for feedback page
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
    console.log(`🔍 Getting enabled products for business ID: ${businessId}`)

    // Check if we have a real database connection
    if (!db.query) {
      console.log('📝 Using mock database - returning all products as enabled')
      const allProducts = await db.getProducts(businessId)
      return NextResponse.json({
        enabledProducts: allProducts.map(p => p.id),
        products: allProducts,
        success: true
      })
    }

    // Get enabled products from database
    // First check if enabled_products table exists, if not create it
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS enabled_products (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(business_id, product_id)
        )
      `)
    } catch (createError) {
      console.log('Table creation skipped or failed:', createError)
    }

    // Get enabled product IDs
    const enabledResult = await db.query(`
      SELECT product_id 
      FROM enabled_products 
      WHERE business_id = $1 AND enabled = true
    `, [businessId])

    const enabledProductIds = enabledResult.map(row => row.product_id)

    // Get all products for reference
    const allProducts = await db.getProducts(businessId)

    // If no products are specifically enabled, enable all by default
    if (enabledProductIds.length === 0 && allProducts.length > 0) {
      console.log('📝 No products specifically enabled, enabling all products by default')
      
      // Insert all products as enabled
      for (const product of allProducts) {
        try {
          await db.query(`
            INSERT INTO enabled_products (business_id, product_id, enabled)
            VALUES ($1, $2, $3)
            ON CONFLICT (business_id, product_id) 
            DO UPDATE SET enabled = $3, updated_at = NOW()
          `, [businessId, product.id, true])
        } catch (insertError) {
          console.log(`Failed to enable product ${product.id}:`, insertError)
        }
      }
      
      return NextResponse.json({
        enabledProducts: allProducts.map(p => p.id),
        products: allProducts,
        success: true,
        message: 'All products enabled by default'
      })
    }

    // Filter products to only enabled ones
    const enabledProducts = allProducts.filter(product => 
      enabledProductIds.includes(product.id)
    )

    console.log(`✅ Found ${enabledProducts.length} enabled products out of ${allProducts.length} total`)

    return NextResponse.json({
      enabledProducts: enabledProductIds,
      products: enabledProducts,
      allProducts: allProducts,
      success: true
    })

  } catch (error: any) {
    console.error('❌ Error getting enabled products:', error)
    return NextResponse.json(
      { error: 'Failed to get enabled products', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Update enabled products
export async function POST(request: NextRequest) {
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

    const { enabledProductIds } = await request.json()
    const businessId = payload.businessId

    console.log(`🔄 Updating enabled products for business ID: ${businessId}`)
    console.log(`📝 Enabled product IDs:`, enabledProductIds)

    if (!Array.isArray(enabledProductIds)) {
      return NextResponse.json({ error: "enabledProductIds must be an array" }, { status: 400 })
    }

    // Check if we have a real database connection
    if (!db.query) {
      console.log('📝 Using mock database - simulating update')
      return NextResponse.json({
        success: true,
        enabledProducts: enabledProductIds,
        message: 'Mock update successful'
      })
    }

    // Create table if it doesn't exist
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS enabled_products (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(business_id, product_id)
        )
      `)
    } catch (createError) {
      console.log('Table creation skipped or failed:', createError)
    }

    // Get all products for this business
    const allProducts = await db.getProducts(businessId)

    // Update enabled status for all products
    for (const product of allProducts) {
      const isEnabled = enabledProductIds.includes(product.id)
      
      try {
        await db.query(`
          INSERT INTO enabled_products (business_id, product_id, enabled)
          VALUES ($1, $2, $3)
          ON CONFLICT (business_id, product_id) 
          DO UPDATE SET enabled = $3, updated_at = NOW()
        `, [businessId, product.id, isEnabled])
      } catch (updateError) {
        console.log(`Failed to update product ${product.id}:`, updateError)
      }
    }

    console.log(`✅ Updated enabled status for ${allProducts.length} products`)

    return NextResponse.json({
      success: true,
      enabledProducts: enabledProductIds,
      totalProducts: allProducts.length,
      message: `Updated ${allProducts.length} products`
    })

  } catch (error: any) {
    console.error('❌ Error updating enabled products:', error)
    return NextResponse.json(
      { error: 'Failed to update enabled products', details: error.message },
      { status: 500 }
    )
  }
}
