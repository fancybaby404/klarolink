"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, Trophy, Gift, Zap } from "lucide-react"

interface GamificationDisplayProps {
  userId?: number
  businessId: number
  compact?: boolean
  showAnimation?: boolean
}

export function GamificationDisplay({ userId, businessId, compact = false, showAnimation = true }: GamificationDisplayProps) {
  const [userStats, setUserStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pointsAnimation, setPointsAnimation] = useState(0)

  useEffect(() => {
    if (userId) {
      fetchUserStats()
    } else {
      setLoading(false)
    }
  }, [userId, businessId])

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/referrals?businessId=${businessId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
        
        // Animate points if enabled
        if (showAnimation && data.points?.balance > 0) {
          animatePoints(data.points.balance)
        }
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  const animatePoints = (targetPoints: number) => {
    const duration = 1000 // 1 second
    const steps = 30
    const increment = targetPoints / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetPoints) {
        setPointsAnimation(targetPoints)
        clearInterval(timer)
      } else {
        setPointsAnimation(Math.floor(current))
      }
    }, duration / steps)
  }

  const getNextBadgeProgress = () => {
    if (!userStats) return null

    const currentBadges = userStats.badges?.length || 0
    const totalPoints = userStats.points?.totalEarned || 0
    const referrals = userStats.referrals?.filter((r: any) => r.status === 'completed').length || 0

    // Define badge thresholds
    const badgeThresholds = [
      { name: "First Feedback", requirement: "Submit 1 feedback", progress: Math.min(100, (totalPoints > 0 ? 100 : 0)) },
      { name: "Feedback Champion", requirement: "Submit 5 feedbacks", progress: Math.min(100, (totalPoints / 50) * 100) },
      { name: "Super Referrer", requirement: "3 successful referrals", progress: Math.min(100, (referrals / 3) * 100) },
      { name: "Points Collector", requirement: "Earn 100 points", progress: Math.min(100, (totalPoints / 100) * 100) },
    ]

    // Find next badge to earn
    const nextBadge = badgeThresholds.find(badge => badge.progress < 100)
    return nextBadge
  }

  if (loading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className={compact ? "p-0" : "p-6"}>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userStats) {
    return null
  }

  const nextBadge = getNextBadgeProgress()

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <span className="font-semibold text-primary">
            {showAnimation ? pointsAnimation : userStats.points?.balance || 0}
          </span>
          <span className="text-sm text-gray-600">points</span>
        </div>
        
        {userStats.badges && userStats.badges.length > 0 && (
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-secondary" />
            <span className="font-semibold text-secondary">{userStats.badges.length}</span>
            <span className="text-sm text-gray-600">badges</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Your Progress
        </CardTitle>
        <CardDescription>
          Keep engaging to earn more points and unlock badges!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {showAnimation ? pointsAnimation : userStats.points?.balance || 0}
          </div>
          <div className="text-sm text-gray-600">Points Available</div>
          <div className="text-xs text-gray-500 mt-1">
            Total Earned: {userStats.points?.totalEarned || 0}
          </div>
        </div>

        {/* Badges */}
        {userStats.badges && userStats.badges.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Your Badges</div>
            <div className="grid grid-cols-2 gap-2">
              {userStats.badges.map((badge: any) => (
                <div key={badge.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-lg">{badge.badge_icon}</span>
                  <div>
                    <div className="text-xs font-medium">{badge.badge_name}</div>
                    <div className="text-xs text-gray-500">{badge.badge_description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Badge Progress */}
        {nextBadge && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Next Badge</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{nextBadge.name}</span>
                <span>{Math.round(nextBadge.progress)}%</span>
              </div>
              <Progress value={nextBadge.progress} className="h-2" />
              <div className="text-xs text-gray-500">{nextBadge.requirement}</div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-secondary">
              {userStats.referrals?.filter((r: any) => r.status === 'completed').length || 0}
            </div>
            <div className="text-xs text-gray-600">Successful Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {Math.floor((userStats.points?.totalEarned || 0) / (userStats.settings?.points_per_feedback || 10))}
            </div>
            <div className="text-xs text-gray-600">Feedback Submitted</div>
          </div>
        </div>

        {/* Earning Opportunities */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Earn More Points</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• Submit feedback: +{userStats.settings?.points_per_feedback || 10} points</div>
            <div>• Successful referral: +{userStats.settings?.points_per_referral || 50} points</div>
            <div>• Welcome bonus: +{userStats.settings?.welcome_bonus_points || 25} points</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
