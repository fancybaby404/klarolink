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
    console.log(`🔍 COMPREHENSIVE TEST: Testing both products and audience for business ID: ${businessId}`)

    // === TEST 1: PRODUCTS ISSUE ===
    console.log('\n=== TESTING PRODUCTS ISSUE ===')
    
    let productsTest = {
      directQuery: { count: 0, error: null, sample: [] },
      adapterMethod: { count: 0, error: null, sample: [] },
      apiEndpoint: { count: 0, error: null, result: null }
    }

    // Direct SQL query to products table
    try {
      if (db.query) {
        const directResults = await db.query(`SELECT * FROM products LIMIT 5`)
        productsTest.directQuery.count = directResults.length
        productsTest.directQuery.sample = directResults.map(p => ({
          product_id: p.product_id,
          product_name: p.product_name,
          product_category: p.product_category,
          has_business_id: 'business_id' in p
        }))
        console.log(`📊 Direct query found ${directResults.length} products`)
      }
    } catch (error: any) {
      productsTest.directQuery.error = error.message
    }

    // Database adapter method
    try {
      const adapterResults = await db.getProducts(businessId)
      productsTest.adapterMethod.count = adapterResults.length
      productsTest.adapterMethod.sample = adapterResults.slice(0, 3)
      console.log(`📊 Adapter method returned ${adapterResults.length} products`)
    } catch (error: any) {
      productsTest.adapterMethod.error = error.message
    }

    // === TEST 2: AUDIENCE/PASSIVES ISSUE ===
    console.log('\n=== TESTING AUDIENCE/PASSIVES ISSUE ===')
    
    let audienceTest = {
      feedbackSubmissions: { count: 0, error: null, sample: [] },
      dataExtraction: { ratingsFound: 0, textFound: 0, samples: [] },
      customerProfiles: { count: 0, error: null, breakdown: {} },
      passivesCalculation: { passives: 0, promoters: 0, detractors: 0 }
    }

    // Get feedback submissions
    try {
      const submissions = await db.getFeedbackSubmissions(businessId, 20)
      audienceTest.feedbackSubmissions.count = submissions.length
      audienceTest.feedbackSubmissions.sample = submissions.slice(0, 3).map(s => ({
        id: s.id,
        business_id: s.business_id,
        submission_data_keys: Object.keys(s.submission_data || {}),
        submitted_at: s.submitted_at
      }))
      console.log(`📊 Found ${submissions.length} feedback submissions`)

      // Test data extraction on each submission
      submissions.forEach((submission, index) => {
        if (index < 5) { // Test first 5
          const extracted = extractDataWithFallback(submission.submission_data || {})
          audienceTest.dataExtraction.samples.push({
            submissionId: submission.id,
            rawData: submission.submission_data,
            extractedRating: extracted.rating,
            extractedText: extracted.feedbackText?.substring(0, 50),
            hasRating: extracted.rating !== null,
            hasText: extracted.feedbackText !== null
          })
          
          if (extracted.rating !== null) audienceTest.dataExtraction.ratingsFound++
          if (extracted.feedbackText !== null) audienceTest.dataExtraction.textFound++
        }
      })

    } catch (error: any) {
      audienceTest.feedbackSubmissions.error = error.message
    }

    // Get customer profiles
    try {
      const customerProfiles = await db.getCustomerProfiles(businessId)
      audienceTest.customerProfiles.count = customerProfiles.length
      
      // Calculate breakdown
      const promoters = customerProfiles.filter(c => c.average_rating >= 4)
      const passives = customerProfiles.filter(c => c.average_rating >= 3 && c.average_rating < 4)
      const detractors = customerProfiles.filter(c => c.average_rating <= 2)
      
      audienceTest.passivesCalculation = {
        passives: passives.length,
        promoters: promoters.length,
        detractors: detractors.length
      }
      
      audienceTest.customerProfiles.breakdown = {
        totalCustomers: customerProfiles.length,
        customersWithRatings: customerProfiles.filter(c => c.average_rating > 0).length,
        averageRatings: customerProfiles.map(c => c.average_rating),
        passiveCustomers: passives.map(c => ({
          email: c.email,
          name: c.name,
          average_rating: c.average_rating,
          total_submissions: c.total_submissions
        }))
      }
      
      console.log(`📊 Generated ${customerProfiles.length} customer profiles`)
      console.log(`📊 Passives: ${passives.length}, Promoters: ${promoters.length}, Detractors: ${detractors.length}`)
      
    } catch (error: any) {
      audienceTest.customerProfiles.error = error.message
    }

    // === DIAGNOSIS ===
    const diagnosis = {
      productsIssue: {
        hasProducts: productsTest.directQuery.count > 0,
        adapterWorking: productsTest.adapterMethod.count > 0,
        likelyIssue: productsTest.directQuery.count > 0 && productsTest.adapterMethod.count === 0 ? 
          "Database adapter issue (likely business_id column missing)" : 
          productsTest.directQuery.count === 0 ? "No products in database" : "Working correctly"
      },
      
      passivesIssue: {
        hasSubmissions: audienceTest.feedbackSubmissions.count > 0,
        extractionWorking: audienceTest.dataExtraction.ratingsFound > 0,
        profilesGenerated: audienceTest.customerProfiles.count > 0,
        passivesFound: audienceTest.passivesCalculation.passives > 0,
        likelyIssue: 
          audienceTest.feedbackSubmissions.count === 0 ? "No feedback submissions" :
          audienceTest.dataExtraction.ratingsFound === 0 ? "Rating extraction failing" :
          audienceTest.customerProfiles.count === 0 ? "Customer profile generation failing" :
          audienceTest.passivesCalculation.passives === 0 ? "No customers with ratings 3-4" : "Working correctly"
      }
    }

    // === QUICK FIXES ===
    const quickFixes = []
    
    if (productsTest.directQuery.count > 0 && productsTest.adapterMethod.count === 0) {
      quickFixes.push({
        issue: "Products table has data but adapter returns empty",
        fix: "Fixed: Updated getProducts method to handle missing business_id column",
        action: "Restart server and test again"
      })
    }
    
    if (audienceTest.feedbackSubmissions.count === 0) {
      quickFixes.push({
        issue: "No feedback submissions found",
        fix: "Use /api/debug/insert-sample-data to add test submissions",
        action: "POST to /api/debug/insert-sample-data"
      })
    }
    
    if (audienceTest.dataExtraction.ratingsFound === 0 && audienceTest.feedbackSubmissions.count > 0) {
      quickFixes.push({
        issue: "Rating extraction failing",
        fix: "Enhanced rating detection in field-categorization.ts",
        action: "Check submission_data format in logs"
      })
    }

    return NextResponse.json({
      businessId,
      timestamp: new Date().toISOString(),
      
      // Test Results
      tests: {
        products: productsTest,
        audience: audienceTest
      },
      
      // Diagnosis
      diagnosis,
      
      // Quick Fixes
      quickFixes,
      
      // Summary
      summary: {
        productsWorking: productsTest.adapterMethod.count > 0,
        passivesWorking: audienceTest.passivesCalculation.passives > 0,
        overallStatus: 
          productsTest.adapterMethod.count > 0 && audienceTest.passivesCalculation.passives > 0 ? "✅ Both working" :
          productsTest.adapterMethod.count > 0 ? "⚠️ Products working, passives need fix" :
          audienceTest.passivesCalculation.passives > 0 ? "⚠️ Passives working, products need fix" :
          "❌ Both need fixes"
      },
      
      success: true
    })

  } catch (error: any) {
    console.error('❌ Comprehensive test error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
