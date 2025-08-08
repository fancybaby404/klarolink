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

    // Get customer profiles and segments
    const [customerProfiles, customerSegments] = await Promise.all([
      db.getCustomerProfiles(payload.businessId),
      db.getCustomerSegments(payload.businessId)
    ])

    // Calculate segment statistics
    const segmentStats = customerSegments.map(segment => {
      const customersInSegment = customerProfiles.filter(customer => 
        customer.segments.includes(segment.name.toLowerCase().replace(/\s+/g, '_'))
      )
      return {
        ...segment,
        customer_count: customersInSegment.length
      }
    })

    // Calculate overview statistics
    const totalCustomers = customerProfiles.length
    const promoters = customerProfiles.filter(c => c.average_rating >= 4).length
    const detractors = customerProfiles.filter(c => c.average_rating <= 2).length
    const passives = totalCustomers - promoters - detractors
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
