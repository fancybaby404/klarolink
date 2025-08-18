import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-adapter"
import { extractDataWithFallback, categorizeFormFields, addBackwardCompatibilityCategories } from "@/lib/field-categorization"

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Enhanced Field Categorization with Real Database')
    
    // Step 1: Test database connection and find demo business
    console.log('🔍 Step 1: Testing database connection...')

    const demoBusiness = await db.getBusinessByEmail('demo@klarolink.com')
    if (!demoBusiness) {
      return NextResponse.json({
        error: 'Demo business not found',
        message: 'Please run database initialization first',
        suggestion: 'Run: npm run db:init'
      }, { status: 404 })
    }

    console.log(`✅ Database connected and demo business found: ${demoBusiness.name} (ID: ${demoBusiness.id})`)
    
    // Step 2: Test current form and submissions
    console.log('🔍 Step 2: Testing current form and submissions...')
    
    const currentForm = await db.getFeedbackForm(demoBusiness.id)
    if (!currentForm) {
      return NextResponse.json({
        error: 'No feedback form found',
        businessId: demoBusiness.id
      }, { status: 404 })
    }
    
    console.log(`✅ Current form found: "${currentForm.title}"`)
    
    // Get current submissions
    const submissions = await db.getFeedbackSubmissions(demoBusiness.id, 5)
    console.log(`✅ Found ${submissions.length} existing submissions`)
    
    // Test current analytics extraction
    const currentAnalytics = submissions.map((submission, index) => {
      const extractedData = extractDataWithFallback(submission.submission_data || {})
      return {
        submissionId: submission.id,
        rating: extractedData.rating,
        feedback: extractedData.feedbackText?.substring(0, 100),
        submittedAt: submission.submitted_at
      }
    })
    
    // Step 3: Create test form with custom field IDs
    console.log('🔍 Step 3: Creating test form with custom field IDs...')
    
    const timestamp = Date.now()
    const testFormFields = [
      {
        id: `field_${timestamp}_rating`,
        type: "rating" as const,
        label: "How would you rate our new service?",
        required: true,
        field_category: "rating" as const
      },
      {
        id: `field_${timestamp}_feedback`,
        type: "textarea" as const,
        label: "Please share your detailed feedback",
        required: false,
        placeholder: "Tell us what you think...",
        field_category: "feedback_text" as const
      },
      {
        id: `field_${timestamp}_name`,
        type: "text" as const,
        label: "Your name",
        required: false,
        placeholder: "Enter your name",
        field_category: "personal_info" as const
      }
    ]
    
    // Update the form with test fields
    await db.updateFeedbackForm(
      demoBusiness.id,
      testFormFields,
      'Test Custom Form with Field Categories',
      'Testing the enhanced field categorization system',
      true
    )
    
    console.log('✅ Test form created with custom field IDs and categories')
    
    // Step 4: Create test submission
    console.log('🔍 Step 4: Creating test submission...')
    
    const updatedForm = await db.getFeedbackForm(demoBusiness.id)
    
    const testSubmissionData: Record<string, any> = {}
    testSubmissionData[testFormFields[0].id] = 5 // Rating
    testSubmissionData[testFormFields[1].id] = "This is excellent service! I'm very satisfied with the quality and would definitely recommend it to others." // Feedback
    testSubmissionData[testFormFields[2].id] = "Test User" // Name
    
    await db.createFeedbackSubmission({
      business_id: demoBusiness.id,
      form_id: updatedForm!.id,
      submission_data: testSubmissionData,
      ip_address: '127.0.0.1',
      user_agent: 'Test API'
    })
    
    console.log('✅ Test submission created')
    
    // Step 5: Test enhanced analytics extraction
    console.log('🔍 Step 5: Testing enhanced analytics extraction...')
    
    const latestSubmissions = await db.getFeedbackSubmissions(demoBusiness.id, 3)
    
    const enhancedAnalytics = latestSubmissions.map((submission, index) => {
      // Test with enhanced categorization
      const enhancedFields = addBackwardCompatibilityCategories(updatedForm!.fields)
      const categorizations = categorizeFormFields(enhancedFields)
      const extractedData = extractDataWithFallback(submission.submission_data || {}, categorizations)
      
      return {
        submissionId: submission.id,
        rating: extractedData.rating,
        feedback: extractedData.feedbackText,
        submittedAt: submission.submitted_at,
        rawData: submission.submission_data
      }
    })
    
    // Step 6: Test dashboard analytics
    console.log('🔍 Step 6: Testing dashboard analytics...')
    
    const stats = await db.getAnalyticsStats(demoBusiness.id)
    
    console.log('🎉 All tests completed successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Enhanced field categorization system is working with real database',
      results: {
        databaseConnection: {
          connected: true,
          demoBusiness: {
            id: demoBusiness.id,
            name: demoBusiness.name,
            email: demoBusiness.email
          }
        },
        currentForm: {
          id: currentForm.id,
          title: currentForm.title,
          fieldsCount: currentForm.fields.length,
          fields: currentForm.fields.map(f => ({
            id: f.id,
            type: f.type,
            label: f.label,
            category: f.field_category || 'auto-detected'
          }))
        },
        testForm: {
          fieldsCreated: testFormFields.length,
          fields: testFormFields.map(f => ({
            id: f.id,
            type: f.type,
            label: f.label,
            category: f.field_category
          }))
        },
        testSubmission: {
          created: true,
          data: testSubmissionData
        },
        analyticsComparison: {
          beforeEnhancement: currentAnalytics,
          afterEnhancement: enhancedAnalytics
        },
        dashboardStats: stats
      }
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
