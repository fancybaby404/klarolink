"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import type { DashboardStats } from "../../types/dashboard"

interface PerformanceSummaryProps {
  stats: DashboardStats
}

export function PerformanceSummary({ stats }: PerformanceSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          This Week's Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">New Submissions</span>
            <span className="font-semibold">{stats.totalFeedback}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Average Rating</span>
            <span className="font-semibold">
              {stats.averageRating > 0 ? `${stats.averageRating}/5` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Response Rate</span>
            <span className="font-semibold">{stats.completionRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
