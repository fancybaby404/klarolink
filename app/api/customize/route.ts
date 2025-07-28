import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getBusiness, updateBusinessBackground } from "@/lib/auth"
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

    // Get feedback form fields
    const form = await db.getFeedbackForm(business.id)
    const formFields = form?.fields || []

    // Get social links
    const socialLinks = await db.getSocialLinks(business.id)

    return NextResponse.json({
      formFields,
      socialLinks,
      backgroundType: business.background_type,
      backgroundColor: business.background_type === "color" ? business.background_value : "#6366f1",
      backgroundImage: business.background_type === "image" ? business.background_value : "",
    })
  } catch (error) {
    console.error("Customize fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { formFields, socialLinks, backgroundType, backgroundColor, backgroundImage } = await request.json()

    // Update business background settings
    await updateBusinessBackground(
      business.id,
      backgroundType,
      backgroundType === "image" ? backgroundImage : backgroundColor,
    )

    // Update feedback form
    await db.updateFeedbackForm(business.id, formFields)

    // Update social links
    const linksToUpdate = socialLinks.map((link: any, index: number) => ({
      platform: link.platform,
      url: link.url,
      display_order: index,
      is_active: link.is_active,
    }))

    await db.updateSocialLinks(business.id, linksToUpdate)

    return NextResponse.json({
      message: "Customization saved successfully",
    })
  } catch (error) {
    console.error("Customize save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
