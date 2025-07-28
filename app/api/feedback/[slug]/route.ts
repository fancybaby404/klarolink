import { type NextRequest, NextResponse } from "next/server"
import { getBusinessBySlug } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const business = await getBusinessBySlug(params.slug)
    if (!business) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    const { formData } = await request.json()

    // Get the active feedback form
    const form = await db.getFeedbackForm(business.id)
    if (!form) {
      return NextResponse.json({ error: "No active feedback form found" }, { status: 404 })
    }

    // Get client IP and user agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Insert feedback submission
    await db.createFeedbackSubmission({
      business_id: business.id,
      form_id: form.id,
      submission_data: formData,
      ip_address: ip,
      user_agent: userAgent,
    })

    return NextResponse.json({
      message: "Feedback submitted successfully",
    })
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
