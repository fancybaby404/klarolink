import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const business = await verifyToken(token)
    if (!business) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { social_links } = body

    if (!Array.isArray(social_links)) {
      return NextResponse.json({ error: "Invalid social links data" }, { status: 400 })
    }

    console.log(`🔍 Updating social links for business ID: ${business.id}`)
    console.log(`📝 Social links:`, social_links)

    // Update social links for this business
    await db.updateSocialLinks(business.id, social_links.map(link => ({
      platform: link.platform,
      url: link.url,
      display_order: link.display_order || 0,
      is_active: link.is_active !== false
    })))

    console.log(`✅ Social links updated successfully for business ID: ${business.id}`)
    
    return NextResponse.json({ 
      success: true, 
      message: "Social links updated successfully" 
    })
  } catch (error) {
    console.error("Social links update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
