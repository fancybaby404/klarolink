// Database abstraction layer for v0 compatibility
import type { Business, FeedbackForm, SocialLink, FeedbackSubmission, AnalyticsEvent, FormField } from "./types"
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
    background_type: "color",
    background_value: "#6366f1",
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
    background_type: "color",
    background_value: "#dc2626",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
  updateFeedbackForm(businessId: number, fields: FormField[]): Promise<void>

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
}

// Mock database adapter for v0 preview environment
class MockDatabaseAdapter implements DatabaseAdapter {
  private businesses = [...mockBusinesses]
  private feedbackForms = [...mockFeedbackForms]
  private socialLinks = [...mockSocialLinks]
  private feedbackSubmissions = [...mockFeedbackSubmissions]
  private analyticsEvents = [...mockAnalyticsEvents]

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

  async updateFeedbackForm(businessId: number, fields: FormField[]): Promise<void> {
    const index = this.feedbackForms.findIndex((f) => f.business_id === businessId)
    if (index !== -1) {
      this.feedbackForms[index] = {
        ...this.feedbackForms[index],
        fields,
        updated_at: new Date().toISOString(),
      }
    } else {
      this.feedbackForms.push({
        id: Math.max(...this.feedbackForms.map((f) => f.id)) + 1,
        business_id: businessId,
        title: "Customer Feedback",
        fields,
        is_active: true,
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
}

// Neon database adapter for production
class NeonDatabaseAdapter implements DatabaseAdapter {
  private async query(sql: string, params: any[] = []): Promise<any[]> {
    try {
      const client = await pool.connect()
      const result = await client.query(sql, params)
      client.release()
      return result.rows
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  }

  async getBusiness(id: number): Promise<Business | null> {
    try {
      const result = await this.query("SELECT * FROM businesses WHERE id = $1", [id])
      return result[0] || null
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.getBusiness(id)
    }
  }

  async getBusinessByEmail(email: string): Promise<Business | null> {
    try {
      const result = await this.query("SELECT * FROM businesses WHERE email = $1", [email])
      return result[0] || null
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.getBusinessByEmail(email)
    }
  }

  async getBusinessBySlug(slug: string): Promise<Business | null> {
    try {
      const result = await this.query("SELECT * FROM businesses WHERE slug = $1", [slug])
      return result[0] || null
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.getBusinessBySlug(slug)
    }
  }

  async createBusiness(data: Omit<Business, "id" | "created_at" | "updated_at">): Promise<Business> {
    try {
      const result = await this.query(
        `INSERT INTO businesses (name, email, password_hash, profile_image, slug, background_type, background_value)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          data.name,
          data.email,
          data.password_hash,
          data.profile_image,
          data.slug,
          data.background_type,
          data.background_value,
        ],
      )
      return result[0]
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.createBusiness(data)
    }
  }

  async updateBusiness(id: number, data: Partial<Business>): Promise<Business | null> {
    try {
      const result = await this.query(
        `UPDATE businesses SET 
         name = COALESCE($2, name),
         background_type = COALESCE($3, background_type),
         background_value = COALESCE($4, background_value),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [id, data.name, data.background_type, data.background_value],
      )
      return result[0] || null
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.updateBusiness(id, data)
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

  async updateFeedbackForm(businessId: number, fields: FormField[]): Promise<void> {
    try {
      await this.query(
        `INSERT INTO feedback_forms (business_id, title, fields)
         VALUES ($1, $2, $3)
         ON CONFLICT (business_id) DO UPDATE SET
         fields = $3, updated_at = CURRENT_TIMESTAMP`,
        [businessId, "Customer Feedback", JSON.stringify(fields)],
      )
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.updateFeedbackForm(businessId, fields)
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
      const result = await this.query(
        `INSERT INTO feedback_submissions (business_id, form_id, submission_data, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [data.business_id, data.form_id, JSON.stringify(data.submission_data), data.ip_address, data.user_agent],
      )
      return result[0]
    } catch (error) {
      console.error("Database error:", error)
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
      const [feedbackResult, analyticsResult] = await Promise.all([
        this.query(
          "SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM feedback_submissions WHERE business_id = $1",
          [businessId],
        ),
        this.query(
          "SELECT event_type, COUNT(*) as count FROM analytics_events WHERE business_id = $1 GROUP BY event_type",
          [businessId],
        ),
      ])

      const totalFeedback = feedbackResult[0]?.count || 0
      const averageRating = feedbackResult[0]?.avg_rating || 0
      const pageViews = analyticsResult.find((r: any) => r.event_type === "page_view")?.count || 0
      const formSubmits = analyticsResult.find((r: any) => r.event_type === "form_submit")?.count || 0

      const completionRate = pageViews > 0 ? (formSubmits / pageViews) * 100 : 0

      return {
        totalFeedback,
        completionRate: Math.round(completionRate),
        averageRating: Math.round(averageRating * 10) / 10,
        pageViews,
      }
    } catch (error) {
      console.error("Database error:", error)
      return mockDatabaseAdapter.getAnalyticsStats(businessId)
    }
  }
}

// Create database adapter instances
const mockDatabaseAdapter = new MockDatabaseAdapter()
const neonDatabaseAdapter = new NeonDatabaseAdapter()

// Export the appropriate adapter based on environment
export const db: DatabaseAdapter = process.env.DATABASE_URL ? neonDatabaseAdapter : mockDatabaseAdapter

// Export mock data for testing
export { mockBusinesses, mockFeedbackForms, mockSocialLinks, mockFeedbackSubmissions }
