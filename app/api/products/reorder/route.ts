import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'
import { verifyToken } from '@/lib/auth'

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
    const { businessId, products } = body

    if (!businessId || !products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Business ID and products array are required' }, { status: 400 })
    }

    console.log('Reordering products for business:', businessId)
    console.log('Products order:', products)

    // Update display_order for each product
    for (const product of products) {
      const updateQuery = `
        UPDATE products 
        SET display_order = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND business_id = $3
      `
      await db.query!(updateQuery, [product.display_order, product.id, businessId])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering products:', error)
    return NextResponse.json(
      { error: 'Failed to reorder products' },
      { status: 500 }
    )
  }
}
