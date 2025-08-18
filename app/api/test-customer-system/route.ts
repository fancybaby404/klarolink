import { NextRequest, NextResponse } from "next/server"
import { createCustomer, getCustomerByEmail, getBusinessBySlug, verifyPassword, generateCustomerToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Customer Registration and Authentication System')
    
    // Step 1: Get demo business
    const demoBusiness = await getBusinessBySlug('demo-business')
    if (!demoBusiness) {
      return NextResponse.json({
        error: 'Demo business not found',
        message: 'Please ensure demo business exists with slug "demo-business"'
      }, { status: 404 })
    }
    
    console.log(`✅ Demo business found: ${demoBusiness.name} (ID: ${demoBusiness.id})`)
    
    // Step 2: Test customer registration
    const testCustomerData = {
      business_id: demoBusiness.id,
      first_name: 'Test',
      last_name: 'Customer',
      email: `test-customer-${Date.now()}@example.com`,
      password: 'testpassword123',
      phone_number: '1234567890',
      preferred_contact_method: 'email' as const,
      address: '123 Test Street',
      gender: 'other'
    }
    
    console.log('🔍 Step 2: Testing customer registration...')
    
    let newCustomer
    try {
      newCustomer = await createCustomer(testCustomerData)
      console.log(`✅ Customer created: ${newCustomer.email} (ID: ${newCustomer.customer_id})`)
    } catch (error) {
      return NextResponse.json({
        error: 'Customer registration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        step: 'registration'
      }, { status: 500 })
    }
    
    // Step 3: Test customer login
    console.log('🔍 Step 3: Testing customer authentication...')
    
    const foundCustomer = await getCustomerByEmail(testCustomerData.email, demoBusiness.id)
    if (!foundCustomer) {
      return NextResponse.json({
        error: 'Customer not found after registration',
        step: 'authentication'
      }, { status: 500 })
    }
    
    // Test password verification
    const isPasswordValid = await verifyPassword(testCustomerData.password, foundCustomer.password)
    if (!isPasswordValid) {
      return NextResponse.json({
        error: 'Password verification failed',
        step: 'authentication'
      }, { status: 500 })
    }
    
    // Generate token
    const token = generateCustomerToken(foundCustomer.customer_id)
    console.log(`✅ Customer authentication successful, token generated`)
    
    // Step 4: Test business association validation
    console.log('🔍 Step 4: Testing business association validation...')
    
    const hasAccess = await db.validateCustomerBusinessAccess(foundCustomer.customer_id, demoBusiness.id)
    if (!hasAccess) {
      return NextResponse.json({
        error: 'Customer business access validation failed',
        step: 'business_access'
      }, { status: 500 })
    }
    
    console.log(`✅ Customer has valid access to business`)
    
    // Step 5: Test duplicate email prevention
    console.log('🔍 Step 5: Testing duplicate email prevention...')
    
    try {
      await createCustomer({
        ...testCustomerData,
        first_name: 'Duplicate',
        last_name: 'Test'
      })
      
      return NextResponse.json({
        error: 'Duplicate email validation failed - should have thrown error',
        step: 'duplicate_prevention'
      }, { status: 500 })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log(`✅ Duplicate email prevention working correctly`)
      } else {
        return NextResponse.json({
          error: 'Unexpected error during duplicate email test',
          message: error instanceof Error ? error.message : 'Unknown error',
          step: 'duplicate_prevention'
        }, { status: 500 })
      }
    }
    
    // Step 6: Test feedback submission integration
    console.log('🔍 Step 6: Testing feedback submission integration...')
    
    const feedbackForm = await db.getFeedbackForm(demoBusiness.id)
    if (!feedbackForm) {
      return NextResponse.json({
        error: 'No feedback form found for demo business',
        step: 'feedback_integration'
      }, { status: 404 })
    }
    
    // Create a test feedback submission
    const testSubmissionData = {
      'test-field': 'Test feedback from customer system test',
      'rating-field': 5
    }
    
    try {
      await db.createFeedbackSubmission({
        business_id: demoBusiness.id,
        form_id: feedbackForm.id,
        user_id: foundCustomer.customer_id, // Using customer_id as user_id
        submission_data: {
          ...testSubmissionData,
          submitted_by_type: 'customer',
          submitted_by_email: foundCustomer.email
        },
        ip_address: '127.0.0.1',
        user_agent: 'Customer System Test'
      })
      
      console.log(`✅ Feedback submission created successfully`)
    } catch (error) {
      return NextResponse.json({
        error: 'Feedback submission failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        step: 'feedback_integration'
      }, { status: 500 })
    }
    
    // Step 7: Verify customer data in database
    console.log('🔍 Step 7: Verifying customer data in database...')
    
    const customerFromDb = await db.getCustomer(foundCustomer.customer_id)
    if (!customerFromDb) {
      return NextResponse.json({
        error: 'Customer not found in database after creation',
        step: 'database_verification'
      }, { status: 500 })
    }
    
    console.log('🎉 All tests passed successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Customer registration and authentication system is working correctly',
      testResults: {
        businessFound: {
          id: demoBusiness.id,
          name: demoBusiness.name,
          slug: demoBusiness.slug
        },
        customerRegistration: {
          success: true,
          customerId: newCustomer.customer_id,
          email: newCustomer.email,
          businessId: newCustomer.business_id,
          status: newCustomer.customer_status,
          registrationDate: newCustomer.registration_date
        },
        authentication: {
          success: true,
          tokenGenerated: !!token,
          passwordVerified: isPasswordValid
        },
        businessAccess: {
          success: true,
          hasAccess: hasAccess
        },
        duplicatePrevention: {
          success: true,
          message: 'Duplicate email correctly rejected'
        },
        feedbackIntegration: {
          success: true,
          formId: feedbackForm.id,
          submissionCreated: true
        },
        databaseVerification: {
          success: true,
          customerFoundInDb: !!customerFromDb
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Customer system test failed:', error)
    return NextResponse.json({
      error: 'Customer system test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
