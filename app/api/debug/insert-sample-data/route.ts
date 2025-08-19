import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database-adapter'

export async function POST(request: NextRequest) {
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
    console.log(`🔧 SAMPLE DATA: Inserting test data for business ID: ${businessId}`)

    // Sample feedback submissions to test both audience passives and top issues
    const sampleSubmissions = [
      // Passive customers (rating 3-4)
      {
        business_id: businessId,
        form_id: 1,
        submission_data: {
          rating: 3,
          feedback: "The service was okay, nothing special. Staff was helpful but the wait time was too long. Could be improved.",
          email: "passive1@example.com",
          name: "John Passive"
        }
      },
      {
        business_id: businessId,
        form_id: 1,
        submission_data: {
          rating: 3,
          feedback: "Average experience overall. The quality is decent but the prices are a bit expensive for what you get.",
          email: "passive2@example.com",
          name: "Jane Average"
        }
      },
      {
        business_id: businessId,
        form_id: 1,
        submission_data: {
          rating: 4,
          feedback: "Good service but there's room for improvement. The location is convenient but parking is limited.",
          email: "passive3@example.com",
          name: "Mike Neutral"
        }
      },
      
      // Detractors with specific issues (rating 1-2)
      {
        business_id: businessId,
        form_id: 1,
        submission_data: {
          rating: 2,
          feedback: "Poor service quality. The staff was rude and unhelpful. The prices are way too expensive for such bad service.",
          email: "detractor1@example.com",
          name: "Sarah Unhappy"
        }
      },
      {
        business_id: businessId,
        form_id: 1,
        submission_data: {
          rating: 1,
          feedback: "Terrible experience! The delivery was late, the quality was poor, and the customer service was awful.",
          email: "detractor2@example.com",
          name: "Bob Angry"
        }
      },
      {
        business_id: businessId,
        form_id: 1,
        submission_data: {
          rating: 2,
          feedback: "The wait time was extremely long and the staff seemed overwhelmed. The selection was very limited too.",
          email: "detractor3@example.com",
          name: "Lisa Frustrated"
        }
      },
      
      // Promoters (rating 5)
      {
        business_id: businessId,
        form_id: 1,
        submission_data: {
          rating: 5,
          feedback: "Excellent service! The staff was friendly and helpful. Great quality and reasonable prices. Highly recommend!",
          email: "promoter1@example.com",
          name: "David Happy"
        }
      },
      {
        business_id: businessId,
        form_id: 1,
        submission_data: {
          rating: 5,
          feedback: "Amazing experience! Fast delivery, excellent quality, and outstanding customer service. Will definitely come back!",
          email: "promoter2@example.com",
          name: "Emma Satisfied"
        }
      }
    ]

    const insertedSubmissions = []
    let insertErrors = []

    // Insert each sample submission
    for (const submission of sampleSubmissions) {
      try {
        const result = await db.createFeedbackSubmission(submission)
        insertedSubmissions.push(result)
        console.log(`✅ Inserted submission: ${submission.submission_data.email} (rating: ${submission.submission_data.rating})`)
      } catch (error: any) {
        console.error(`❌ Failed to insert submission for ${submission.submission_data.email}:`, error)
        insertErrors.push({
          email: submission.submission_data.email,
          error: error.message
        })
      }
    }

    // Test the data extraction after insertion
    console.log('🧪 Testing data extraction after insertion...')
    
    // Get customer profiles to test audience calculation
    const customerProfiles = await db.getCustomerProfiles(businessId)
    const audienceStats = {
      totalCustomers: customerProfiles.length,
      promoters: customerProfiles.filter(c => c.average_rating >= 4).length,
      passives: customerProfiles.filter(c => c.average_rating >= 3 && c.average_rating < 4).length,
      detractors: customerProfiles.filter(c => c.average_rating <= 2).length
    }

    // Get feedback submissions to test issues detection
    const feedbackSubmissions = await db.getFeedbackSubmissions(businessId, 20)
    
    return NextResponse.json({
      businessId,
      sampleDataInserted: {
        totalSubmissions: sampleSubmissions.length,
        successfulInserts: insertedSubmissions.length,
        failedInserts: insertErrors.length,
        insertErrors: insertErrors,
        insertedSubmissions: insertedSubmissions.map(s => ({
          id: s.id,
          rating: s.submission_data?.rating,
          email: s.submission_data?.email,
          feedbackPreview: s.submission_data?.feedback?.substring(0, 50) + '...'
        }))
      },
      
      postInsertionTests: {
        audienceStats: audienceStats,
        feedbackSubmissionsCount: feedbackSubmissions.length,
        expectedResults: {
          passivesShouldBe: "3 (ratings 3, 3, 4)",
          promotersShouldBe: "2 (ratings 5, 5)",
          detractorsShouldBe: "3 (ratings 2, 1, 2)",
          issuesShouldInclude: ["service", "pricing", "quality", "delivery", "wait_time"]
        }
      },
      
      nextSteps: [
        "Check the Audience page - passives count should now show 3",
        "Check the Analytics page - top issues should now show service, pricing, quality issues",
        "If issues persist, check the data validation endpoint: /api/debug/data-validation"
      ],
      
      success: true
    })

  } catch (error: any) {
    console.error('❌ Sample data insertion error:', error)
    return NextResponse.json(
      { 
        error: 'Sample data insertion failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
