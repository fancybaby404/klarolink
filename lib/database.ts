import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(process.cwd(), "klarolink.db")
const db = new Database(dbPath)

// Enable foreign keys
db.pragma("foreign_keys = ON")

export default db

export interface Business {
  id: number
  name: string
  email: string
  password_hash: string
  profile_image?: string
  slug: string
  background_type: "color" | "image"
  background_value: string
  created_at: string
  updated_at: string
}

export interface FeedbackForm {
  id: number
  business_id: number
  title: string
  description?: string
  fields: FormField[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FormField {
  id: string
  type: "text" | "email" | "textarea" | "rating" | "select" | "checkbox"
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
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
  submission_data: Record<string, any>
  submitted_at: string
  ip_address?: string
  user_agent?: string
}

export interface AnalyticsEvent {
  id: number
  business_id: number
  event_type: "page_view" | "form_view" | "form_submit" | "link_click"
  event_data?: Record<string, any>
  created_at: string
  ip_address?: string
  user_agent?: string
}
