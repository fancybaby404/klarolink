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
    console.log(`🔍 VALIDATION: Checking data for business ID: ${businessId}`)

    // === STEP 1: Check Raw Database Data ===
    let rawFeedbackSubmissions: any[] = []
    let dbError = null

    try {
      if (db.query) {
        rawFeedbackSubmissions = await db.query(
          "SELECT id, business_id, form_id, submission_data, submitted_at FROM feedback_submissions WHERE business_id = $1 ORDER BY submitted_at DESC LIMIT 20",
          [businessId]
        )
      }
    } catch (error: any) {
      dbError = error.message
    }

    // === STEP 2: Test Data Extraction ===
    const extractionTests = rawFeedbackSubmissions.map((submission, index) => {
      const extractedData = extractDataWithFallback(submission.submission_data || {})
      return {
        submissionId: submission.id,
        rawData: submission.submission_data,
        extractedRating: extractedData.rating,
        extractedFeedback: extractedData.feedbackText,
        hasRating: extractedData.rating !== null,
        hasFeedback: extractedData.feedbackText !== null && extractedData.feedbackText.length > 0,
        ratingRange: extractedData.rating ? (
          extractedData.rating >= 4 ? 'promoter' :
          extractedData.rating >= 3 ? 'passive' :
          'detractor'
        ) : 'no_rating'
      }
    })

    // === STEP 3: Test Customer Profile Generation ===
    const customerProfiles = await db.getCustomerProfiles(businessId)
    const audienceStats = {
      totalCustomers: customerProfiles.length,
      promoters: customerProfiles.filter(c => c.average_rating >= 4).length,
      passives: customerProfiles.filter(c => c.average_rating >= 3 && c.average_rating < 4).length,
      detractors: customerProfiles.filter(c => c.average_rating <= 2).length,
      customersWithRatings: customerProfiles.filter(c => c.average_rating > 0).length
    }

    // === STEP 4: Test Issues Detection ===
    const issueKeywords = {
      'pricing': ['expensive', 'costly', 'price', 'pricing', 'cost', 'money', 'cheap', 'overpriced'],
      'service': ['service', 'staff', 'employee', 'rude', 'helpful', 'friendly', 'slow service'],
      'quality': ['quality', 'poor', 'bad', 'excellent', 'good', 'terrible', 'amazing']
    }

    const issuesDetected: any = {}
    let feedbackWithText = 0

    extractionTests.forEach(test => {
      if (test.hasFeedback && test.extractedFeedback) {
        feedbackWithText++
        const feedbackLower = test.extractedFeedback.toLowerCase()
        
        Object.entries(issueKeywords).forEach(([category, keywords]) => {
          const hasKeyword = keywords.some(keyword => feedbackLower.includes(keyword.toLowerCase()))
          if (hasKeyword) {
            if (!issuesDetected[category]) {
              issuesDetected[category] = { count: 0, examples: [] }
            }
            issuesDetected[category].count++
            issuesDetected[category].examples.push({
              submissionId: test.submissionId,
              feedback: test.extractedFeedback.substring(0, 100) + '...',
              rating: test.extractedRating
            })
          }
        })
      }
    })

    // === STEP 5: Create Sample Data if None Exists ===
    const sampleDataSuggestions = []
    
    if (rawFeedbackSubmissions.length === 0) {
      sampleDataSuggestions.push({
        issue: "No feedback submissions found",
        solution: "Create sample feedback submissions",
        sampleData: {
          business_id: businessId,
          form_id: 1,
          submission_data: {
            rating: 3,
            feedback: "The service was okay but could be improved. The staff was helpful but the wait time was too long.",
            email: "customer@example.com",
            name: "Sample Customer"
          }
        }
      })
    }

    if (audienceStats.passives === 0 && audienceStats.totalCustomers > 0) {
      sampleDataSuggestions.push({
        issue: "No passive customers (rating 3-4)",
        solution: "Add feedback with ratings in 3-4 range",
        sampleData: {
          submission_data: {
            rating: 3,
            feedback: "Average experience, nothing special but not bad either"
          }
        }
      })
    }

    if (Object.keys(issuesDetected).length === 0 && feedbackWithText > 0) {
      sampleDataSuggestions.push({
        issue: "No issues detected in feedback text",
        solution: "Add feedback with issue keywords",
        sampleData: {
          submission_data: {
            rating: 2,
            feedback: "The service was poor and the staff was rude. The prices are too expensive for the quality."
          }
        }
      })
    }

    return NextResponse.json({
      businessId,
      validation: {
        // Raw Data Check
        rawDataCheck: {
          submissionsFound: rawFeedbackSubmissions.length,
          dbError: dbError,
          hasSubmissionData: rawFeedbackSubmissions.length > 0
        },

        // Data Extraction Check
        extractionCheck: {
          totalSubmissions: extractionTests.length,
          submissionsWithRating: extractionTests.filter(t => t.hasRating).length,
          submissionsWithFeedback: extractionTests.filter(t => t.hasFeedback).length,
          ratingDistribution: {
            promoters: extractionTests.filter(t => t.ratingRange === 'promoter').length,
            passives: extractionTests.filter(t => t.ratingRange === 'passive').length,
            detractors: extractionTests.filter(t => t.ratingRange === 'detractor').length,
            noRating: extractionTests.filter(t => t.ratingRange === 'no_rating').length
          },
          sampleExtractions: extractionTests.slice(0, 3)
        },

        // Audience Stats Check
        audienceCheck: {
          ...audienceStats,
          passivesIssue: audienceStats.passives === 0 ? "No passive customers found" : null
        },

        // Issues Detection Check
        issuesCheck: {
          feedbackWithText: feedbackWithText,
          issuesDetected: Object.keys(issuesDetected).length,
          issueBreakdown: issuesDetected,
          noIssuesReason: Object.keys(issuesDetected).length === 0 ? 
            (feedbackWithText === 0 ? "No feedback text found" : "No issue keywords matched") : null
        },

        // Sample Data Suggestions
        sampleDataSuggestions: sampleDataSuggestions
      },

      // Quick Fixes
      quickFixes: {
        audiencePassives: audienceStats.passives === 0 ? 
          "Add feedback submissions with ratings between 3-4" : "Working correctly",
        topIssues: Object.keys(issuesDetected).length === 0 ? 
          "Add feedback submissions with issue-related keywords" : "Working correctly"
      },

      success: true
    })

  } catch (error: any) {
    console.error('❌ Data validation error:', error)
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
