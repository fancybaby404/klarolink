import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getBusiness } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

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

    const business = await getBusiness(payload.businessId)
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // Get dashboard statistics
    const stats = await db.getAnalyticsStats(business.id)
    const recentFeedback = await db.getFeedbackSubmissions(business.id, 5)

    const formattedRecentFeedback = recentFeedback.map((feedback) => ({
      id: feedback.id,
      rating: feedback.submission_data.rating || 0,
      feedback: feedback.submission_data.feedback || feedback.submission_data.message || "No feedback text",
      submitted_at: feedback.submitted_at,
    }))

    return NextResponse.json({
      business,
      stats: {
        ...stats,
        recentFeedback: formattedRecentFeedback,
      },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
