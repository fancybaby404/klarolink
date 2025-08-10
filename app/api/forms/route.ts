import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Forms API: Processing form save request')

    const authHeader = request.headers.get("authorization")
    console.log('🔑 Forms API: Auth header present:', !!authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ Forms API: Missing or invalid auth header')
      return NextResponse.json({ error: "Unauthorized - Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('🔑 Forms API: Token extracted, length:', token.length)

    const payload = verifyToken(token)
    console.log('🔑 Forms API: Token verification result:', payload ? 'Valid' : 'Invalid')

    if (!payload) {
      console.log('❌ Forms API: Token verification failed')
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log('✅ Forms API: Authentication successful for business ID:', payload.businessId)

    const body = await request.json()
    const { business_id, title, description, fields, preview_enabled } = body

    // Verify the business belongs to the authenticated user
    if (payload.businessId !== business_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate required fields
    if (!title || !fields || !Array.isArray(fields)) {
      console.log('❌ Validation failed:', { title: !!title, fields: !!fields, isArray: Array.isArray(fields) })
      return NextResponse.json({ error: "Title and fields are required" }, { status: 400 })
    }

    // Update the feedback form for this business
    console.log(`🔍 Saving form for business ID: ${business_id}`);
    console.log(`📝 Form data:`, { title, description, fieldsCount: fields.length, preview_enabled });

    try {
      await db.updateFeedbackForm(business_id, fields, title, description, preview_enabled)
      console.log(`✅ Form updated successfully for business ID: ${business_id}`)

      return NextResponse.json({
        success: true,
        message: "Form saved successfully"
      })
    } catch (dbError) {
      console.error('❌ Database error in forms API:', dbError)
      return NextResponse.json({
        error: "Failed to save form to database",
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Forms API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get the feedback form for this business
    const form = await db.getFeedbackForm(payload.businessId)
    
    return NextResponse.json({ form })
  } catch (error) {
    console.error("Forms API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
