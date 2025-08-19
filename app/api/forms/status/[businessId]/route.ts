import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database-adapter'

export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
  try {
    console.log('🔍 Forms Status API: Processing status request for business ID:', params.businessId)
    
    // Check for authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔑 Forms Status API: Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Forms Status API: No valid authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract and verify token
    const token = authHeader.substring(7)
    console.log('🔑 Forms Status API: Token extracted, length:', token.length)
    
    const decoded = await verifyToken(token)
    console.log('🔑 Forms Status API: Token verification result:', decoded ? 'Valid' : 'Invalid')
    
    if (!decoded) {
      console.log('❌ Forms Status API: Token verification failed')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('✅ Forms Status API: Authentication successful for business ID:', decoded.businessId)

    // Verify the business ID matches the token
    if (decoded.businessId !== params.businessId) {
      console.log('❌ Forms Status API: Business ID mismatch')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the form's published status from the database
    console.log('🔍 Getting form status for business ID:', params.businessId)

    // Check if we have a real database connection (not mock)
    if (!db.query) {
      console.log('📝 Forms Status API: Using mock database - returning default status')
      return NextResponse.json({
        success: true,
        isPublished: false, // Default to false for mock
        formId: 1
      })
    }

    const statusQuery = `
      SELECT preview_enabled as is_published, id
      FROM businesses
      WHERE id = $1
    `

    const result = await db.query(statusQuery, [params.businessId])

    if (result.length === 0) {
      console.log('❌ Forms Status API: No business found for ID:', params.businessId)
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const isPublished = result[0].is_published || false
    console.log('✅ Forms Status API: Form status retrieved successfully:', { isPublished })

    return NextResponse.json({
      success: true,
      isPublished,
      formId: result[0].id
    })

  } catch (error) {
    console.error('❌ Forms Status API: Error getting form status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
