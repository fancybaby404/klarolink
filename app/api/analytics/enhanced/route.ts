import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database-adapter'
import { extractDataWithFallback } from '@/lib/field-categorization'

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

    const businessId = payload.businessId
    console.log(`📊 Getting enhanced analytics for business ID: ${businessId}`)

    // Check if we have a real database connection
    if (!db.query) {
      console.log('📝 Using mock database - returning sample analytics')
      return NextResponse.json({
        success: true,
        analytics: {
          overview: {
            totalFeedback: 25,
            totalProductReviews: 8,
            averageRating: 4.2,
            averageProductRating: 4.5,
            responseRate: 78
          },
          productRatings: {
            hasProductRatings: true,
            averageRating: 4.5,
            totalReviews: 8,
            topRatedProducts: [
              { id: 1, name: "Premium Product", rating: 4.8, reviewCount: 3 },
              { id: 2, name: "Standard Product", rating: 4.2, reviewCount: 5 }
            ]
          },
          recentActivity: [],
          trends: {
            feedbackTrend: "increasing",
            ratingTrend: "stable"
          }
        }
      })
    }

    // === 1. GENERAL FEEDBACK ANALYTICS ===
    const feedbackSubmissions = await db.query(`
      SELECT submission_data, submitted_at 
      FROM feedback_submissions 
      WHERE business_id = $1 
      ORDER BY submitted_at DESC
    `, [businessId])

    let totalFeedback = feedbackSubmissions.length
    let ratings: number[] = []
    let recentActivity: any[] = []

    feedbackSubmissions.forEach((submission, index) => {
      const extractedData = extractDataWithFallback(submission.submission_data || {})
      if (extractedData.rating) {
        ratings.push(extractedData.rating)
      }
      
      // Add to recent activity (last 10)
      if (index < 10) {
        recentActivity.push({
          type: 'feedback',
          rating: extractedData.rating,
          feedback: extractedData.feedbackText?.substring(0, 100),
          date: submission.submitted_at
        })
      }
    })

    const averageRating = ratings.length > 0 ? 
      Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0

    // === 2. PRODUCT RATINGS ANALYTICS ===
    let productRatingsData = {
      hasProductRatings: false,
      averageRating: 0,
      totalReviews: 0,
      topRatedProducts: [],
      recentReviews: []
    }

    try {
      // Check if product_reviews table exists and try different JOIN approaches
      let productReviews: any[] = []

      // Try standard JOIN first (product_id = product_id)
      try {
        productReviews = await db.query(`
          SELECT
            pr.rating,
            pr.comment,
            pr.created_at,
            p.product_name as product_name,
            p.product_id as product_id
          FROM product_reviews pr
          JOIN products p ON pr.product_id = p.product_id
          WHERE pr.business_id = $1
          ORDER BY pr.created_at DESC
        `, [businessId])

        console.log(`📊 Standard JOIN found ${productReviews.length} product reviews`)
      } catch (standardJoinError) {
        console.log('📊 Standard JOIN failed, trying alternative...', standardJoinError.message)

        // Try alternative JOIN (product_id = id) and different column names
        try {
          productReviews = await db.query(`
            SELECT
              pr.rating,
              pr.comment,
              pr.created_at,
              COALESCE(p.product_name, p.name) as product_name,
              COALESCE(p.product_id, p.id) as product_id
            FROM product_reviews pr
            JOIN products p ON pr.product_id = COALESCE(p.product_id, p.id)
            WHERE pr.business_id = $1
            ORDER BY pr.created_at DESC
          `, [businessId])

          console.log(`📊 Alternative JOIN found ${productReviews.length} product reviews`)
        } catch (alternativeJoinError) {
          console.log('📊 Alternative JOIN also failed:', alternativeJoinError.message)
          throw alternativeJoinError
        }
      }

      if (productReviews.length > 0) {
        productRatingsData.hasProductRatings = true
        productRatingsData.totalReviews = productReviews.length
        
        const productRatings = productReviews.map(r => r.rating)
        productRatingsData.averageRating = Math.round(
          (productRatings.reduce((a, b) => a + b, 0) / productRatings.length) * 10
        ) / 10

        // Get top rated products
        const productStats = productReviews.reduce((acc: any, review) => {
          const productId = review.product_id
          if (!acc[productId]) {
            acc[productId] = {
              id: productId,
              name: review.product_name,
              ratings: [],
              reviewCount: 0
            }
          }
          acc[productId].ratings.push(review.rating)
          acc[productId].reviewCount++
          return acc
        }, {})

        productRatingsData.topRatedProducts = Object.values(productStats)
          .map((product: any) => ({
            id: product.id,
            name: product.name,
            rating: Math.round((product.ratings.reduce((a: number, b: number) => a + b, 0) / product.ratings.length) * 10) / 10,
            reviewCount: product.reviewCount
          }))
          .sort((a: any, b: any) => b.rating - a.rating)
          .slice(0, 5)

        // Recent product reviews for activity feed
        productReviews.slice(0, 5).forEach(review => {
          recentActivity.push({
            type: 'product_review',
            productName: review.product_name,
            rating: review.rating,
            comment: review.comment?.substring(0, 100),
            date: review.created_at
          })
        })
      }
    } catch (productError) {
      console.log('Product reviews table not available or error:', productError)
      // This is fine - product ratings are optional
    }

    // === 3. ENABLED PRODUCTS ANALYTICS ===
    let enabledProductsData = {
      totalProducts: 0,
      enabledProducts: 0,
      enabledProductsList: []
    }

    try {
      const allProducts = await db.getProducts(businessId)
      enabledProductsData.totalProducts = allProducts.length

      const enabledProducts = await db.query(`
        SELECT ep.product_id, p.product_name
        FROM enabled_products ep
        JOIN products p ON ep.product_id = p.product_id
        WHERE ep.business_id = $1 AND ep.enabled = true
      `, [businessId])

      enabledProductsData.enabledProducts = enabledProducts.length
      enabledProductsData.enabledProductsList = enabledProducts.map(p => ({
        id: p.product_id,
        name: p.product_name
      }))
    } catch (enabledError) {
      console.log('Enabled products table not available:', enabledError)
      // Fallback to all products
      const allProducts = await db.getProducts(businessId)
      enabledProductsData.totalProducts = allProducts.length
      enabledProductsData.enabledProducts = allProducts.length
      enabledProductsData.enabledProductsList = allProducts.map(p => ({
        id: p.id,
        name: p.name
      }))
    }

    // === 4. ANALYTICS EVENTS ===
    let pageViews = 0
    let responseRate = 0

    try {
      const analyticsEvents = await db.query(`
        SELECT event_type, COUNT(*) as count
        FROM analytics_events 
        WHERE business_id = $1 
        GROUP BY event_type
      `, [businessId])

      const pageViewsData = analyticsEvents.find(e => e.event_type === 'page_view')
      const formSubmitsData = analyticsEvents.find(e => e.event_type === 'form_submit')
      
      pageViews = pageViewsData ? parseInt(pageViewsData.count) : 0
      const formSubmits = formSubmitsData ? parseInt(formSubmitsData.count) : 0
      
      responseRate = pageViews > 0 ? Math.round((formSubmits / pageViews) * 100) : 0
    } catch (analyticsError) {
      console.log('Analytics events not available:', analyticsError)
    }

    // === 5. TRENDS ANALYSIS ===
    const trends = {
      feedbackTrend: totalFeedback > 10 ? 'increasing' : totalFeedback > 5 ? 'stable' : 'low',
      ratingTrend: averageRating >= 4 ? 'excellent' : averageRating >= 3 ? 'good' : 'needs_improvement',
      productRatingTrend: productRatingsData.averageRating >= 4 ? 'excellent' : 
                         productRatingsData.averageRating >= 3 ? 'good' : 'needs_improvement'
    }

    // Sort recent activity by date
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    console.log(`✅ Enhanced analytics generated: ${totalFeedback} feedback, ${productRatingsData.totalReviews} product reviews`)

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalFeedback,
          totalProductReviews: productRatingsData.totalReviews,
          averageRating,
          averageProductRating: productRatingsData.averageRating,
          responseRate,
          pageViews
        },
        productRatings: productRatingsData,
        enabledProducts: enabledProductsData,
        recentActivity: recentActivity.slice(0, 15),
        trends,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error getting enhanced analytics:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics', details: error.message },
      { status: 500 }
    )
  }
}
