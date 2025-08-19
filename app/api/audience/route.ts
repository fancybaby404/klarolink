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

    console.log(`👥 Getting audience data for business ID: ${payload.businessId}`)

    // Get customer profiles (segments are hidden for now)
    const customerProfiles = await db.getCustomerProfiles(payload.businessId)
    const customerSegments = [] // Temporarily empty since segments are hidden

    console.log(`📊 Audience data retrieved:`, {
      customerProfilesCount: customerProfiles.length,
      customerEmails: customerProfiles.map(c => c.email),
      customerNames: customerProfiles.map(c => c.name),
      customerRatings: customerProfiles.map(c => c.average_rating),
      ratingBreakdown: {
        promoters: customerProfiles.filter(c => c.average_rating >= 4).map(c => ({ email: c.email, rating: c.average_rating })),
        passives: customerProfiles.filter(c => c.average_rating >= 3 && c.average_rating < 4).map(c => ({ email: c.email, rating: c.average_rating })),
        detractors: customerProfiles.filter(c => c.average_rating <= 2).map(c => ({ email: c.email, rating: c.average_rating }))
      }
    })

    // Skip segment statistics since segments are hidden
    const segmentStats = []

    // Calculate overview statistics (NPS methodology)
    const totalCustomers = customerProfiles.length
    const promoters = customerProfiles.filter(c => c.average_rating >= 4).length
    const detractors = customerProfiles.filter(c => c.average_rating <= 2).length
    const passives = customerProfiles.filter(c => c.average_rating === 3).length
    const averageEngagement = totalCustomers > 0 
      ? Math.round(customerProfiles.reduce((sum, c) => sum + c.engagement_score, 0) / totalCustomers)
      : 0

    const overviewStats = {
      totalCustomers,
      promoters,
      detractors,
      passives,
      averageEngagement,
      npsScore: totalCustomers > 0 ? Math.round(((promoters - detractors) / totalCustomers) * 100) : 0
    }

    console.log(`✅ Audience data retrieved successfully`)

    return NextResponse.json({
      customerProfiles,
      customerSegments: segmentStats,
      overviewStats,
      success: true
    })
  } catch (error) {
    console.error("❌ Audience API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
