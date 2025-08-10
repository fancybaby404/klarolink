// Database abstraction layer for v0 compatibility
import type { Business, FeedbackForm, SocialLink, FeedbackSubmission, AnalyticsEvent, FormField, CustomerProfile, CustomerSegment, User, UserBusinessAccess } from "./types"
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Mock data for preview environment
const mockBusinesses: Business[] = [
  {
    id: 1,
    name: "Demo Business",
    email: "demo@klarolink.com",
    password_hash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PqhEIu",
    profile_image: "/placeholder.svg?height=100&width=100",
    slug: "demo-business",
    location: "San Francisco, CA",
    background_type: "color",
    background_value: "#6366f1",
    submit_button_color: "#CC79F0",
    submit_button_text_color: "#FDFFFA",
    submit_button_hover_color: "#3E7EF7",
    preview_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Acme Restaurant",
    email: "contact@acme-restaurant.com",
    password_hash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PqhEIu",
    profile_image: "/placeholder.svg?height=100&width=100",
    slug: "acme-restaurant",
    location: "New York, NY",
    background_type: "color",
    background_value: "#dc2626",
    submit_button_color: "#CC79F0",
    submit_button_text_color: "#FDFFFA",
    submit_button_hover_color: "#3E7EF7",
    preview_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "SkinBloom",
    email: "skinbloom@gmail.com",
    password_hash: "$2b$12$xwA7rylJIw4ytjLLlCzbQeRWYcbr9LyMth.ZWtfzrQ6GnLM52fCzy", // password123
    profile_image: "/placeholder.svg?height=100&width=100",
    slug: "skinbloom",
    location: "New York, NY",
    background_type: "color",
    background_value: "#CC79F0",
    submit_button_color: "#CC79F0",
    submit_button_text_color: "#FDFFFA",
    submit_button_hover_color: "#3E7EF7",
    preview_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@klarolink.com",
    password_hash: "$2b$12$xwA7rylJIw4ytjLLlCzbQeRWYcbr9LyMth.ZWtfzrQ6GnLM52fCzy", // password123
    first_name: "Admin",
    last_name: "User",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    email: "demo@klarolink.com",
    password_hash: "$2b$12$xwA7rylJIw4ytjLLlCzbQeRWYcbr9LyMth.ZWtfzrQ6GnLM52fCzy", // password123
    first_name: "Demo",
    last_name: "User",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    email: "john@example.com",
    password_hash: "$2b$12$xwA7rylJIw4ytjLLlCzbQeRWYcbr9LyMth.ZWtfzrQ6GnLM52fCzy", // password123
    first_name: "John",
    last_name: "Smith",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    email: "sarah@example.com",
    password_hash: "$2b$12$xwA7rylJIw4ytjLLlCzbQeRWYcbr9LyMth.ZWtfzrQ6GnLM52fCzy", // password123
    first_name: "Sarah",
    last_name: "Johnson",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    email: "harinacookies@gmail.com",
    password_hash: "$2b$12$gvOzA1B4Pm4AfBjLLJzWC.Qu6cU7mCBIJiHJ5CJNPZ2b05q/OmBmK", // Original hash provided
    first_name: "Harina",
    last_name: "Cookies",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockUserBusinessAccess: UserBusinessAccess[] = [
  {
    id: 1,
    user_id: 1,
    business_id: 1,
    role: "admin",
    granted_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 2,
    business_id: 2,
    role: "admin",
    granted_at: new Date().toISOString(),
  },
  {
    id: 3,
    user_id: 3,
    business_id: 1,
    role: "admin",
    granted_at: new Date().toISOString(),
  },
  {
    id: 4,
    user_id: 4,
    business_id: 1,
    role: "admin",
    granted_at: new Date().toISOString(),
  },
  {
    id: 5,
    user_id: 5,
    business_id: 1,
    role: "admin",
    granted_at: new Date().toISOString(),
  },
]

const mockFeedbackForms: FeedbackForm[] = [
  {
    id: 1,
    business_id: 1,
    title: "Customer Feedback",
    description: "We value your feedback! Please share your experience with us.",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Your Name",
        required: true,
        placeholder: "Enter your name",
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        required: false,
        placeholder: "your@email.com",
      },
      {
        id: "rating",
        type: "rating",
        label: "Overall Rating",
        required: true,
      },
      {
        id: "feedback",
        type: "textarea",
        label: "Your Feedback",
        required: true,
        placeholder: "Tell us about your experience...",
      },
    ],
    is_active: true,
    preview_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockSocialLinks: SocialLink[] = [
  {
    id: 1,
    business_id: 1,
    platform: "website",
    url: "https://demo-business.com",
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    business_id: 1,
    platform: "instagram",
    url: "https://instagram.com/demobusiness",
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    business_id: 1,
    platform: "twitter",
    url: "https://twitter.com/demobusiness",
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

const mockFeedbackSubmissions: FeedbackSubmission[] = [
  {
    id: 1,
    business_id: 1,
    form_id: 1,
    submission_data: {
      name: "John Smith",
      email: "john@example.com",
      rating: 5,
      feedback: "Excellent service! Very satisfied with the experience.",
    },
    submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
  },
  {
    id: 2,
    business_id: 1,
    form_id: 1,
    submission_data: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      rating: 4,
      feedback: "Good overall experience, but there is room for improvement in delivery time.",
    },
    submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ip_address: "192.168.1.2",
    user_agent: "Mozilla/5.0",
  },
  {
    id: 3,
    business_id: 1,
    form_id: 1,
    submission_data: {
      name: "Mike Wilson",
      rating: 3,
      feedback: "Average experience. The product was okay but customer service could be better.",
    },
    submitted_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    ip_address: "192.168.1.3",
    user_agent: "Mozilla/5.0",
  },
]

const mockAnalyticsEvents: AnalyticsEvent[] = [
  {
    id: 1,
    business_id: 1,
    event_type: "page_view",
    event_data: { page: "feedback_form" },
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
  },
  {
    id: 2,
    business_id: 1,
    event_type: "form_submit",
    event_data: { form_id: 1, completion_time: 120 },
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    ip_address: "192.168.1.2",
    user_agent: "Mozilla/5.0",
  },
]

const mockCustomerProfiles: CustomerProfile[] = [
  {
    id: 1,
    business_id: 1,
    email: "john.doe@example.com",
    name: "John Doe",
    total_submissions: 3,
    average_rating: 4.7,
    engagement_score: 85,
    first_submission_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_submission_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    segments: ["promoters", "frequent_customers"],
    custom_fields: { company: "Tech Corp", industry: "Technology" },
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    business_id: 1,
    email: "sarah.smith@example.com",
    name: "Sarah Smith",
    total_submissions: 1,
    average_rating: 2.0,
    engagement_score: 25,
    first_submission_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_submission_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    segments: ["detractors", "at_risk"],
    custom_fields: { company: "Small Business Inc", industry: "Retail" },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    business_id: 1,
    email: "mike.johnson@example.com",
    name: "Mike Johnson",
    total_submissions: 2,
    average_rating: 3.5,
    engagement_score: 60,
    first_submission_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_submission_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    segments: ["passives", "returning_customers"],
    custom_fields: { company: "Mid Corp", industry: "Manufacturing" },
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const mockCustomerSegments: CustomerSegment[] = [
  {
    id: 1,
    business_id: 1,
    name: "Promoters",
    description: "Customers with ratings 4-5 stars",
    rules: { rating_min: 4, rating_max: 5 },
    customer_count: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    business_id: 1,
    name: "Detractors",
    description: "Customers with ratings 1-2 stars",
    rules: { rating_min: 1, rating_max: 2 },
    customer_count: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    business_id: 1,
    name: "Passives",
    description: "Customers with rating 3 stars",
    rules: { rating_min: 3, rating_max: 3 },
    customer_count: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    business_id: 1,
    name: "At Risk",
    description: "Customers with declining satisfaction",
    rules: { engagement_score_max: 30 },
    customer_count: 1,
    created_at: new Date().toISOString(),
  },
]

// Database adapter interface
export interface DatabaseAdapter {
  // Business operations
  getBusiness(id: number): Promise<Business | null>
  getBusinessByEmail(email: string): Promise<Business | null>
  getBusinessBySlug(slug: string): Promise<Business | null>
  createBusiness(data: Omit<Business, "id" | "created_at" | "updated_at">): Promise<Business>
  updateBusiness(id: number, data: Partial<Business>): Promise<Business | null>

  // Feedback form operations
  getFeedbackForm(businessId: number): Promise<FeedbackForm | null>
  updateFeedbackForm(businessId: number, fields: FormField[], title?: string, description?: string, previewEnabled?: boolean): Promise<void>

  // Social links operations
  getSocialLinks(businessId: number): Promise<SocialLink[]>
  updateSocialLinks(businessId: number, links: Omit<SocialLink, "id" | "business_id" | "created_at">[]): Promise<void>

  // Feedback submissions
  createFeedbackSubmission(data: Omit<FeedbackSubmission, "id" | "submitted_at">): Promise<FeedbackSubmission>
  getFeedbackSubmissions(businessId: number, limit?: number): Promise<FeedbackSubmission[]>

  // Analytics
  createAnalyticsEvent(data: Omit<AnalyticsEvent, "id" | "created_at">): Promise<void>
  getAnalyticsStats(businessId: number): Promise<{
    totalFeedback: number
    completionRate: number
    averageRating: number
    pageViews: number
  }>
  getDetailedInsights(businessId: number): Promise<{
    submissionTrends: Array<{ date: string; count: number }>
    fieldAnalytics: Array<{ fieldId: string; fieldLabel: string; fieldType: string; responses: any[] }>
    ratingDistribution: Array<{ rating: number; count: number }>
    recentSubmissions: FeedbackSubmission[]
  }>

  // Enhanced Analytics
  getEnhancedInsights(businessId: number, timeRange: string, compareWith: string): Promise<{
    submissionTrends: Array<{ date: string; count: number; previousCount?: number }>
    ratingTrends: Array<{ date: string; averageRating: number; previousRating?: number }>
    responseTimeAnalysis: { averageResponseTime: number; trend: string }
    satisfactionScore: { current: number; previous: number; change: number }
    completionRate: { current: number; previous: number; change: number }
    topPerformingFields: Array<{ fieldId: string; fieldLabel: string; satisfactionScore: number }>
    underperformingFields: Array<{ fieldId: string; fieldLabel: string; issueCount: number }>
    peakSubmissionTimes: Array<{ hour: number; dayOfWeek: number; count: number }>
    geographicDistribution: Array<{ location: string; count: number; averageRating: number }>
  }>

  getCustomerJourneyAnalytics(businessId: number, timeRange: string): Promise<{
    touchpoints: Array<{ stage: string; count: number; conversionRate: number }>
    dropoffPoints: Array<{ fieldId: string; dropoffRate: number }>
    averageJourneyTime: number
    returnCustomerRate: number
    firstTimeVsReturning: { firstTime: number; returning: number }
    customerLifetimeValue: { average: number; segments: Array<{ segment: string; value: number }> }
  }>

  getPerformanceBenchmarks(businessId: number, timeRange: string): Promise<{
    industryBenchmarks: { averageRating: number; responseRate: number; satisfactionScore: number }
    competitorAnalysis: { position: string; strengths: string[]; weaknesses: string[] }
    goalProgress: Array<{ metric: string; current: number; target: number; progress: number }>
    recommendations: Array<{ priority: string; action: string; expectedImpact: string }>
  }>

  // Customer profiles and audience management
  getCustomerProfiles(businessId: number): Promise<CustomerProfile[]>
  getCustomerProfile(businessId: number, email: string): Promise<CustomerProfile | null>
  createOrUpdateCustomerProfile(businessId: number, email: string, data: Partial<CustomerProfile>): Promise<CustomerProfile>
  getCustomerSegments(businessId: number): Promise<CustomerSegment[]>

  // Referral and Gamification System
  createReferral(referrerUserId: number, businessId: number, referredEmail: string): Promise<{ referralCode: string; id: number }>
  getReferralByCode(referralCode: string): Promise<any>
  completeReferral(referralCode: string, referredUserId: number): Promise<void>
  getUserPoints(userId: number, businessId: number): Promise<{ balance: number; totalEarned: number }>
  getUserBadges(userId: number, businessId: number): Promise<any[]>
  getGamificationSettings(businessId: number): Promise<any>
  updateGamificationSettings(businessId: number, settings: any): Promise<void>
  getUserReferrals(userId: number, businessId: number): Promise<any[]>
  trackSocialShare(userId: number | null, businessId: number, platform: string, url: string, referralCode?: string): Promise<void>
  getLeaderboard(businessId: number, type: 'points' | 'referrals', limit?: number): Promise<any[]>

  // User authentication operations
  getUser(id: number): Promise<User | null>
  getUserByEmail(email: string): Promise<User | null>
  getUserBusinessAccess(userId: number): Promise<Business[]>
  validateUserBusinessAccess(userId: number, businessId: number): Promise<boolean>
}

// Mock database adapter for v0 preview environment
class MockDatabaseAdapter implements DatabaseAdapter {
  private businesses = [...mockBusinesses]
  private feedbackForms = [...mockFeedbackForms]
  private socialLinks = [...mockSocialLinks]
  private feedbackSubmissions = [...mockFeedbackSubmissions]
  private analyticsEvents = [...mockAnalyticsEvents]
  private users = [...mockUsers]
  private userBusinessAccess = [...mockUserBusinessAccess]

  async getBusiness(id: number): Promise<Business | null> {
    return this.businesses.find((b) => b.id === id) || null
  }

  async getBusinessByEmail(email: string): Promise<Business | null> {
    return this.businesses.find((b) => b.email === email) || null
  }

  async getBusinessBySlug(slug: string): Promise<Business | null> {
    return this.businesses.find((b) => b.slug === slug) || null
  }

  async createBusiness(data: Omit<Business, "id" | "created_at" | "updated_at">): Promise<Business> {
    const newBusiness: Business = {
      ...data,
      id: Math.max(...this.businesses.map((b) => b.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.businesses.push(newBusiness)
    return newBusiness
  }

  async updateBusiness(id: number, data: Partial<Business>): Promise<Business | null> {
    const index = this.businesses.findIndex((b) => b.id === id)
    if (index === -1) return null

    this.businesses[index] = {
      ...this.businesses[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return this.businesses[index]
  }

  async getFeedbackForm(businessId: number): Promise<FeedbackForm | null> {
    return this.feedbackForms.find((f) => f.business_id === businessId && f.is_active) || null
  }

  async updateFeedbackForm(businessId: number, fields: FormField[], title?: string, description?: string, previewEnabled?: boolean): Promise<void> {
    const index = this.feedbackForms.findIndex((f) => f.business_id === businessId)
    if (index !== -1) {
      this.feedbackForms[index] = {
        ...this.feedbackForms[index],
        fields,
        title: title || this.feedbackForms[index].title,
        description: description || this.feedbackForms[index].description,
        preview_enabled: previewEnabled !== undefined ? previewEnabled : this.feedbackForms[index].preview_enabled,
        updated_at: new Date().toISOString(),
      }
    } else {
      this.feedbackForms.push({
        id: Math.max(...this.feedbackForms.map((f) => f.id)) + 1,
        business_id: businessId,
        title: title || "Customer Feedback",
        description: description || "We value your feedback!",
        fields,
        is_active: true,
        preview_enabled: previewEnabled !== undefined ? previewEnabled : false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  async getSocialLinks(businessId: number): Promise<SocialLink[]> {
    return this.socialLinks
      .filter((l) => l.business_id === businessId && l.is_active)
      .sort((a, b) => a.display_order - b.display_order)
  }

  async updateSocialLinks(
    businessId: number,
    links: Omit<SocialLink, "id" | "business_id" | "created_at">[],
  ): Promise<void> {
    // Remove existing links for this business
    this.socialLinks = this.socialLinks.filter((l) => l.business_id !== businessId)

    // Add new links
    links.forEach((link, index) => {
      this.socialLinks.push({
        id: Math.max(...this.socialLinks.map((l) => l.id), 0) + index + 1,
        business_id: businessId,
        ...link,
        display_order: index,
        created_at: new Date().toISOString(),
      })
    })
  }

  async createFeedbackSubmission(data: Omit<FeedbackSubmission, "id" | "submitted_at">): Promise<FeedbackSubmission> {
    const newSubmission: FeedbackSubmission = {
      ...data,
      id: Math.max(...this.feedbackSubmissions.map((s) => s.id)) + 1,
      submitted_at: new Date().toISOString(),
    }
    this.feedbackSubmissions.push(newSubmission)
    // Invalidate AI insights cache file for this business so fresh analysis runs next time
    try {
      const { promises: fs } = await import('fs')
      const path = (await import('path')).default
      const file = path.join(process.cwd(), '.cache', 'ai-insights', `business_${data.business_id}.json`)
      await fs.unlink(file).catch(() => {})
    } catch {}
    return newSubmission
  }

  async getFeedbackSubmissions(businessId: number, limit = 5): Promise<FeedbackSubmission[]> {
    return this.feedbackSubmissions
      .filter((s) => s.business_id === businessId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      .slice(0, limit)
  }

  async createAnalyticsEvent(data: Omit<AnalyticsEvent, "id" | "created_at">): Promise<void> {
    this.analyticsEvents.push({
      ...data,
      id: Math.max(...this.analyticsEvents.map((e) => e.id)) + 1,
      created_at: new Date().toISOString(),
    })
  }

  async getAnalyticsStats(businessId: number): Promise<{
    totalFeedback: number
    completionRate: number
    averageRating: number
    pageViews: number
  }> {
    const feedback = this.feedbackSubmissions.filter((s) => s.business_id === businessId)
    const events = this.analyticsEvents.filter((e) => e.business_id === businessId)

    const totalFeedback = feedback.length
    const pageViews = events.filter((e) => e.event_type === "page_view").length
    const formSubmits = events.filter((e) => e.event_type === "form_submit").length

    const ratings = feedback.map((s) => s.submission_data.rating).filter((r): r is number => typeof r === "number")

    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    const completionRate = pageViews > 0 ? (formSubmits / pageViews) * 100 : 0

    return {
      totalFeedback,
      completionRate: Math.round(completionRate),
      averageRating: Math.round(averageRating * 10) / 10,
      pageViews,
    }
  }

  async getDetailedInsights(businessId: number): Promise<{
    submissionTrends: Array<{ date: string; count: number }>
    fieldAnalytics: Array<{ fieldId: string; fieldLabel: string; fieldType: string; responses: any[] }>
    ratingDistribution: Array<{ rating: number; count: number }>
    recentSubmissions: FeedbackSubmission[]
  }> {
    const feedback = this.feedbackSubmissions.filter((s) => s.business_id === businessId)

    // Generate submission trends (last 7 days)
    const submissionTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = feedback.filter(f => f.submitted_at.startsWith(dateStr)).length
      submissionTrends.push({ date: dateStr, count })
    }

    // Analyze field responses
    const fieldAnalytics: Array<{ fieldId: string; fieldLabel: string; fieldType: string; responses: any[] }> = []
    if (feedback.length > 0) {
      const sampleSubmission = feedback[0].submission_data
      Object.keys(sampleSubmission).forEach(fieldId => {
        const responses = feedback.map(f => f.submission_data[fieldId]).filter(r => r !== undefined)
        fieldAnalytics.push({
          fieldId,
          fieldLabel: fieldId.charAt(0).toUpperCase() + fieldId.slice(1),
          fieldType: typeof responses[0] === 'number' ? 'rating' : 'text',
          responses
        })
      })
    }

    // Rating distribution
    const ratings = feedback.map(f => f.submission_data.rating).filter(r => typeof r === 'number')
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratings.filter(r => r === rating).length
    }))

    return {
      submissionTrends,
      fieldAnalytics,
      ratingDistribution,
      recentSubmissions: feedback.slice(0, 10)
    }
  }

  async getEnhancedInsights(businessId: number, timeRange: string, compareWith: string): Promise<{
    submissionTrends: Array<{ date: string; count: number; previousCount?: number }>
    ratingTrends: Array<{ date: string; averageRating: number; previousRating?: number }>
    responseTimeAnalysis: { averageResponseTime: number; trend: string }
    satisfactionScore: { current: number; previous: number; change: number }
    completionRate: { current: number; previous: number; change: number }
    topPerformingFields: Array<{ fieldId: string; fieldLabel: string; satisfactionScore: number }>
    underperformingFields: Array<{ fieldId: string; fieldLabel: string; issueCount: number }>
    peakSubmissionTimes: Array<{ hour: number; dayOfWeek: number; count: number }>
    geographicDistribution: Array<{ location: string; count: number; averageRating: number }>
  }> {
    const feedback = this.feedbackSubmissions.filter((s) => s.business_id === businessId)
    const days = timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : timeRange === "1y" ? 365 : 7

    // Generate enhanced submission trends with comparison
    const submissionTrends = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = feedback.filter(f => f.submitted_at.startsWith(dateStr)).length

      // Previous period comparison
      const prevDate = new Date(date)
      prevDate.setDate(prevDate.getDate() - days)
      const prevDateStr = prevDate.toISOString().split('T')[0]
      const previousCount = feedback.filter(f => f.submitted_at.startsWith(prevDateStr)).length

      submissionTrends.push({ date: dateStr, count, previousCount })
    }

    // Rating trends with comparison
    const ratingTrends = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayFeedback = feedback.filter(f => f.submitted_at.startsWith(dateStr))
      const ratings = dayFeedback.map(f => f.submission_data.rating).filter(r => typeof r === 'number')
      const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

      // Previous period comparison
      const prevDate = new Date(date)
      prevDate.setDate(prevDate.getDate() - days)
      const prevDateStr = prevDate.toISOString().split('T')[0]
      const prevDayFeedback = feedback.filter(f => f.submitted_at.startsWith(prevDateStr))
      const prevRatings = prevDayFeedback.map(f => f.submission_data.rating).filter(r => typeof r === 'number')
      const previousRating = prevRatings.length > 0 ? prevRatings.reduce((a, b) => a + b, 0) / prevRatings.length : 0

      ratingTrends.push({ date: dateStr, averageRating, previousRating })
    }

    // Calculate satisfaction scores
    const currentRatings = feedback.map(f => f.submission_data.rating).filter(r => typeof r === 'number')
    const currentSatisfaction = currentRatings.length > 0 ?
      (currentRatings.filter(r => r >= 4).length / currentRatings.length) * 100 : 0

    // Mock previous period data
    const previousSatisfaction = Math.max(0, currentSatisfaction + (Math.random() - 0.5) * 20)
    const satisfactionChange = currentSatisfaction - previousSatisfaction

    // Mock completion rate
    const currentCompletion = 85 + Math.random() * 10
    const previousCompletion = currentCompletion + (Math.random() - 0.5) * 10
    const completionChange = currentCompletion - previousCompletion

    // Peak submission times analysis
    const peakSubmissionTimes = []
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        const count = Math.floor(Math.random() * 10) + 1
        peakSubmissionTimes.push({ hour, dayOfWeek: day, count })
      }
    }

    return {
      submissionTrends,
      ratingTrends,
      responseTimeAnalysis: {
        averageResponseTime: 2.5 + Math.random() * 2, // minutes
        trend: Math.random() > 0.5 ? "improving" : "declining"
      },
      satisfactionScore: {
        current: Math.round(currentSatisfaction * 10) / 10,
        previous: Math.round(previousSatisfaction * 10) / 10,
        change: Math.round(satisfactionChange * 10) / 10
      },
      completionRate: {
        current: Math.round(currentCompletion * 10) / 10,
        previous: Math.round(previousCompletion * 10) / 10,
        change: Math.round(completionChange * 10) / 10
      },
      topPerformingFields: [
        { fieldId: "rating", fieldLabel: "Overall Rating", satisfactionScore: 4.2 },
        { fieldId: "service", fieldLabel: "Service Quality", satisfactionScore: 4.0 },
        { fieldId: "location", fieldLabel: "Location", satisfactionScore: 3.8 }
      ],
      underperformingFields: [
        { fieldId: "pricing", fieldLabel: "Pricing", issueCount: 12 },
        { fieldId: "wait_time", fieldLabel: "Wait Time", issueCount: 8 }
      ],
      peakSubmissionTimes: peakSubmissionTimes.sort((a, b) => b.count - a.count).slice(0, 10),
      geographicDistribution: [
        { location: "New York", count: 45, averageRating: 4.2 },
        { location: "Los Angeles", count: 32, averageRating: 3.9 },
        { location: "Chicago", count: 28, averageRating: 4.1 },
        { location: "Houston", count: 22, averageRating: 3.8 }
      ]
    }
  }

  async getCustomerJourneyAnalytics(businessId: number, timeRange: string): Promise<{
    touchpoints: Array<{ stage: string; count: number; conversionRate: number }>
    dropoffPoints: Array<{ fieldId: string; dropoffRate: number }>
    averageJourneyTime: number
    returnCustomerRate: number
    firstTimeVsReturning: { firstTime: number; returning: number }
    customerLifetimeValue: { average: number; segments: Array<{ segment: string; value: number }> }
  }> {
    return {
      touchpoints: [
        { stage: "Page View", count: 1250, conversionRate: 100 },
        { stage: "Form Started", count: 890, conversionRate: 71.2 },
        { stage: "Form Completed", count: 756, conversionRate: 84.9 },
        { stage: "Feedback Submitted", count: 723, conversionRate: 95.6 }
      ],
      dropoffPoints: [
        { fieldId: "email", dropoffRate: 15.2 },
        { fieldId: "phone", dropoffRate: 12.8 },
        { fieldId: "detailed_feedback", dropoffRate: 8.3 }
      ],
      averageJourneyTime: 3.2, // minutes
      returnCustomerRate: 23.5, // percentage
      firstTimeVsReturning: {
        firstTime: 76.5,
        returning: 23.5
      },
      customerLifetimeValue: {
        average: 245.50,
        segments: [
          { segment: "Promoters (9-10)", value: 385.20 },
          { segment: "Passives (7-8)", value: 220.15 },
          { segment: "Detractors (0-6)", value: 125.80 }
        ]
      }
    }
  }

  async getPerformanceBenchmarks(businessId: number, timeRange: string): Promise<{
    industryBenchmarks: { averageRating: number; responseRate: number; satisfactionScore: number }
    competitorAnalysis: { position: string; strengths: string[]; weaknesses: string[] }
    goalProgress: Array<{ metric: string; current: number; target: number; progress: number }>
    recommendations: Array<{ priority: string; action: string; expectedImpact: string }>
  }> {
    return {
      industryBenchmarks: {
        averageRating: 3.8,
        responseRate: 12.5,
        satisfactionScore: 72.3
      },
      competitorAnalysis: {
        position: "Above Average",
        strengths: ["Customer Service", "Product Quality", "Response Time"],
        weaknesses: ["Pricing Competitiveness", "Location Accessibility"]
      },
      goalProgress: [
        { metric: "Customer Satisfaction", current: 4.2, target: 4.5, progress: 93.3 },
        { metric: "Response Rate", current: 15.8, target: 20.0, progress: 79.0 },
        { metric: "NPS Score", current: 42, target: 50, progress: 84.0 }
      ],
      recommendations: [
        {
          priority: "High",
          action: "Implement pricing transparency initiative",
          expectedImpact: "15% reduction in pricing-related complaints"
        },
        {
          priority: "Medium",
          action: "Optimize peak hour staffing",
          expectedImpact: "20% improvement in wait time satisfaction"
        },
        {
          priority: "Low",
          action: "Enhance location signage and directions",
          expectedImpact: "8% improvement in accessibility ratings"
        }
      ]
    }
  }

  async getCustomerProfiles(businessId: number): Promise<CustomerProfile[]> {
    return mockCustomerProfiles.filter(profile => profile.business_id === businessId)
  }

  async getCustomerProfile(businessId: number, email: string): Promise<CustomerProfile | null> {
    return mockCustomerProfiles.find(profile =>
      profile.business_id === businessId && profile.email === email
    ) || null
  }

  async createOrUpdateCustomerProfile(businessId: number, email: string, data: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const existingIndex = mockCustomerProfiles.findIndex(profile =>
      profile.business_id === businessId && profile.email === email
    )

    if (existingIndex >= 0) {
      // Update existing profile
      mockCustomerProfiles[existingIndex] = {
        ...mockCustomerProfiles[existingIndex],
        ...data,
        email, // Ensure email doesn't change
        business_id: businessId // Ensure business_id doesn't change
      }
      return mockCustomerProfiles[existingIndex]
    } else {
      // Create new profile
      const newProfile: CustomerProfile = {
        id: Math.max(...mockCustomerProfiles.map(p => p.id), 0) + 1,
        business_id: businessId,
        email,
        name: data.name || '',
        total_submissions: data.total_submissions || 0,
        average_rating: data.average_rating || 0,
        engagement_score: data.engagement_score || 0,
        first_submission_at: data.first_submission_at,
        last_submission_at: data.last_submission_at,
        segments: data.segments || [],
        custom_fields: data.custom_fields || {},
        created_at: new Date().toISOString(),
        ...data
      }
      mockCustomerProfiles.push(newProfile)
      return newProfile
    }
  }

  async getCustomerSegments(businessId: number): Promise<CustomerSegment[]> {
    return mockCustomerSegments.filter(segment => segment.business_id === businessId)
  }

  // Referral and Gamification System Implementation
  async createReferral(referrerUserId: number, businessId: number, referredEmail: string): Promise<{ referralCode: string; id: number }> {
    const referralCode = 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase()
    const referral = {
      id: Math.max(...this.mockReferrals.map(r => r.id), 0) + 1,
      referrer_user_id: referrerUserId,
      business_id: businessId,
      referred_email: referredEmail,
      referral_code: referralCode,
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }
    this.mockReferrals.push(referral)
    return { referralCode, id: referral.id }
  }

  async getReferralByCode(referralCode: string): Promise<any> {
    return this.mockReferrals.find(r => r.referral_code === referralCode) || null
  }

  async completeReferral(referralCode: string, referredUserId: number): Promise<void> {
    const referral = this.mockReferrals.find(r => r.referral_code === referralCode)
    if (referral && referral.status === 'pending') {
      referral.status = 'completed'
      referral.referred_user_id = referredUserId
      referral.completed_at = new Date().toISOString()

      // Award points to both referrer and referred user
      await this.awardPoints(referral.referrer_user_id, referral.business_id, 50, 'Successful referral')
      await this.awardPoints(referredUserId, referral.business_id, 25, 'Welcome bonus from referral')
    }
  }

  async getUserPoints(userId: number, businessId: number): Promise<{ balance: number; totalEarned: number }> {
    const userPoints = this.mockUserPoints.find(p => p.user_id === userId && p.business_id === businessId)
    return {
      balance: userPoints?.points_balance || 0,
      totalEarned: userPoints?.total_points_earned || 0
    }
  }

  async getUserBadges(userId: number, businessId: number): Promise<any[]> {
    return this.mockUserBadges.filter(b => b.user_id === userId && b.business_id === businessId)
  }

  async getGamificationSettings(businessId: number): Promise<any> {
    return this.mockGamificationSettings.find(s => s.business_id === businessId) || {
      business_id: businessId,
      points_per_feedback: 10,
      points_per_referral: 50,
      welcome_bonus_points: 25,
      gamification_enabled: true,
      referral_enabled: true
    }
  }

  async updateGamificationSettings(businessId: number, settings: any): Promise<void> {
    const index = this.mockGamificationSettings.findIndex(s => s.business_id === businessId)
    if (index >= 0) {
      this.mockGamificationSettings[index] = { ...this.mockGamificationSettings[index], ...settings }
    } else {
      this.mockGamificationSettings.push({ business_id: businessId, ...settings })
    }
  }

  async getUserReferrals(userId: number, businessId: number): Promise<any[]> {
    return this.mockReferrals.filter(r => r.referrer_user_id === userId && r.business_id === businessId)
  }

  async trackSocialShare(userId: number | null, businessId: number, platform: string, url: string, referralCode?: string): Promise<void> {
    this.mockSocialShares.push({
      id: Math.max(...this.mockSocialShares.map(s => s.id), 0) + 1,
      user_id: userId,
      business_id: businessId,
      platform,
      shared_url: url,
      referral_code: referralCode,
      shared_at: new Date().toISOString()
    })
  }

  async getLeaderboard(businessId: number, type: 'points' | 'referrals', limit = 10): Promise<any[]> {
    if (type === 'points') {
      return this.mockUserPoints
        .filter(p => p.business_id === businessId)
        .sort((a, b) => b.total_points_earned - a.total_points_earned)
        .slice(0, limit)
        .map(p => ({
          user_id: p.user_id,
          total_points: p.total_points_earned,
          user_name: `User ${p.user_id}`
        }))
    } else {
      const referralCounts = this.mockReferrals
        .filter(r => r.business_id === businessId && r.status === 'completed')
        .reduce((acc, r) => {
          acc[r.referrer_user_id] = (acc[r.referrer_user_id] || 0) + 1
          return acc
        }, {} as Record<number, number>)

      return Object.entries(referralCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([userId, count]) => ({
          user_id: parseInt(userId),
          referral_count: count,
          user_name: `User ${userId}`
        }))
    }
  }

  private async awardPoints(userId: number, businessId: number, points: number, reason: string): Promise<void> {
    const userPoints = this.mockUserPoints.find(p => p.user_id === userId && p.business_id === businessId)
    if (userPoints) {
      userPoints.points_balance += points
      userPoints.total_points_earned += points
    } else {
      this.mockUserPoints.push({
        id: Math.max(...this.mockUserPoints.map(p => p.id), 0) + 1,
        user_id: userId,
        business_id: businessId,
        points_balance: points,
        total_points_earned: points,
        total_points_redeemed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  // Mock data arrays for referral system
  private mockReferrals: any[] = []
  private mockUserPoints: any[] = []
  private mockUserBadges: any[] = []
  private mockGamificationSettings: any[] = []
  private mockSocialShares: any[] = []

  // User authentication methods
  async getUser(id: number): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null
  }

  async getUserBusinessAccess(userId: number): Promise<Business[]> {
    const accessRecords = this.userBusinessAccess.filter(uba => uba.user_id === userId)
    const businessIds = accessRecords.map(uba => uba.business_id)
    return this.businesses.filter(b => businessIds.includes(b.id))
  }

  async validateUserBusinessAccess(userId: number, businessId: number): Promise<boolean> {
    return this.userBusinessAccess.some(uba => uba.user_id === userId && uba.business_id === businessId)
  }
}

// Neon database adapter for production
class NeonDatabaseAdapter implements DatabaseAdapter {
  private async query(sql: string, params: any[] = []): Promise<any[]> {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(sql, params);
      return result.rows;
    } catch (error: any) {
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  private async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as test');
      return result.length > 0;
    } catch (error) {
      return false;
    }
  }

  async getBusiness(id: number): Promise<Business | null> {
    try {
      const result = await this.query("SELECT * FROM businesses WHERE id = $1", [id]);
      if (result[0]) {
        return result[0];
      } else {
        return null;
      }
    } catch (error: any) {
      return mockDatabaseAdapter.getBusiness(id);
    }
  }

  async getBusinessByEmail(email: string): Promise<Business | null> {
    try {
      const result = await this.query("SELECT * FROM businesses WHERE email = $1", [email])
      return result[0] || null
    } catch (error) {
      return mockDatabaseAdapter.getBusinessByEmail(email)
    }
  }

  async getBusinessBySlug(slug: string): Promise<Business | null> {
    try {
      const result = await this.query("SELECT * FROM businesses WHERE slug = $1", [slug])
      return result[0] || null
    } catch (error) {
      return mockDatabaseAdapter.getBusinessBySlug(slug)
    }
  }

  async createBusiness(data: Omit<Business, "id" | "created_at" | "updated_at">): Promise<Business> {
    try {
      const result = await this.query(
        `INSERT INTO businesses (name, email, password_hash, profile_image, slug, location, background_type, background_value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          data.name,
          data.email,
          data.password_hash,
          data.profile_image,
          data.slug,
          data.location,
          data.background_type,
          data.background_value,
        ],
      )
      return result[0]
    } catch (error) {
      return mockDatabaseAdapter.createBusiness(data)
    }
  }

  async updateBusiness(id: number, data: Partial<Business>): Promise<Business | null> {
    try {
      console.log(`🔍 Updating business ID ${id} with data:`, Object.keys(data));

      // Build dynamic query based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [id]; // First parameter is always the ID
      let paramIndex = 2;

      if (data.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(data.name);
        paramIndex++;
      }

      if (data.email !== undefined) {
        updateFields.push(`email = $${paramIndex}`);
        values.push(data.email);
        paramIndex++;
      }

      if (data.password_hash !== undefined) {
        updateFields.push(`password_hash = $${paramIndex}`);
        values.push(data.password_hash);
        paramIndex++;
      }

      if (data.profile_image !== undefined) {
        updateFields.push(`profile_image = $${paramIndex}`);
        values.push(data.profile_image);
        paramIndex++;
      }

      if (data.slug !== undefined) {
        updateFields.push(`slug = $${paramIndex}`);
        values.push(data.slug);
        paramIndex++;
      }

      if (data.location !== undefined) {
        updateFields.push(`location = $${paramIndex}`);
        values.push(data.location);
        paramIndex++;
      }

      if (data.background_type !== undefined) {
        updateFields.push(`background_type = $${paramIndex}`);
        values.push(data.background_type);
        paramIndex++;
      }

      if (data.background_value !== undefined) {
        updateFields.push(`background_value = $${paramIndex}`);
        values.push(data.background_value);
        paramIndex++;
      }

      // Always update the updated_at timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      if (updateFields.length === 1) { // Only updated_at field
        console.log('⚠️  No fields to update');
        return this.getBusiness(id);
      }

      const query = `
        UPDATE businesses
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      console.log(`🔍 Executing update query with ${values.length} parameters`);
      const result = await this.query(query, values);

      if (result[0]) {
        console.log(`✅ Business updated successfully: ${result[0].name}`);
      } else {
        console.log(`⚠️  Business not found for update: ID ${id}`);
      }

      return result[0] || null;
    } catch (error: any) {
      console.error("❌ Database error in updateBusiness:", error.message);
      console.log("🔄 Falling back to mock database adapter");
      return mockDatabaseAdapter.updateBusiness(id, data);
    }
  }

  async getFeedbackForm(businessId: number): Promise<FeedbackForm | null> {
    try {
      const result = await this.query(
        "SELECT * FROM feedback_forms WHERE business_id = $1 AND is_active = true LIMIT 1",
        [businessId],
      )
      return result[0] || null
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.getFeedbackForm(businessId)
    }
  }

  async updateFeedbackForm(businessId: number, fields: FormField[], title?: string, description?: string, previewEnabled?: boolean): Promise<void> {
    try {
      console.log(`🔍 Updating feedback form for business ID: ${businessId}`);
      console.log(`📝 Form data:`, { title, description, fieldsCount: fields.length, previewEnabled });

      // First, check if a form already exists for this business
      const existingForm = await this.query(
        "SELECT id FROM feedback_forms WHERE business_id = $1 AND is_active = true LIMIT 1",
        [businessId]
      );

      if (existingForm.length > 0) {
        // Update existing form
        console.log(`📝 Updating existing form ID: ${existingForm[0].id}`);
        await this.query(
          `UPDATE feedback_forms
           SET fields = $2,
               title = COALESCE($3, title),
               description = COALESCE($4, description),
               preview_enabled = COALESCE($5, preview_enabled),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [existingForm[0].id, JSON.stringify(fields), title, description, previewEnabled]
        );
      } else {
        // Create new form
        console.log(`📝 Creating new form for business ID: ${businessId}`);
        await this.query(
          `INSERT INTO feedback_forms (business_id, title, description, fields, is_active, preview_enabled)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [businessId, title || "Customer Feedback", description || "We value your feedback!", JSON.stringify(fields), true, previewEnabled !== undefined ? previewEnabled : false]
        );
      }

      console.log(`✅ Feedback form updated successfully for business ID: ${businessId}`);
    } catch (error: any) {
      console.error("❌ Database error in updateFeedbackForm:", error.message);
      console.log("🔄 Falling back to mock database adapter");
      return mockDatabaseAdapter.updateFeedbackForm(businessId, fields, title, description, previewEnabled);
    }
  }

  async getSocialLinks(businessId: number): Promise<SocialLink[]> {
    try {
      const result = await this.query(
        "SELECT * FROM social_links WHERE business_id = $1 AND is_active = true ORDER BY display_order",
        [businessId],
      )
      return result
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.getSocialLinks(businessId)
    }
  }

  async updateSocialLinks(
    businessId: number,
    links: Omit<SocialLink, "id" | "business_id" | "created_at">[],
  ): Promise<void> {
    try {
      // Delete existing links
      await this.query("DELETE FROM social_links WHERE business_id = $1", [businessId])

      // Insert new links
      for (const [index, link] of links.entries()) {
        await this.query(
          "INSERT INTO social_links (business_id, platform, url, display_order, is_active) VALUES ($1, $2, $3, $4, $5)",
          [businessId, link.platform, link.url, index, link.is_active],
        )
      }
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.updateSocialLinks(businessId, links)
    }
  }

  async createFeedbackSubmission(data: Omit<FeedbackSubmission, "id" | "submitted_at">): Promise<FeedbackSubmission> {
    try {
      console.log("📝 Creating feedback submission:", {
        business_id: data.business_id,
        form_id: data.form_id,
        submission_data: data.submission_data,
        ip_address: data.ip_address
      })

      const result = await this.query(
        `INSERT INTO feedback_submissions (business_id, form_id, submission_data, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [data.business_id, data.form_id, JSON.stringify(data.submission_data), data.ip_address, data.user_agent],
      )

      console.log("✅ Feedback submission created successfully:", result[0])

      // Invalidate AI insights cache file for this business so fresh analysis runs next time
      try {
        const { promises: fs } = await import('fs')
        const path = (await import('path')).default
        const file = path.join(process.cwd(), '.cache', 'ai-insights', `business_${data.business_id}.json`)
        await fs.unlink(file).catch(() => {})
      } catch {}

      return result[0]
    } catch (error) {
      console.error("❌ Database error in createFeedbackSubmission:", error)
      console.log("🔄 Falling back to mock database adapter")
      return mockDatabaseAdapter.createFeedbackSubmission(data)
    }
  }

  async getFeedbackSubmissions(businessId: number, limit = 5): Promise<FeedbackSubmission[]> {
    try {
      const result = await this.query(
        "SELECT * FROM feedback_submissions WHERE business_id = $1 ORDER BY submitted_at DESC LIMIT $2",
        [businessId, limit],
      )
      return result
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.getFeedbackSubmissions(businessId, limit)
    }
  }

  async createAnalyticsEvent(data: Omit<AnalyticsEvent, "id" | "created_at">): Promise<void> {
    try {
      await this.query(
        `INSERT INTO analytics_events (business_id, event_type, event_data, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.business_id, data.event_type, JSON.stringify(data.event_data), data.ip_address, data.user_agent],
      )
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.createAnalyticsEvent(data)
    }
  }

  async getAnalyticsStats(businessId: number): Promise<{
    totalFeedback: number
    completionRate: number
    averageRating: number
    pageViews: number
  }> {
    try {
      console.log(`📊 Getting analytics stats for business ID: ${businessId}`)

      // Get feedback submissions with actual data to extract ratings properly
      const feedbackSubmissions = await this.query(
        "SELECT submission_data FROM feedback_submissions WHERE business_id = $1",
        [businessId],
      )

      const analyticsResult = await this.query(
        "SELECT event_type, COUNT(*) as count FROM analytics_events WHERE business_id = $1 GROUP BY event_type",
        [businessId],
      )

      const totalFeedback = feedbackSubmissions.length

      // Extract ratings from submission_data JSON
      const ratings = feedbackSubmissions
        .map((s: any) => {
          try {
            const data = typeof s.submission_data === 'string' ? JSON.parse(s.submission_data) : s.submission_data
            return data?.rating
          } catch {
            return null
          }
        })
        .filter((r: any): r is number => typeof r === "number" && r >= 1 && r <= 5)

      const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      const pageViews = analyticsResult.find((r: any) => r.event_type === "page_view")?.count || 0
      const formSubmits = analyticsResult.find((r: any) => r.event_type === "form_submit")?.count || 0

      const completionRate = pageViews > 0 ? (formSubmits / pageViews) * 100 : 0

      const stats = {
        totalFeedback,
        completionRate: Math.round(completionRate),
        averageRating: Math.round(averageRating * 10) / 10,
        pageViews,
      }

      console.log(`✅ Analytics stats calculated:`, stats)
      return stats
    } catch (error) {
      console.error("❌ Database error in getAnalyticsStats:", error)
      console.log("🔄 Falling back to mock database adapter")
      return mockDatabaseAdapter.getAnalyticsStats(businessId)
    }
  }

  async getDetailedInsights(businessId: number): Promise<{
    submissionTrends: Array<{ date: string; count: number }>
    fieldAnalytics: Array<{ fieldId: string; fieldLabel: string; fieldType: string; responses: any[] }>
    ratingDistribution: Array<{ rating: number; count: number }>
    recentSubmissions: FeedbackSubmission[]
  }> {
    try {
      console.log(`📊 Getting detailed insights for business ID: ${businessId}`)

      // Get submission trends (last 7 days)
      const trendsResult = await this.query(`
        SELECT DATE(submitted_at) as date, COUNT(*) as count
        FROM feedback_submissions
        WHERE business_id = $1 AND submitted_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(submitted_at)
        ORDER BY date
      `, [businessId])

      // Get all submissions for field analysis
      const submissionsResult = await this.query(
        "SELECT submission_data, submitted_at FROM feedback_submissions WHERE business_id = $1 ORDER BY submitted_at DESC",
        [businessId]
      )

      // Generate submission trends for last 7 days (fill missing days with 0)
      const submissionTrends = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const existing = trendsResult.find((t: any) => t.date === dateStr)
        submissionTrends.push({ date: dateStr, count: existing?.count || 0 })
      }

      // Analyze field responses
      const fieldAnalytics: Array<{ fieldId: string; fieldLabel: string; fieldType: string; responses: any[] }> = []
      if (submissionsResult.length > 0) {
        const allFields = new Set<string>()
        submissionsResult.forEach((s: any) => {
          try {
            const data = typeof s.submission_data === 'string' ? JSON.parse(s.submission_data) : s.submission_data
            Object.keys(data).forEach(key => allFields.add(key))
          } catch (e) {
            console.warn("Failed to parse submission data:", e)
          }
        })

        allFields.forEach(fieldId => {
          const responses = submissionsResult.map((s: any) => {
            try {
              const data = typeof s.submission_data === 'string' ? JSON.parse(s.submission_data) : s.submission_data
              return data[fieldId]
            } catch {
              return null
            }
          }).filter(r => r !== null && r !== undefined)

          if (responses.length > 0) {
            fieldAnalytics.push({
              fieldId,
              fieldLabel: fieldId.charAt(0).toUpperCase() + fieldId.slice(1).replace(/([A-Z])/g, ' $1'),
              fieldType: typeof responses[0] === 'number' ? 'rating' : 'text',
              responses
            })
          }
        })
      }

      // Rating distribution
      const ratings = submissionsResult
        .map((s: any) => {
          try {
            const data = typeof s.submission_data === 'string' ? JSON.parse(s.submission_data) : s.submission_data
            return data?.rating
          } catch {
            return null
          }
        })
        .filter((r: any): r is number => typeof r === "number" && r >= 1 && r <= 5)

      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: ratings.filter(r => r === rating).length
      }))

      const insights = {
        submissionTrends,
        fieldAnalytics,
        ratingDistribution,
        recentSubmissions: submissionsResult.slice(0, 10)
      }

      return insights
    } catch (error) {
      return mockDatabaseAdapter.getDetailedInsights(businessId)
    }
  }

  async getEnhancedInsights(businessId: number, timeRange: string, compareWith: string): Promise<{
    submissionTrends: Array<{ date: string; count: number; previousCount?: number }>
    ratingTrends: Array<{ date: string; averageRating: number; previousRating?: number }>
    responseTimeAnalysis: { averageResponseTime: number; trend: string }
    satisfactionScore: { current: number; previous: number; change: number }
    completionRate: { current: number; previous: number; change: number }
    topPerformingFields: Array<{ fieldId: string; fieldLabel: string; satisfactionScore: number }>
    underperformingFields: Array<{ fieldId: string; fieldLabel: string; issueCount: number }>
    peakSubmissionTimes: Array<{ hour: number; dayOfWeek: number; count: number }>
    geographicDistribution: Array<{ location: string; count: number; averageRating: number }>
  }> {
    try {
      // For now, fall back to mock implementation
      // In production, this would use complex SQL queries for enhanced analytics
      return mockDatabaseAdapter.getEnhancedInsights(businessId, timeRange, compareWith)
    } catch (error) {
      return mockDatabaseAdapter.getEnhancedInsights(businessId, timeRange, compareWith)
    }
  }

  async getCustomerJourneyAnalytics(businessId: number, timeRange: string): Promise<{
    touchpoints: Array<{ stage: string; count: number; conversionRate: number }>
    dropoffPoints: Array<{ fieldId: string; dropoffRate: number }>
    averageJourneyTime: number
    returnCustomerRate: number
    firstTimeVsReturning: { firstTime: number; returning: number }
    customerLifetimeValue: { average: number; segments: Array<{ segment: string; value: number }> }
  }> {
    try {
      // For now, fall back to mock implementation
      // In production, this would analyze user journey data
      return mockDatabaseAdapter.getCustomerJourneyAnalytics(businessId, timeRange)
    } catch (error) {
      return mockDatabaseAdapter.getCustomerJourneyAnalytics(businessId, timeRange)
    }
  }

  async getPerformanceBenchmarks(businessId: number, timeRange: string): Promise<{
    industryBenchmarks: { averageRating: number; responseRate: number; satisfactionScore: number }
    competitorAnalysis: { position: string; strengths: string[]; weaknesses: string[] }
    goalProgress: Array<{ metric: string; current: number; target: number; progress: number }>
    recommendations: Array<{ priority: string; action: string; expectedImpact: string }>
  }> {
    try {
      // For now, fall back to mock implementation
      // In production, this would compare against industry data
      return mockDatabaseAdapter.getPerformanceBenchmarks(businessId, timeRange)
    } catch (error) {
      return mockDatabaseAdapter.getPerformanceBenchmarks(businessId, timeRange)
    }
  }

  // Referral and Gamification System - PostgreSQL Implementation
  async createReferral(referrerUserId: number, businessId: number, referredEmail: string): Promise<{ referralCode: string; id: number }> {
    try {
      const result = await this.query(`
        INSERT INTO referrals (referrer_user_id, business_id, referred_email, referral_code, expires_at)
        VALUES ($1, $2, $3, generate_referral_code(), NOW() + INTERVAL '30 days')
        RETURNING id, referral_code
      `, [referrerUserId, businessId, referredEmail])

      return {
        referralCode: result[0].referral_code,
        id: result[0].id
      }
    } catch (error) {
      return mockDatabaseAdapter.createReferral(referrerUserId, businessId, referredEmail)
    }
  }

  async getReferralByCode(referralCode: string): Promise<any> {
    try {
      const result = await this.query(`
        SELECT * FROM referrals WHERE referral_code = $1
      `, [referralCode])

      return result[0] || null
    } catch (error) {
      return mockDatabaseAdapter.getReferralByCode(referralCode)
    }
  }

  async completeReferral(referralCode: string, referredUserId: number): Promise<void> {
    try {
      await this.query(`
        UPDATE referrals
        SET status = 'completed', referred_user_id = $1, completed_at = NOW()
        WHERE referral_code = $2 AND status = 'pending'
      `, [referredUserId, referralCode])

      // Award points using the database function
      const referral = await this.getReferralByCode(referralCode)
      if (referral) {
        const settings = await this.getGamificationSettings(referral.business_id)
        await this.query(`
          SELECT award_points($1, $2, $3, 'Successful referral', $4, 'referral')
        `, [referral.referrer_user_id, referral.business_id, settings.points_per_referral, referral.id])

        await this.query(`
          SELECT award_points($1, $2, $3, 'Welcome bonus from referral', $4, 'referral')
        `, [referredUserId, referral.business_id, settings.welcome_bonus_points, referral.id])
      }
    } catch (error) {
      return mockDatabaseAdapter.completeReferral(referralCode, referredUserId)
    }
  }

  async getUserPoints(userId: number, businessId: number): Promise<{ balance: number; totalEarned: number }> {
    try {
      const result = await this.query(`
        SELECT points_balance, total_points_earned
        FROM user_points
        WHERE user_id = $1 AND business_id = $2
      `, [userId, businessId])

      return {
        balance: result[0]?.points_balance || 0,
        totalEarned: result[0]?.total_points_earned || 0
      }
    } catch (error) {
      return mockDatabaseAdapter.getUserPoints(userId, businessId)
    }
  }

  async getUserBadges(userId: number, businessId: number): Promise<any[]> {
    try {
      const result = await this.query(`
        SELECT * FROM user_badges
        WHERE user_id = $1 AND business_id = $2
        ORDER BY earned_at DESC
      `, [userId, businessId])

      return result
    } catch (error) {
      return mockDatabaseAdapter.getUserBadges(userId, businessId)
    }
  }

  async getGamificationSettings(businessId: number): Promise<any> {
    try {
      const result = await this.query(`
        SELECT * FROM gamification_settings WHERE business_id = $1
      `, [businessId])

      return result[0] || {
        business_id: businessId,
        points_per_feedback: 10,
        points_per_referral: 50,
        welcome_bonus_points: 25,
        gamification_enabled: true,
        referral_enabled: true
      }
    } catch (error) {
      return mockDatabaseAdapter.getGamificationSettings(businessId)
    }
  }

  async updateGamificationSettings(businessId: number, settings: any): Promise<void> {
    try {
      await this.query(`
        INSERT INTO gamification_settings (business_id, points_per_feedback, points_per_referral, welcome_bonus_points, gamification_enabled, referral_enabled)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (business_id)
        DO UPDATE SET
          points_per_feedback = $2,
          points_per_referral = $3,
          welcome_bonus_points = $4,
          gamification_enabled = $5,
          referral_enabled = $6,
          updated_at = NOW()
      `, [
        businessId,
        settings.points_per_feedback,
        settings.points_per_referral,
        settings.welcome_bonus_points,
        settings.gamification_enabled,
        settings.referral_enabled
      ])
    } catch (error) {
      return mockDatabaseAdapter.updateGamificationSettings(businessId, settings)
    }
  }

  async getUserReferrals(userId: number, businessId: number): Promise<any[]> {
    try {
      const result = await this.query(`
        SELECT r.*, u.first_name, u.last_name, u.email as referred_user_email
        FROM referrals r
        LEFT JOIN users u ON r.referred_user_id = u.id
        WHERE r.referrer_user_id = $1 AND r.business_id = $2
        ORDER BY r.created_at DESC
      `, [userId, businessId])

      return result
    } catch (error) {
      return mockDatabaseAdapter.getUserReferrals(userId, businessId)
    }
  }

  async trackSocialShare(userId: number | null, businessId: number, platform: string, url: string, referralCode?: string): Promise<void> {
    try {
      await this.query(`
        INSERT INTO social_shares (user_id, business_id, platform, shared_url, referral_code)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, businessId, platform, url, referralCode])
    } catch (error) {
      return mockDatabaseAdapter.trackSocialShare(userId, businessId, platform, url, referralCode)
    }
  }

  async getLeaderboard(businessId: number, type: 'points' | 'referrals', limit = 10): Promise<any[]> {
    try {
      if (type === 'points') {
        const result = await this.query(`
          SELECT up.user_id, up.total_points_earned as total_points,
                 u.first_name, u.last_name, u.email
          FROM user_points up
          JOIN users u ON up.user_id = u.id
          WHERE up.business_id = $1
          ORDER BY up.total_points_earned DESC
          LIMIT $2
        `, [businessId, limit])

        return result.map(r => ({
          user_id: r.user_id,
          total_points: r.total_points_earned,
          user_name: `${r.first_name} ${r.last_name}`.trim() || r.email
        }))
      } else {
        const result = await this.query(`
          SELECT r.referrer_user_id as user_id, COUNT(*) as referral_count,
                 u.first_name, u.last_name, u.email
          FROM referrals r
          JOIN users u ON r.referrer_user_id = u.id
          WHERE r.business_id = $1 AND r.status = 'completed'
          GROUP BY r.referrer_user_id, u.first_name, u.last_name, u.email
          ORDER BY referral_count DESC
          LIMIT $2
        `, [businessId, limit])

        return result.map(r => ({
          user_id: r.user_id,
          referral_count: parseInt(r.referral_count),
          user_name: `${r.first_name} ${r.last_name}`.trim() || r.email
        }))
      }
    } catch (error) {
      return mockDatabaseAdapter.getLeaderboard(businessId, type, limit)
    }
  }

  async getCustomerProfiles(businessId: number): Promise<CustomerProfile[]> {
    try {
      console.log(`👥 Getting customer profiles for business ID: ${businessId}`)
      // For now, fall back to mock data since we haven't created the customer_profiles table yet
      return mockDatabaseAdapter.getCustomerProfiles(businessId)
    } catch (error) {
      console.error("❌ Database error in getCustomerProfiles:", error)
      return mockDatabaseAdapter.getCustomerProfiles(businessId)
    }
  }

  async getCustomerProfile(businessId: number, email: string): Promise<CustomerProfile | null> {
    try {
      console.log(`👤 Getting customer profile for ${email} in business ${businessId}`)
      // For now, fall back to mock data since we haven't created the customer_profiles table yet
      return mockDatabaseAdapter.getCustomerProfile(businessId, email)
    } catch (error) {
      console.error("❌ Database error in getCustomerProfile:", error)
      return mockDatabaseAdapter.getCustomerProfile(businessId, email)
    }
  }

  async createOrUpdateCustomerProfile(businessId: number, email: string, data: Partial<CustomerProfile>): Promise<CustomerProfile> {
    try {
      console.log(`💾 Creating/updating customer profile for ${email} in business ${businessId}`)
      // For now, fall back to mock data since we haven't created the customer_profiles table yet
      return mockDatabaseAdapter.createOrUpdateCustomerProfile(businessId, email, data)
    } catch (error) {
      console.error("❌ Database error in createOrUpdateCustomerProfile:", error)
      return mockDatabaseAdapter.createOrUpdateCustomerProfile(businessId, email, data)
    }
  }

  async getCustomerSegments(businessId: number): Promise<CustomerSegment[]> {
    try {
      console.log(`📊 Getting customer segments for business ID: ${businessId}`)
      // For now, fall back to mock data since we haven't created the customer_segments table yet
      return mockDatabaseAdapter.getCustomerSegments(businessId)
    } catch (error) {
      console.error("❌ Database error in getCustomerSegments:", error)
      return mockDatabaseAdapter.getCustomerSegments(businessId)
    }
  }

  // User authentication methods
  async getUser(id: number): Promise<User | null> {
    try {
      console.log(`👤 Getting user by ID: ${id}`)
      // Try without is_active column first since it might not exist
      const result = await this.query("SELECT * FROM users WHERE id = $1", [id])

      if (result.length === 0) {
        console.log(`👤 No user found in database for ID: ${id}, falling back to mock data`)
        return mockDatabaseAdapter.getUser(id)
      }

      return result[0] || null
    } catch (error) {
      console.error("❌ Database error in getUser:", error)
      console.log(`👤 Falling back to mock data for user ID: ${id}`)
      return mockDatabaseAdapter.getUser(id)
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log(`👤 Getting user by email: ${email}`)

      // First try with email column
      try {
        let result = await this.query("SELECT * FROM users WHERE email = $1", [email])
        if (result.length > 0) {
          console.log(`✅ Found user with email column`)
          return result[0]
        }
        console.log(`👤 No user found with email column`)
      } catch (emailColumnError: any) {
        console.log(`👤 Email column query failed: ${emailColumnError.message}`)

        // If it's a "column does not exist" error, try username column
        if (emailColumnError.code === '42703') {
          console.log(`👤 Email column doesn't exist, trying username column`)
          try {
            let result = await this.query("SELECT * FROM users WHERE username = $1", [email])
            if (result.length > 0) {
              console.log(`✅ Found user with username column`)
              // Map username to email for compatibility
              const user = result[0]
              return {
                ...user,
                email: user.username || user.email
              }
            }
            console.log(`👤 No user found with username column`)
          } catch (usernameColumnError: any) {
            console.log(`👤 Username column query failed: ${usernameColumnError.message}`)
          }
        } else {
          // Re-throw if it's not a column missing error
          throw emailColumnError
        }
      }

      // If no user found in database, fall back to mock
      console.log(`👤 No user found in database for email: ${email}, falling back to mock data`)
      return mockDatabaseAdapter.getUserByEmail(email)

    } catch (error) {
      console.error("❌ Database error in getUserByEmail:", error)
      console.log(`👤 Falling back to mock data for email: ${email}`)
      return mockDatabaseAdapter.getUserByEmail(email)
    }
  }

  async getUserBusinessAccess(userId: number): Promise<Business[]> {
    try {
      console.log(`🏢 Getting business access for user ID: ${userId}`)
      const result = await this.query(`
        SELECT b.* FROM businesses b
        JOIN user_business_access uba ON b.id = uba.business_id
        WHERE uba.user_id = $1
      `, [userId])
      return result
    } catch (error) {
      console.error("❌ Database error in getUserBusinessAccess:", error)
      return mockDatabaseAdapter.getUserBusinessAccess(userId)
    }
  }

  async validateUserBusinessAccess(userId: number, businessId: number): Promise<boolean> {
    try {
      console.log(`🔐 Validating user ${userId} access to business ${businessId}`)
      const result = await this.query(`
        SELECT 1 FROM user_business_access
        WHERE user_id = $1 AND business_id = $2
      `, [userId, businessId])
      return result.length > 0
    } catch (error) {
      console.error("❌ Database error in validateUserBusinessAccess:", error)
      return mockDatabaseAdapter.validateUserBusinessAccess(userId, businessId)
    }
  }
}

// Create database adapter instances
const mockDatabaseAdapter = new MockDatabaseAdapter()
const neonDatabaseAdapter = new NeonDatabaseAdapter()

// Export the appropriate adapter based on environment
export const db: DatabaseAdapter = process.env.DATABASE_URL ? neonDatabaseAdapter : mockDatabaseAdapter

// Export mock data for testing
export { mockBusinesses, mockFeedbackForms, mockSocialLinks, mockFeedbackSubmissions, mockCustomerProfiles, mockCustomerSegments }
