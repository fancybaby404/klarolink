import type { Business, SocialLink, FeedbackForm, Product, FormProduct } from "@/lib/types"

export interface DashboardStats {
  totalFeedback: number
  completionRate: number
  averageRating: number
  pageViews: number
  recentFeedback: Array<{
    id: number
    rating: number
    feedback: string
    submitted_at: string
  }>
}

export interface DashboardData {
  business: Business
  stats: DashboardStats
  socialLinks: SocialLink[]
  feedbackForm: FeedbackForm | null
  products?: Product[]
  formProducts?: FormProduct[]
}

export interface FormBuilderField {
  id: string
  type: "text" | "email" | "textarea" | "rating" | "select" | "checkbox"
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  fields: FormBuilderField[]
  category: string
}

export interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  bgColor: string
  borderColor: string
}

export interface InsightsData {
  submissionTrends?: Array<{
    date: string
    count: number
  }>
  ratingDistribution?: Array<{
    rating: number
    count: number
  }>
  recentSubmissions?: Array<{
    id: number
    rating: number
    feedback: string
    submitted_at: string
    submission_data?: any
  }>
}

export interface AudienceData {
  customerProfiles?: Array<{
    id: number
    name?: string
    email: string
    average_rating: number
    total_submissions: number
    engagement_score: number
    segments: string[]
  }>
  overviewStats?: {
    totalCustomers: number
    promoters: number
    detractors: number
    passives: number
    averageEngagement: number
    npsScore: number
  }
  customerSegments?: Array<{
    id: string
    name: string
    description: string
    customer_count: number
  }>
}

export type DashboardTab = "overview" | "forms" | "insights" | "audience"
