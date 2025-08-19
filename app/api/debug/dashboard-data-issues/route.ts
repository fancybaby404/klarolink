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
    console.log(`🔍 DEBUG: Investigating dashboard data issues for business ID: ${businessId}`)

    // === ISSUE 1: AUDIENCE PASSIVES COUNT ===
    console.log('\n=== INVESTIGATING AUDIENCE PASSIVES ISSUE ===')
    
    // Get raw feedback submissions
    const feedbackSubmissions = await db.getFeedbackSubmissions(businessId, 100)
    console.log(`📊 Found ${feedbackSubmissions.length} feedback submissions`)

    // Analyze submission data structure
    const submissionAnalysis = feedbackSubmissions.map((submission, index) => {
      const extractedData = extractDataWithFallback(submission.submission_data || {})
      return {
        submissionIndex: index + 1,
        id: submission.id,
        business_id: submission.business_id,
        submitted_at: submission.submitted_at,
        rawSubmissionData: submission.submission_data,
        extractedRating: extractedData.rating,
        extractedEmail: extractedData.email,
        extractedName: extractedData.name,
        extractedFeedback: extractedData.feedbackText?.substring(0, 100)
      }
    })

    // Get customer profiles (this is what audience page uses)
    const customerProfiles = await db.getCustomerProfiles(businessId)
    console.log(`👥 Generated ${customerProfiles.length} customer profiles`)

    // Analyze customer profile ratings
    const ratingAnalysis = {
      promoters: customerProfiles.filter(c => c.average_rating >= 4),
      passives: customerProfiles.filter(c => c.average_rating >= 3 && c.average_rating < 4),
      detractors: customerProfiles.filter(c => c.average_rating <= 2),
      allRatings: customerProfiles.map(c => c.average_rating)
    }

    console.log(`📊 Rating breakdown:`, {
      promoters: ratingAnalysis.promoters.length,
      passives: ratingAnalysis.passives.length,
      detractors: ratingAnalysis.detractors.length,
      allRatings: ratingAnalysis.allRatings
    })

    // === ISSUE 2: TOP REPORTED ISSUES ===
    console.log('\n=== INVESTIGATING TOP REPORTED ISSUES ===')

    // Test the issues analysis logic
    const issueKeywords = {
      'pricing': ['expensive', 'costly', 'price', 'pricing', 'cost', 'money', 'cheap', 'overpriced'],
      'service': ['service', 'staff', 'employee', 'rude', 'helpful', 'friendly', 'slow service'],
      'quality': ['quality', 'poor', 'bad', 'excellent', 'good', 'terrible', 'amazing'],
      'delivery': ['delivery', 'shipping', 'late', 'delayed', 'fast', 'slow', 'on time'],
      'wait_time': ['wait', 'waiting', 'queue', 'long wait', 'quick', 'fast', 'slow'],
      'selection': ['selection', 'variety', 'options', 'limited', 'choice', 'availability'],
      'location': ['location', 'parking', 'access', 'convenient', 'far', 'close'],
      'cleanliness': ['clean', 'dirty', 'hygiene', 'sanitary', 'mess', 'tidy']
    }

    const issueAnalysis: any = {}
    let totalNegativeSubmissions = 0

    // Initialize issue categories
    Object.keys(issueKeywords).forEach(category => {
      issueAnalysis[category] = {
        issue: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: 0,
        severity: 'low' as const,
        trend: 'stable' as const,
        recentSubmissions: []
      }
    })

    // Analyze each submission for issues
    const feedbackAnalysis = feedbackSubmissions.map(submission => {
      const extractedData = extractDataWithFallback(submission.submission_data || {})
      const rating = extractedData.rating || 0
      const feedbackText = extractedData.feedbackText || ''
      const isNegative = rating <= 3

      if (isNegative) totalNegativeSubmissions++

      const foundIssues: string[] = []

      // Check for issue keywords in feedback
      if (feedbackText && isNegative) {
        Object.entries(issueKeywords).forEach(([category, keywords]) => {
          const hasKeyword = keywords.some(keyword => 
            feedbackText.toLowerCase().includes(keyword.toLowerCase())
          )
          if (hasKeyword) {
            issueAnalysis[category].count++
            foundIssues.push(category)
            issueAnalysis[category].recentSubmissions.push({
              id: submission.id,
              submitter: extractedData.email || extractedData.name || 'Anonymous',
              feedback: feedbackText.substring(0, 200),
              rating: rating,
              submitted_at: submission.submitted_at
            })
          }
        })
      }

      return {
        id: submission.id,
        rating: rating,
        feedbackText: feedbackText,
        isNegative: isNegative,
        foundIssues: foundIssues,
        extractedData: extractedData
      }
    })

    // Get top issues
    const topIssues = Object.values(issueAnalysis)
      .filter((issue: any) => issue.count > 0)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    // === DATABASE SCHEMA CHECK ===
    console.log('\n=== CHECKING DATABASE SCHEMA ===')
    
    let schemaInfo: any = {}
    try {
      // Check if feedback_submissions table exists and its structure
      const tableCheck = await db.query!(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'feedback_submissions'
        )`
      )
      
      if (tableCheck[0].exists) {
        const columns = await db.query!(
          `SELECT column_name, data_type, is_nullable 
           FROM information_schema.columns 
           WHERE table_name = 'feedback_submissions' 
           ORDER BY ordinal_position`
        )
        schemaInfo.feedback_submissions = { exists: true, columns }
      } else {
        schemaInfo.feedback_submissions = { exists: false }
      }
    } catch (error: any) {
      schemaInfo.error = error.message
    }

    return NextResponse.json({
      businessId,
      investigation: {
        // Issue 1: Audience Passives
        audienceIssue: {
          feedbackSubmissionsCount: feedbackSubmissions.length,
          customerProfilesCount: customerProfiles.length,
          submissionAnalysis: submissionAnalysis.slice(0, 5), // First 5 for brevity
          ratingBreakdown: {
            promoters: ratingAnalysis.promoters.length,
            passives: ratingAnalysis.passives.length,
            detractors: ratingAnalysis.detractors.length,
            allRatings: ratingAnalysis.allRatings
          },
          passiveCustomers: ratingAnalysis.passives.map(c => ({
            email: c.email,
            name: c.name,
            average_rating: c.average_rating,
            total_submissions: c.total_submissions
          }))
        },
        
        // Issue 2: Top Reported Issues
        issuesAnalysis: {
          totalSubmissions: feedbackSubmissions.length,
          negativeSubmissions: totalNegativeSubmissions,
          topIssues: topIssues,
          feedbackAnalysis: feedbackAnalysis.slice(0, 5), // First 5 for brevity
          issueKeywordsUsed: Object.keys(issueKeywords)
        },

        // Database Schema
        databaseSchema: schemaInfo
      },
      
      // Recommendations
      recommendations: {
        audiencePassives: 
          ratingAnalysis.passives.length === 0 
            ? "No passives found. Check if ratings are being extracted correctly from submission_data."
            : `Found ${ratingAnalysis.passives.length} passive customers.`,
        
        topIssues: 
          topIssues.length === 0 
            ? "No issues found. Check if feedback text is being extracted correctly and contains relevant keywords."
            : `Found ${topIssues.length} top issues.`,
            
        nextSteps: [
          "Check if feedback submissions contain proper rating and text data",
          "Verify data extraction logic in field-categorization.ts",
          "Ensure database queries are returning expected data",
          "Test with sample data to verify issue detection logic"
        ]
      },
      
      success: true
    })

  } catch (error: any) {
    console.error('❌ Dashboard data investigation error:', error)
    return NextResponse.json(
      { 
        error: 'Investigation failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
