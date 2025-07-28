import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "./database-adapter"
import type { Business } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(businessId: number): string {
  return jwt.sign({ businessId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { businessId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { businessId: number }
  } catch {
    return null
  }
}

export async function getBusiness(id: number): Promise<Business | null> {
  return db.getBusiness(id)
}

export async function getBusinessByEmail(email: string): Promise<Business | null> {
  return db.getBusinessByEmail(email)
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  return db.getBusinessBySlug(slug)
}

export async function createBusiness(data: {
  name: string
  email: string
  password_hash: string
  slug: string
  profile_image?: string
}): Promise<Business> {
  return db.createBusiness({
    ...data,
    background_type: "color",
    background_value: "#6366f1",
  })
}

export async function updateBusinessBackground(
  id: number,
  backgroundType: "color" | "image",
  backgroundValue: string,
): Promise<Business | null> {
  return db.updateBusiness(id, {
    background_type: backgroundType,
    background_value: backgroundValue,
  })
}
