import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    console.log('Fetching products for business ID:', businessId)

    // Use the database adapter method
    const products = await db.getProducts(parseInt(businessId))
    console.log('Products fetched:', products.length)

    return NextResponse.json({
      products,
      success: true
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { businessId, name, description, product_image, category } = body

    if (!businessId || !name) {
      return NextResponse.json({ error: 'Business ID and name are required' }, { status: 400 })
    }

    // Verify the business belongs to the authenticated user
    if (decoded.businessId !== parseInt(businessId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Use the database adapter method
    const product = await db.createProduct({
      business_id: parseInt(businessId),
      name,
      description: description || "",
      product_image: product_image || "",
      category: category || "",
      is_active: true
    })

    return NextResponse.json({ 
      success: true, 
      product,
      message: 'Product created successfully'
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
