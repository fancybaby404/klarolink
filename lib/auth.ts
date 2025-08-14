import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "./database-adapter"
import type { Business, User } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Validate that we have a proper JWT secret in production
if (process.env.NODE_ENV === "production" && JWT_SECRET === "your-secret-key-change-in-production") {
  console.warn("⚠️  WARNING: Using default JWT secret in production. Please set JWT_SECRET environment variable.")
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(businessId: number): string {
  return jwt.sign({ businessId }, JWT_SECRET, { expiresIn: "7d" })
}

export function generateUserToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { businessId: number } | null {
  try {
    console.log('🔑 Verifying token, length:', token.length)
    const decoded = jwt.verify(token, JWT_SECRET) as { businessId: number }
    console.log('✅ Token verified successfully, businessId:', decoded.businessId)
    return decoded
  } catch (error) {
    console.log('❌ Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

export function verifyUserToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number }
  } catch {
    return null
  }
}

export async function getBusiness(id: number): Promise<Business | null> {
  try {
    const business = await db.getBusiness(id)
    return business
  } catch (error) {
    return null
  }
}

export async function getBusinessByEmail(email: string): Promise<Business | null> {
  try {
    const business = await db.getBusinessByEmail(email)
    return business
  } catch (error) {
    return null
  }
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  try {
    const business = await db.getBusinessBySlug(slug)
    return business
  } catch (error) {
    return null
  }
}

export async function createBusiness(data: {
  name: string
  email: string
  password_hash: string
  slug: string
  profile_image?: string
}): Promise<Business> {
  try {
    // Validate required fields
    if (!data.name?.trim()) {
      throw new Error("Business name is required")
    }
    if (!data.email?.trim()) {
      throw new Error("Business email is required")
    }
    if (!data.password_hash?.trim()) {
      throw new Error("Password hash is required")
    }
    if (!data.slug?.trim()) {
      throw new Error("Business slug is required")
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format")
    }

    // Validate slug format (alphanumeric and hyphens only)
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(data.slug)) {
      throw new Error("Slug must contain only lowercase letters, numbers, and hyphens")
    }

    // Check if email already exists
    const existingByEmail = await db.getBusinessByEmail(data.email)
    if (existingByEmail) {
      throw new Error("A business with this email already exists")
    }

    // Check if slug already exists
    const existingBySlug = await db.getBusinessBySlug(data.slug)
    if (existingBySlug) {
      throw new Error("A business with this slug already exists")
    }

    const businessData = {
      ...data,
      background_type: "color" as const,
      background_value: "#6366f1",
    }

    const business = await db.createBusiness(businessData)
    return business
  } catch (error) {
    throw error
  }
}

export async function updateBusinessBackground(
  id: number,
  backgroundType: "color" | "image",
  backgroundValue: string,
): Promise<Business | null> {
  try {
    // Validate background type
    if (!["color", "image"].includes(backgroundType)) {
      throw new Error("Background type must be 'color' or 'image'")
    }

    // Validate background value
    if (!backgroundValue?.trim()) {
      throw new Error("Background value is required")
    }

    // For color type, validate hex color format
    if (backgroundType === "color") {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      if (!hexColorRegex.test(backgroundValue)) {
        throw new Error("Invalid hex color format")
      }
    }

    // For image type, validate URL format
    if (backgroundType === "image") {
      try {
        new URL(backgroundValue)
      } catch {
        throw new Error("Invalid image URL format")
      }
    }

    const business = await db.updateBusiness(id, {
      background_type: backgroundType,
      background_value: backgroundValue,
    })

    return business
  } catch (error) {
    throw error
  }
}

// Additional utility functions for enhanced authentication

export async function updateBusinessProfile(
  id: number,
  data: {
    name?: string
    profile_image?: string
    location?: string
  }
): Promise<Business | null> {
  try {
    const updateData: any = {}

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error("Business name cannot be empty")
      }
      updateData.name = data.name.trim()
    }

    if (data.profile_image !== undefined) {
      // Allow null/empty string to remove profile image
      if (data.profile_image && data.profile_image.trim()) {
        try {
          new URL(data.profile_image)
          updateData.profile_image = data.profile_image
        } catch {
          throw new Error("Invalid profile image URL format")
        }
      } else {
        updateData.profile_image = null
      }
    }

    if (data.location !== undefined) {
      // Allow null/empty string to remove location
      if (data.location && data.location.trim()) {
        updateData.location = data.location.trim()
      } else {
        updateData.location = null
      }
    }

    const business = await db.updateBusiness(id, updateData)
    return business
  } catch (error) {
    throw error
  }
}

export async function validateBusinessAccess(businessId: number, token: string): Promise<boolean> {
  try {
    const payload = verifyToken(token)
    if (!payload) {
      return false
    }

    if (payload.businessId !== businessId) {
      return false
    }

    // Verify business still exists
    const business = await getBusiness(businessId)
    if (!business) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false
  }

  // Slug should be 3-50 characters, lowercase letters, numbers, and hyphens only
  // Cannot start or end with hyphen
  const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
}

export function generateSlugFromName(name: string): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
}

export async function generateUniqueSlug(baseName: string): Promise<string> {
  let slug = generateSlugFromName(baseName)

  if (!isValidSlug(slug)) {
    slug = 'business-' + Date.now().toString().slice(-6)
  }

  let counter = 0
  let uniqueSlug = slug

  while (counter < 100) { // Prevent infinite loop
    const existing = await getBusinessBySlug(uniqueSlug)
    if (!existing) {
      return uniqueSlug
    }

    counter++
    uniqueSlug = `${slug}-${counter}`
  }

  // Fallback to timestamp-based slug
  return `business-${Date.now()}`
}

// =====================================================
// USER AUTHENTICATION FUNCTIONS
// =====================================================

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await db.getUserByEmail(email)
    return user
  } catch (error) {
    // Log error for debugging but don't expose to client
    console.error('Database error in getUserByEmail:', error)
    return null
  }
}

export async function getUser(id: number): Promise<User | null> {
  try {
    const user = await db.getUser(id)
    return user
  } catch (error) {
    return null
  }
}

export async function createUser(data: {
  email: string
  password: string
  first_name: string
  last_name: string
  username?: string
  role?: string
}): Promise<User> {
  try {
    // Validate required fields
    if (!data.email?.trim()) {
      throw new Error("Email is required")
    }
    if (!data.password?.trim()) {
      throw new Error("Password is required")
    }
    if (!data.first_name?.trim()) {
      throw new Error("First name is required")
    }
    if (!data.last_name?.trim()) {
      throw new Error("Last name is required")
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format")
    }

    // Validate password length
    if (data.password.length < 6) {
      throw new Error("Password must be at least 6 characters long")
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(data.email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    const userData = {
      email: data.email,
      username: data.username || data.email,
      password: passwordHash,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role || 'user'
    }

    const user = await db.createUser(userData)
    return user
  } catch (error) {
    console.error("❌ Error creating user:", error)
    throw error
  }
}

export async function getUserBusinessAccess(userId: number): Promise<Business[]> {
  try {
    const businesses = await db.getUserBusinessAccess(userId)
    return businesses
  } catch (error) {
    return []
  }
}

export async function validateUserBusinessAccess(userId: number, businessId: number): Promise<boolean> {
  try {
    const hasAccess = await db.validateUserBusinessAccess(userId, businessId)
    return hasAccess
  } catch (error) {
    return false
  }
}
