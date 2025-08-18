import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"
import { extractDataWithFallback } from "@/lib/field-categorization"

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

    console.log(`🔍 Debug: Checking feedback for business ID: ${payload.businessId}`)

    // Try to get feedback submissions directly
    const feedbackSubmissions = await db.getFeedbackSubmissions(payload.businessId, 50)
    
    // Try to get analytics stats
    const analyticsStats = await db.getAnalyticsStats(payload.businessId)

    console.log(`🔍 Debug results for business ${payload.businessId}:`, {
      feedbackCount: feedbackSubmissions.length,
      analyticsStats,
      feedbackData: feedbackSubmissions.map(f => ({
        id: f.id,
        business_id: f.business_id,
        submitted_at: f.submitted_at,
        rating: f.submission_data?.rating,
        hasData: !!f.submission_data
      }))
    })

    return NextResponse.json({
      businessId: payload.businessId,
      feedbackCount: feedbackSubmissions.length,
      analyticsStats,
      feedbackSubmissions: feedbackSubmissions.map(f => {
        const extractedData = extractDataWithFallback(f.submission_data || {})
        return {
          id: f.id,
          business_id: f.business_id,
          submitted_at: f.submitted_at,
          rating: extractedData.rating,
          feedback: extractedData.feedbackText,
          hasData: !!f.submission_data
        }
      }),
      success: true
    })
  } catch (error) {
    console.error("❌ Debug error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
