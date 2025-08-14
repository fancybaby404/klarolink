import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log(`🔍 Debug: Getting raw feedback for business ID: ${payload.businessId}`)

    // Get raw feedback submissions
    const feedbackSubmissions = await db.getFeedbackSubmissions(payload.businessId, 50)
    
    console.log(`🔍 Raw feedback data:`, feedbackSubmissions)

    return NextResponse.json({
      businessId: payload.businessId,
      feedbackCount: feedbackSubmissions.length,
      rawFeedbackSubmissions: feedbackSubmissions.map(f => ({
        id: f.id,
        business_id: f.business_id,
        form_id: f.form_id,
        submission_data: f.submission_data,
        submitted_at: f.submitted_at,
        ip_address: f.ip_address,
        user_agent: f.user_agent,
        // Show all fields in submission_data
        submission_data_fields: Object.keys(f.submission_data || {}),
        submission_data_values: f.submission_data
      })),
      success: true
    })
  } catch (error) {
    console.error("❌ Raw feedback debug error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
