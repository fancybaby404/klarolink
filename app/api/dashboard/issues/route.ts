import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

interface IssueAnalysis {
  issue: string
  count: number
  severity: 'high' | 'medium' | 'low'
  trend: 'up' | 'down' | 'stable'
  recentSubmissions: Array<{
    id: number
    submitter: string
    feedback: string
    rating: number
    submitted_at: string
  }>
}

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

    // Get all feedback submissions for this business
    const submissions = await db.getFeedbackSubmissions(payload.businessId)
    
    if (submissions.length === 0) {
      return NextResponse.json({
        issues: [],
        totalSubmissions: 0,
        message: "No feedback submissions found"
      })
    }

    // Analyze feedback content for common issues
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

    const issueAnalysis: { [key: string]: IssueAnalysis } = {}

    // Initialize issue tracking
    Object.keys(issueKeywords).forEach(issue => {
      issueAnalysis[issue] = {
        issue: issue.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: 0,
        severity: 'low',
        trend: 'stable',
        recentSubmissions: []
      }
    })

    // Analyze each submission
    submissions.forEach(submission => {
      const feedbackText = (submission.submission_data.feedback || '').toLowerCase()
      const rating = submission.submission_data.rating || 5
      const submitter = submission.submission_data.name || submission.submission_data.email || 'Anonymous'

      // Check for negative sentiment (rating <= 3 or negative keywords)
      const isNegative = rating <= 3 || 
        ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointed', 'frustrated'].some(word => 
          feedbackText.includes(word)
        )

      if (isNegative || rating <= 3) {
        Object.entries(issueKeywords).forEach(([issueKey, keywords]) => {
          const hasKeyword = keywords.some(keyword => feedbackText.includes(keyword.toLowerCase()))
          
          if (hasKeyword) {
            issueAnalysis[issueKey].count++
            
            // Add to recent submissions if we have less than 3
            if (issueAnalysis[issueKey].recentSubmissions.length < 3) {
              issueAnalysis[issueKey].recentSubmissions.push({
                id: submission.id,
                submitter,
                feedback: submission.submission_data.feedback || 'No feedback text',
                rating: rating,
                submitted_at: submission.submitted_at
              })
            }
          }
        })
      }
    })

    // Calculate severity and trends
    const totalNegativeSubmissions = submissions.filter(s => (s.submission_data.rating || 5) <= 3).length
    
    Object.values(issueAnalysis).forEach(issue => {
      // Calculate severity based on frequency
      const percentage = totalNegativeSubmissions > 0 ? (issue.count / totalNegativeSubmissions) * 100 : 0
      
      if (percentage >= 30) {
        issue.severity = 'high'
      } else if (percentage >= 15) {
        issue.severity = 'medium'
      } else {
        issue.severity = 'low'
      }

      // Simple trend calculation (could be enhanced with time-based analysis)
      const recentCount = issue.recentSubmissions.length
      if (recentCount >= 2) {
        issue.trend = 'up'
      } else if (recentCount === 1) {
        issue.trend = 'stable'
      } else {
        issue.trend = 'down'
      }
    })

    // Filter and sort issues by count
    const topIssues = Object.values(issueAnalysis)
      .filter(issue => issue.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 issues

    return NextResponse.json({
      issues: topIssues,
      totalSubmissions: submissions.length,
      negativeSubmissions: totalNegativeSubmissions,
      analysisDate: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
