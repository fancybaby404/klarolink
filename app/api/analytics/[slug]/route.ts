import { type NextRequest, NextResponse } from "next/server"
import { getBusinessBySlug } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const business = await getBusinessBySlug(params.slug)
    if (!business) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    const { event_type, event_data } = await request.json()

    // Get client IP and user agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Insert analytics event
    await db.createAnalyticsEvent({
      business_id: business.id,
      event_type,
      event_data,
      ip_address: ip,
      user_agent: userAgent,
    })

    return NextResponse.json({
      message: "Event tracked successfully",
    })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
