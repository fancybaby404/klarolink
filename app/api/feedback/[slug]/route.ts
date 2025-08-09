import { type NextRequest, NextResponse } from "next/server"
import { getBusinessBySlug, verifyUserToken, getUser } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const business = await getBusinessBySlug(params.slug)
    if (!business) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Check for authentication token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required. Please log in to submit feedback." }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyUserToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token. Please log in again." }, { status: 401 })
    }

    // Verify user exists and is active
    const user = await getUser(payload.userId)
    if (!user || !user.is_active) {
      return NextResponse.json({ error: "User account not found or deactivated." }, { status: 401 })
    }

    const { formData } = await request.json()

    // Get the active feedback form
    const form = await db.getFeedbackForm(business.id)
    if (!form) {
      return NextResponse.json({ error: "No active feedback form found" }, { status: 404 })
    }

    // Check if form preview is enabled
    if (!form.preview_enabled) {
      return NextResponse.json({ error: "Feedback form is currently disabled" }, { status: 403 })
    }

    // Get client IP and user agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Insert feedback submission with user_id
    await db.createFeedbackSubmission({
      business_id: business.id,
      form_id: form.id,
      user_id: user.id,
      submission_data: formData,
      ip_address: ip,
      user_agent: userAgent,
    })

    return NextResponse.json({
      message: "Feedback submitted successfully",
      submitter: {
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
