import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
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

    console.log(`📊 Getting detailed insights for business ID: ${payload.businessId}`)

    // Get detailed insights data
    const insights = await db.getDetailedInsights(payload.businessId)
    
    // Get basic stats for comparison
    const stats = await db.getAnalyticsStats(payload.businessId)

    console.log(`✅ Insights retrieved successfully`)

    return NextResponse.json({
      insights,
      stats,
      success: true
    })
  } catch (error) {
    console.error("❌ Insights API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
