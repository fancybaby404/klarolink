"use client"

import { MessageSquare, Users, Star, TrendingUp } from "lucide-react"
import { StatsCard } from "./StatsCard"
import type { DashboardStats } from "../../types/dashboard"

interface StatsGridProps {
  stats: DashboardStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Feedback"
        value={stats.totalFeedback}
        icon={MessageSquare}
        iconColor="text-blue-600"
        bgColor="bg-blue-50"
        borderColor="border-blue-200"
      />
      
      <StatsCard
        title="Page Views"
        value={stats.pageViews}
        icon={Users}
        iconColor="text-green-600"
        bgColor="bg-green-50"
        borderColor="border-green-200"
      />
      
      <StatsCard
        title="Average Rating"
        value={stats.averageRating > 0 ? `${stats.averageRating}/5` : "N/A"}
        icon={Star}
        iconColor="text-yellow-600"
        bgColor="bg-yellow-50"
        borderColor="border-yellow-200"
      />
      
      <StatsCard
        title="Completion Rate"
        value={`${stats.completionRate}%`}
        icon={TrendingUp}
        iconColor="text-purple-600"
        bgColor="bg-purple-50"
        borderColor="border-purple-200"
      />
    </div>
  )
}
