import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database-adapter'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Forms Publish API: Processing publish status update request')
    
    // Check for authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔑 Forms Publish API: Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Forms Publish API: No valid authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract and verify token
    const token = authHeader.substring(7)
    console.log('🔑 Forms Publish API: Token extracted, length:', token.length)
    
    const decoded = await verifyToken(token)
    console.log('🔑 Forms Publish API: Token verification result:', decoded ? 'Valid' : 'Invalid')
    
    if (!decoded) {
      console.log('❌ Forms Publish API: Token verification failed')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('✅ Forms Publish API: Authentication successful for business ID:', decoded.businessId)

    // Parse request body
    const { businessId, isPublished } = await request.json()
    console.log('📝 Forms Publish API: Update data:', { businessId, isPublished })

    // Verify the business ID matches the token
    if (decoded.businessId !== businessId) {
      console.log('❌ Forms Publish API: Business ID mismatch')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update the form's published status in the database
    console.log('🔍 Updating form publish status for business ID:', businessId)

    // Check if we have a real database connection (not mock)
    if (!db.query) {
      console.log('📝 Forms Publish API: Using mock database - simulating update')
      return NextResponse.json({
        success: true,
        form: { id: 1, is_published: isPublished },
        message: isPublished ? 'Form is now public' : 'Form is now private'
      })
    }

    const updateQuery = `
      UPDATE feedback_forms
      SET preview_enabled = $1, updated_at = NOW()
      WHERE business_id = $2
      RETURNING id, preview_enabled as is_published
    `

    const result = await db.query(updateQuery, [isPublished, businessId])

    if (result.length === 0) {
      console.log('❌ Forms Publish API: No form found for business ID:', businessId)
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    console.log('✅ Forms Publish API: Form publish status updated successfully')
    console.log('📝 Updated form:', result[0])

    return NextResponse.json({
      success: true,
      form: result[0],
      message: isPublished ? 'Form is now public' : 'Form is now private'
    })

  } catch (error) {
    console.error('❌ Forms Publish API: Error updating form publish status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
