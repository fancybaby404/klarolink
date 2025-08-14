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

    console.log(`📊 Getting detailed insights for business ID: ${payload.businessId}`)

    // Get detailed insights data for charts
    const insights = await db.getDetailedInsights(payload.businessId)

    console.log(`✅ Detailed insights retrieved for business ${payload.businessId}:`, {
      submissionTrends: insights.submissionTrends?.length || 0,
      fieldAnalytics: insights.fieldAnalytics?.length || 0,
      ratingDistribution: insights.ratingDistribution?.length || 0,
      recentSubmissions: insights.recentSubmissions?.length || 0,
      totalSubmissions: insights.submissionTrends?.reduce((sum, day) => sum + day.count, 0) || 0,
      trendsData: insights.submissionTrends?.map(t => ({ date: t.date, count: t.count })) || []
    })

    return NextResponse.json({
      insights,
      success: true
    })
  } catch (error) {
    console.error("❌ Error fetching detailed insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
