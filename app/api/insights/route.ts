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

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "7d" // 7d, 30d, 90d, 1y
    const compareWith = searchParams.get("compareWith") || "previous" // previous, lastYear

    // Get enhanced insights data
    const insights = await db.getEnhancedInsights(payload.businessId, timeRange, compareWith)

    // Get basic stats for comparison
    const stats = await db.getAnalyticsStats(payload.businessId)

    // Get customer journey analytics
    const customerJourney = await db.getCustomerJourneyAnalytics(payload.businessId, timeRange)

    // Get performance benchmarks
    const benchmarks = await db.getPerformanceBenchmarks(payload.businessId, timeRange)

    return NextResponse.json({
      insights,
      stats,
      customerJourney,
      benchmarks,
      timeRange,
      compareWith,
      success: true
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
