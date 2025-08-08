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
    return jwt.verify(token, JWT_SECRET) as { businessId: number }
  } catch {
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
    console.log(`🔍 Auth: Getting business by ID: ${id}`)
    const business = await db.getBusiness(id)
    if (business) {
      console.log(`✅ Auth: Business found - ${business.name} (${business.slug})`)
    } else {
      console.log(`⚠️  Auth: Business not found for ID: ${id}`)
    }
    return business
  } catch (error) {
    console.error(`❌ Auth: Error getting business by ID ${id}:`, error)
    return null
  }
}

export async function getBusinessByEmail(email: string): Promise<Business | null> {
  try {
    console.log(`🔍 Auth: Getting business by email: ${email}`)
    const business = await db.getBusinessByEmail(email)
    if (business) {
      console.log(`✅ Auth: Business found by email - ${business.name} (${business.slug})`)
    } else {
      console.log(`⚠️  Auth: Business not found for email: ${email}`)
    }
    return business
  } catch (error) {
    console.error(`❌ Auth: Error getting business by email ${email}:`, error)
    return null
  }
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  try {
    console.log(`🔍 Auth: Getting business by slug: ${slug}`)
    const business = await db.getBusinessBySlug(slug)
    if (business) {
      console.log(`✅ Auth: Business found by slug - ${business.name} (ID: ${business.id})`)
    } else {
      console.log(`⚠️  Auth: Business not found for slug: ${slug}`)
    }
    return business
  } catch (error) {
    console.error(`❌ Auth: Error getting business by slug ${slug}:`, error)
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
    console.log(`🔍 Auth: Creating business - Name: ${data.name}, Email: ${data.email}, Slug: ${data.slug}`)

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
    console.log(`✅ Auth: Business created successfully - ID: ${business.id}, Name: ${business.name}`)
    return business
  } catch (error) {
    console.error(`❌ Auth: Error creating business:`, error)
    throw error
  }
}

export async function updateBusinessBackground(
  id: number,
  backgroundType: "color" | "image",
  backgroundValue: string,
): Promise<Business | null> {
  try {
    console.log(`🔍 Auth: Updating business background - ID: ${id}, Type: ${backgroundType}`)

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

    if (business) {
      console.log(`✅ Auth: Business background updated successfully - ${business.name}`)
    } else {
      console.log(`⚠️  Auth: Business not found for background update - ID: ${id}`)
    }

    return business
  } catch (error) {
    console.error(`❌ Auth: Error updating business background for ID ${id}:`, error)
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
    console.log(`🔍 Auth: Updating business profile - ID: ${id}`)

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

    if (business) {
      console.log(`✅ Auth: Business profile updated successfully - ${business.name}`)
    } else {
      console.log(`⚠️  Auth: Business not found for profile update - ID: ${id}`)
    }

    return business
  } catch (error) {
    console.error(`❌ Auth: Error updating business profile for ID ${id}:`, error)
    throw error
  }
}

export async function validateBusinessAccess(businessId: number, token: string): Promise<boolean> {
  try {
    const payload = verifyToken(token)
    if (!payload) {
      console.log(`⚠️  Auth: Invalid token for business access validation`)
      return false
    }

    if (payload.businessId !== businessId) {
      console.log(`⚠️  Auth: Token business ID (${payload.businessId}) doesn't match requested business ID (${businessId})`)
      return false
    }

    // Verify business still exists
    const business = await getBusiness(businessId)
    if (!business) {
      console.log(`⚠️  Auth: Business not found during access validation - ID: ${businessId}`)
      return false
    }

    console.log(`✅ Auth: Business access validated - ${business.name} (ID: ${businessId})`)
    return true
  } catch (error) {
    console.error(`❌ Auth: Error validating business access:`, error)
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
    console.log(`🔍 Auth: Getting user by email: ${email}`)
    const user = await db.getUserByEmail(email)
    if (user) {
      console.log(`✅ Auth: User found by email - ${user.first_name} ${user.last_name} (ID: ${user.id})`)
    } else {
      console.log(`⚠️  Auth: User not found for email: ${email}`)
    }
    return user
  } catch (error) {
    console.error(`❌ Auth: Error getting user by email ${email}:`, error)
    return null
  }
}

export async function getUser(id: number): Promise<User | null> {
  try {
    console.log(`🔍 Auth: Getting user by ID: ${id}`)
    const user = await db.getUser(id)
    if (user) {
      console.log(`✅ Auth: User found - ${user.first_name} ${user.last_name} (${user.email})`)
    } else {
      console.log(`⚠️  Auth: User not found for ID: ${id}`)
    }
    return user
  } catch (error) {
    console.error(`❌ Auth: Error getting user by ID ${id}:`, error)
    return null
  }
}

export async function getUserBusinessAccess(userId: number): Promise<Business[]> {
  try {
    console.log(`🔍 Auth: Getting business access for user ID: ${userId}`)
    const businesses = await db.getUserBusinessAccess(userId)
    console.log(`✅ Auth: Found ${businesses.length} businesses for user ${userId}`)
    return businesses
  } catch (error) {
    console.error(`❌ Auth: Error getting user business access for user ${userId}:`, error)
    return []
  }
}

export async function validateUserBusinessAccess(userId: number, businessId: number): Promise<boolean> {
  try {
    console.log(`🔍 Auth: Validating user ${userId} access to business ${businessId}`)
    const hasAccess = await db.validateUserBusinessAccess(userId, businessId)
    if (hasAccess) {
      console.log(`✅ Auth: User ${userId} has access to business ${businessId}`)
    } else {
      console.log(`⚠️  Auth: User ${userId} does not have access to business ${businessId}`)
    }
    return hasAccess
  } catch (error) {
    console.error(`❌ Auth: Error validating user business access:`, error)
    return false
  }
}
