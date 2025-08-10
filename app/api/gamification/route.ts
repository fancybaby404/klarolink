import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const businessId = payload.businessId

    switch (action) {
      case 'leaderboard':
        const type = searchParams.get("type") as 'points' | 'referrals' || 'points'
        const limit = parseInt(searchParams.get("limit") || "10")
        const leaderboard = await db.getLeaderboard(businessId, type, limit)
        
        return NextResponse.json({ leaderboard })

      case 'settings':
        const settings = await db.getGamificationSettings(businessId)
        return NextResponse.json({ settings })

      default:
        // Get general gamification stats
        const stats = await db.getGamificationSettings(businessId)
        const pointsLeaderboard = await db.getLeaderboard(businessId, 'points', 5)
        const referralsLeaderboard = await db.getLeaderboard(businessId, 'referrals', 5)

        return NextResponse.json({
          settings: stats,
          leaderboards: {
            points: pointsLeaderboard,
            referrals: referralsLeaderboard
          }
        })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const businessId = payload.businessId
    const settings = await request.json()

    // Validate settings
    if (typeof settings.points_per_feedback !== 'number' || settings.points_per_feedback < 0) {
      return NextResponse.json({ error: "Invalid points per feedback" }, { status: 400 })
    }

    if (typeof settings.points_per_referral !== 'number' || settings.points_per_referral < 0) {
      return NextResponse.json({ error: "Invalid points per referral" }, { status: 400 })
    }

    if (typeof settings.welcome_bonus_points !== 'number' || settings.welcome_bonus_points < 0) {
      return NextResponse.json({ error: "Invalid welcome bonus points" }, { status: 400 })
    }

    await db.updateGamificationSettings(businessId, settings)

    return NextResponse.json({ 
      message: "Gamification settings updated successfully",
      settings 
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
