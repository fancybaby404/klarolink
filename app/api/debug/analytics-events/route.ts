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

    console.log(`🔍 Debug: Getting analytics events for business ID: ${payload.businessId}`)

    // Try to get analytics events directly from database
    let analyticsEvents = []
    let analyticsError = null
    
    try {
      // This is a direct query to see what's in the analytics_events table
      if (db.query) {
        const result = await db.query(
          "SELECT event_type, COUNT(*) as count, MIN(created_at) as first_event, MAX(created_at) as last_event FROM analytics_events WHERE business_id = $1 GROUP BY event_type ORDER BY count DESC",
          [payload.businessId]
        )
        analyticsEvents = result
        console.log(`✅ Analytics events query result:`, result)
      }
    } catch (error) {
      console.error(`❌ Error querying analytics events:`, error)
      analyticsError = error.message
    }

    // Also get the calculated stats for comparison
    const calculatedStats = await db.getAnalyticsStats(payload.businessId)

    return NextResponse.json({
      businessId: payload.businessId,
      analyticsEvents,
      calculatedStats,
      analyticsError,
      summary: {
        pageViews: analyticsEvents.find(e => e.event_type === 'page_view')?.count || 0,
        formSubmits: analyticsEvents.find(e => e.event_type === 'form_submit')?.count || 0,
        completionRateCheck: analyticsEvents.length > 0 ? 
          `${analyticsEvents.find(e => e.event_type === 'form_submit')?.count || 0} ÷ ${analyticsEvents.find(e => e.event_type === 'page_view')?.count || 0} × 100` : 
          'No events found'
      },
      success: true
    })
  } catch (error) {
    console.error("❌ Analytics events debug error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
