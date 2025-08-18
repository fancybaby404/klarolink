import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-adapter"
import { extractDataWithFallback, categorizeFormFields, addBackwardCompatibilityCategories } from "@/lib/field-categorization"

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Dashboard Analytics with Enhanced Field Categorization')
    
    // Find demo business
    const demoBusiness = await db.getBusinessByEmail('demo@klarolink.com')
    if (!demoBusiness) {
      return NextResponse.json({
        error: 'Demo business not found',
        message: 'Please run database initialization first'
      }, { status: 404 })
    }
    
    // Simulate the dashboard API logic
    console.log('🔍 Testing dashboard analytics logic...')
    
    // Get dashboard statistics (same as dashboard API)
    const stats = await db.getAnalyticsStats(demoBusiness.id)
    const recentFeedback = await db.getFeedbackSubmissions(demoBusiness.id, 5)
    const socialLinks = await db.getSocialLinks(demoBusiness.id)
    const feedbackForm = await db.getFeedbackForm(demoBusiness.id)
    
    // Test the enhanced analytics processing (same logic as dashboard API)
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
        submission_data: feedback.submission_data, // Include for debugging
      }
    })
    
    // Test specific scenarios
    console.log('🔍 Testing specific field categorization scenarios...')
    
    const testResults = {
      // Test 1: Custom field IDs with explicit categories
      customFieldsWithCategories: [],
      // Test 2: Legacy fields without categories
      legacyFieldsAutoDetected: [],
      // Test 3: Edge cases
      edgeCases: []
    }
    
    for (const feedback of recentFeedback) {
      const submissionData = feedback.submission_data || {}
      const fieldIds = Object.keys(submissionData)
      
      // Categorize this submission
      let category = 'unknown'
      if (fieldIds.some(id => id.startsWith('field_') && id.includes('_rating'))) {
        category = 'customFieldsWithCategories'
      } else if (fieldIds.includes('rating') || fieldIds.includes('feedback')) {
        category = 'legacyFieldsAutoDetected'
      } else {
        category = 'edgeCases'
      }
      
      const enhancedFields = feedbackForm?.fields ? addBackwardCompatibilityCategories(feedbackForm.fields) : []
      const categorizations = categorizeFormFields(enhancedFields)
      const extractedData = extractDataWithFallback(submissionData, categorizations)
      
      testResults[category as keyof typeof testResults].push({
        submissionId: feedback.id,
        fieldIds: fieldIds,
        extractedRating: extractedData.rating,
        extractedFeedback: extractedData.feedbackText?.substring(0, 100),
        rawData: submissionData
      })
    }
    
    // Check if the problematic case is fixed
    const hasCustomFieldSubmissions = testResults.customFieldsWithCategories.length > 0
    const customFieldsWorkCorrectly = testResults.customFieldsWithCategories.every(
      result => result.extractedRating !== null && result.extractedFeedback !== null
    )
    
    console.log('🎉 Dashboard analytics test completed!')
    
    return NextResponse.json({
      success: true,
      message: 'Dashboard analytics testing completed',
      results: {
        business: {
          id: demoBusiness.id,
          name: demoBusiness.name,
          email: demoBusiness.email
        },
        form: {
          id: feedbackForm?.id,
          title: feedbackForm?.title,
          fieldsCount: feedbackForm?.fields.length || 0,
          fields: feedbackForm?.fields.map(f => ({
            id: f.id,
            type: f.type,
            label: f.label,
            hasCategory: !!f.field_category,
            category: f.field_category || 'auto-detected'
          })) || []
        },
        dashboardStats: stats,
        recentFeedbackProcessing: {
          totalSubmissions: recentFeedback.length,
          processedSubmissions: formattedRecentFeedback.length,
          submissionsWithRating: formattedRecentFeedback.filter(f => f.rating > 0).length,
          submissionsWithFeedback: formattedRecentFeedback.filter(f => f.feedback !== "No feedback text").length
        },
        fieldCategorizationTests: testResults,
        problemResolution: {
          hasCustomFieldSubmissions,
          customFieldsWorkCorrectly,
          isFixed: hasCustomFieldSubmissions && customFieldsWorkCorrectly,
          message: hasCustomFieldSubmissions 
            ? (customFieldsWorkCorrectly 
                ? "✅ Custom field submissions are correctly processed!" 
                : "❌ Custom field submissions still have issues")
            : "ℹ️ No custom field submissions found to test"
        },
        formattedRecentFeedback: formattedRecentFeedback.map(f => ({
          id: f.id,
          rating: f.rating,
          feedback: f.feedback.substring(0, 100) + (f.feedback.length > 100 ? '...' : ''),
          submitted_at: f.submitted_at
        }))
      }
    })
    
  } catch (error) {
    console.error('❌ Dashboard analytics test failed:', error)
    return NextResponse.json({
      error: 'Dashboard analytics test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
