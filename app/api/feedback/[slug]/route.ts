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
    const payload = verifyUserToken(token) // Note: uses userToken from public page, not business token
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token. Please log in again." }, { status: 401 })
    }

    // Verify user exists
    const user = await getUser(payload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Note: We don't check is_active here because it refers to business preview status, not user account status

    const { formData, referralCode } = await request.json()

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

    // Insert feedback submission with user_id and referral tracking
    await db.createFeedbackSubmission({
      business_id: business.id,
      form_id: form.id,
      user_id: user.id,
      submission_data: {
        ...formData,
        referral_code: referralCode,
      },
      ip_address: ip,
      user_agent: userAgent,
    })

    // Complete referral if this is a referred user's first feedback
    if (referralCode) {
      try {
        await db.completeReferral(referralCode, user.id)
      } catch (error) {
        // Don't fail the feedback submission if referral completion fails
      }
    }

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
