import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

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

    const body = await request.json()
    const { business_id, title, description, fields, preview_enabled } = body

    // Verify the business belongs to the authenticated user
    if (payload.businessId !== business_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate required fields
    if (!title || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Title and fields are required" }, { status: 400 })
    }

    // Update the feedback form for this business
    console.log(`🔍 Saving form for business ID: ${business_id}`);
    console.log(`📝 Form data:`, { title, description, fieldsCount: fields.length, preview_enabled });

    await db.updateFeedbackForm(business_id, fields, title, description, preview_enabled)

    console.log(`✅ Form updated successfully for business ID: ${business_id}`)

    return NextResponse.json({
      success: true,
      message: "Form saved successfully"
    })
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
