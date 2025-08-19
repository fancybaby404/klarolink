import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getBusiness } from "@/lib/auth"
import { db } from "@/lib/database-adapter"
import { extractDataWithFallback, categorizeFormFields, addBackwardCompatibilityCategories } from "@/lib/field-categorization"

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

    // Get dashboard statistics
    const stats = await db.getAnalyticsStats(business.id)
    const recentFeedback = await db.getFeedbackSubmissions(business.id, 5)
    const socialLinks = await db.getSocialLinks(business.id)
    const feedbackForm = await db.getFeedbackForm(business.id)
    const products = await db.getProducts(business.id)

    const formattedRecentFeedback = recentFeedback.map((feedback) => {
      // Use enhanced field categorization with backward compatibility
      let extractedData
      if (feedbackForm?.fields) {
        // Add backward compatibility categories for existing forms
        const enhancedFields = addBackwardCompatibilityCategories(feedbackForm.fields)
        extractedData = extractDataWithFallback(feedback.submission_data || {}, categorizeFormFields(enhancedFields))
      } else {
        extractedData = extractDataWithFallback(feedback.submission_data || {})
      }

      return {
        id: feedback.id,
        rating: extractedData.rating || 0,
        feedback: extractedData.feedbackText || "No feedback text",
        submitted_at: feedback.submitted_at,
        submission_data: feedback.submission_data, // Include for frontend fallback
      }
    })

    return NextResponse.json({
      business,
      socialLinks,
      feedbackForm,
      products,
      stats: {
        ...stats,
        recentFeedback: formattedRecentFeedback,
      },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
