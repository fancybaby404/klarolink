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
    const formTitle = form?.title || "Share Your Experience"
    const formDescription = form?.description || "Your feedback helps us improve our service"
    const previewEnabled = business.preview_enabled === true // Use business.preview_enabled column

    console.log(`🔍 Page data for ${params.slug}:`, {
      businessId: business.id,
      businessPreviewEnabled: business.preview_enabled,
      formExists: !!form,
      finalPreviewEnabled: previewEnabled
    })

    // Get social links
    const socialLinks = await db.getSocialLinks(business.id)

    // Get enabled products only
    let products = []
    try {
      // Check if enabled_products table exists and get enabled products
      if (db.query) {
        const enabledResult = await db.query(`
          SELECT product_id
          FROM enabled_products
          WHERE business_id = $1 AND enabled = true
        `, [business.id])

        const enabledProductIds = enabledResult.map(row => row.product_id)

        if (enabledProductIds.length > 0) {
          // Get all products and filter to enabled ones
          const allProducts = await db.getProducts(business.id)
          products = allProducts.filter(product => enabledProductIds.includes(product.id))
          console.log(`📊 Showing ${products.length} enabled products out of ${allProducts.length} total`)
        } else {
          // No enabled products found, show all products by default
          products = await db.getProducts(business.id)
          console.log(`📊 No enabled products configured, showing all ${products.length} products`)
        }
      } else {
        // Fallback to all products if no database connection
        products = await db.getProducts(business.id)
      }
    } catch (error) {
      console.log('Error getting enabled products, falling back to all products:', error)
      products = await db.getProducts(business.id)
    }

    return NextResponse.json({
      business,
      formFields,
      formTitle,
      formDescription,
      socialLinks,
      products,
      previewEnabled,
    })
  } catch (error) {
    console.error("Page fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
