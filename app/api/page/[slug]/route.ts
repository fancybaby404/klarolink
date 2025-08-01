import { type NextRequest, NextResponse } from "next/server"
import { getBusinessBySlug } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const business = await getBusinessBySlug(params.slug)
    if (!business) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Get feedback form
    const form = await db.getFeedbackForm(business.id)
    const formFields = form?.fields || []

    // Get social links
    const socialLinks = await db.getSocialLinks(business.id)

    return NextResponse.json({
      business,
      formFields,
      socialLinks,
    })
  } catch (error) {
    console.error("Page fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
