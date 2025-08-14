// Shared type definitions for the application
export interface User {
  id: number
  email: string
  password_hash: string
  first_name?: string
  last_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Business {
  id: number
  name: string
  email: string
  password_hash: string
  profile_image?: string
  slug: string
  location?: string
  background_type: "color" | "image"
  background_value: string
  submit_button_color?: string
  submit_button_text_color?: string
  submit_button_hover_color?: string
  preview_enabled?: boolean
  created_at: string
  updated_at: string
}

export interface UserBusinessAccess {
  id: number
  user_id: number
  business_id: number
  role: string
  granted_at: string
}

export interface FeedbackForm {
  id: number
  business_id: number
  title: string
  description?: string
  fields: FormField[]
  is_active: boolean
  preview_enabled?: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  business_id: number
  name: string
  description?: string
  product_image?: string
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductPricing {
  id: number
  product_id: number
  price: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductWithPricing extends Product {
  pricing?: ProductPricing[]
}

export interface ProductReview {
  id: number
  product_id: number
  user_id?: number
  rating: number // 1-5 stars
  comment: string
  created_at: string
  updated_at: string
}

export interface FormProduct {
  id: number
  form_id: number
  product_id: number
  created_at: string
}

export interface FormField {
  id: string
  type: "text" | "email" | "textarea" | "rating" | "select" | "checkbox"
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  // Analytics metadata
  analytics_enabled?: boolean
  field_category?: "personal_info" | "feedback" | "rating" | "contact" | "custom"
  validation_rules?: {
    min_length?: number
    max_length?: number
    pattern?: string
    min_value?: number
    max_value?: number
  }
}

export interface SocialLink {
  id: number
  business_id: number
  platform: string
  url: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface FeedbackSubmission {
  id: number
  business_id: number
  form_id: number
  user_id?: number
  submission_data: Record<string, any>
  submitted_at: string
  ip_address?: string
  user_agent?: string
  // Enhanced analytics metadata
  session_id?: string
  completion_time_seconds?: number
  form_start_time?: string
  referrer?: string
  device_type?: "desktop" | "mobile" | "tablet"
  browser_info?: {
    name?: string
    version?: string
    os?: string
  }
  location_data?: {
    country?: string
    region?: string
    city?: string
    timezone?: string
  }
  customer_metadata?: {
    is_returning_customer?: boolean
    previous_submissions_count?: number
    customer_segment?: string
  }
}

export interface AnalyticsEvent {
  id: number
  business_id: number
  event_type:
    | "page_view"
    | "form_view"
    | "form_submit"
    | "link_click"
    | "form_start"
    | "form_abandon"
    | "field_focus"
    | "field_blur"
    | "field_error"
    | "template_selected"
    | "form_preview"
    | "social_link_click"
  event_data?: Record<string, any>
  created_at: string
  ip_address?: string
  user_agent?: string
  session_id?: string
  page_url?: string
  referrer?: string
}

export interface CustomerProfile {
  id: number
  business_id: number
  email: string
  name?: string
  total_submissions: number
  average_rating: number
  engagement_score: number
  first_submission_at?: string
  last_submission_at?: string
  segments: string[]
  custom_fields: Record<string, any>
  created_at: string
}

export interface CustomerSegment {
  id: number
  business_id: number
  name: string
  description?: string
  rules: Record<string, any>
  customer_count: number
  created_at: string
}
