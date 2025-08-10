import { type NextRequest, NextResponse } from "next/server"
import { verifyUserToken, getUser } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyUserToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await getUser(payload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")

    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 })
    }

    // Get user's referrals
    const referrals = await db.getUserReferrals(user.id, parseInt(businessId))
    
    // Get user's points and badges
    const points = await db.getUserPoints(user.id, parseInt(businessId))
    const badges = await db.getUserBadges(user.id, parseInt(businessId))
    
    // Get gamification settings
    const settings = await db.getGamificationSettings(parseInt(businessId))

    return NextResponse.json({
      referrals,
      points,
      badges,
      settings,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyUserToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await getUser(payload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { businessId, referredEmail } = await request.json()

    if (!businessId || !referredEmail) {
      return NextResponse.json({ error: "Business ID and referred email are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(referredEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if user is trying to refer themselves
    if (referredEmail.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json({ error: "You cannot refer yourself" }, { status: 400 })
    }

    // Check gamification settings
    const settings = await db.getGamificationSettings(businessId)
    if (!settings.referral_enabled) {
      return NextResponse.json({ error: "Referrals are not enabled for this business" }, { status: 400 })
    }

    // Create referral
    const referral = await db.createReferral(user.id, businessId, referredEmail)

    return NextResponse.json({
      message: "Referral created successfully",
      referralCode: referral.referralCode,
      referralId: referral.id
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
