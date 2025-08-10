import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-adapter"

export async function POST(request: NextRequest) {
  try {
    const { referralCode, action, userId, businessId, platform, url } = await request.json()

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code required" }, { status: 400 })
    }

    // Get referral by code
    const referral = await db.getReferralByCode(referralCode)
    if (!referral) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
    }

    // Check if referral is still valid
    if (referral.status !== 'pending') {
      return NextResponse.json({ error: "Referral already completed or expired" }, { status: 400 })
    }

    if (new Date(referral.expires_at) < new Date()) {
      return NextResponse.json({ error: "Referral has expired" }, { status: 400 })
    }

    switch (action) {
      case 'click':
        // Track referral click
        await db.query(`
          INSERT INTO referral_clicks (referral_id, ip_address, user_agent)
          VALUES ($1, $2, $3)
        `, [
          referral.id,
          request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          request.headers.get('user-agent') || 'unknown'
        ])
        break

      case 'complete':
        // Complete referral when referred user submits feedback
        if (userId) {
          await db.completeReferral(referralCode, userId)
        }
        break

      case 'share':
        // Track social sharing
        if (platform && url) {
          await db.trackSocialShare(userId, businessId, platform, url, referralCode)
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ 
      message: "Action tracked successfully",
      referral: {
        id: referral.id,
        status: referral.status,
        businessId: referral.business_id
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
