import { type NextRequest, NextResponse } from "next/server"
import { getBusinessBySlug, verifyUserToken, verifyCustomerToken, getUser, getCustomer } from "@/lib/auth"
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
    // Try to verify as customer token first, then fall back to user token
    let customer = null
    let user = null
    let authenticatedUserId = null

    const customerPayload = verifyCustomerToken(token)
    if (customerPayload) {
      // Customer authentication
      customer = await getCustomer(customerPayload.customerId)
      if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 401 })
      }

      // Verify customer has access to this business
      if (customer.business_id !== business.id) {
        return NextResponse.json({ error: "Access denied for this business" }, { status: 403 })
      }

      // Check if customer is active
      if (customer.customer_status !== 'active') {
        return NextResponse.json({ error: "Customer account is inactive" }, { status: 401 })
      }

      authenticatedUserId = customer.customer_id
      console.log(`✅ Customer authenticated: ${customer.email} (ID: ${customer.customer_id})`)
    } else {
      // Fall back to user authentication for backward compatibility
      const userPayload = verifyUserToken(token)
      if (!userPayload) {
        return NextResponse.json({ error: "Invalid or expired token. Please log in again." }, { status: 401 })
      }

      user = await getUser(userPayload.userId)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 })
      }

      authenticatedUserId = user.id
      console.log(`✅ User authenticated: ${user.email} (ID: ${user.id})`)
    }

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

    // Insert feedback submission with authenticated user/customer ID and referral tracking
    await db.createFeedbackSubmission({
      business_id: business.id,
      form_id: form.id,
      user_id: authenticatedUserId, // This will be customer_id for customers or user.id for legacy users
      submission_data: {
        ...formData,
        referral_code: referralCode,
        submitted_by_type: customer ? 'customer' : 'user', // Track submission type
        submitted_by_email: customer ? customer.email : user?.email,
      },
      ip_address: ip,
      user_agent: userAgent,
    })

    // Complete referral if this is a referred user's first feedback
    if (referralCode) {
      try {
        await db.completeReferral(referralCode, authenticatedUserId)
      } catch (error) {
        // Don't fail the feedback submission if referral completion fails
      }
    }

    return NextResponse.json({
      message: "Feedback submitted successfully",
      submitter: {
        name: customer
          ? `${customer.first_name} ${customer.last_name}`.trim()
          : user
            ? `${user.first_name} ${user.last_name}`.trim()
            : "Unknown",
        email: customer ? customer.email : user?.email || "unknown",
      },
    })
  } catch (error) {
    console.error("❌ Feedback submission error:", error)
    console.error("❌ Error details:", error instanceof Error ? error.message : 'Unknown error')
    console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
