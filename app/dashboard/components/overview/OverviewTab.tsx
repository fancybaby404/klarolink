"use client"

import { StatsGrid } from "../analytics/StatsGrid"
import { PerformanceSummary } from "../analytics/PerformanceSummary"
import { RecentFeedback } from "../analytics/RecentFeedback"
import { FeedbackLinkCard } from "../shared/FeedbackLinkCard"
import { QuickActions } from "../shared/QuickActions"
import type { DashboardData, DashboardTab } from "../../types/dashboard"

interface OverviewTabProps {
  data: DashboardData
  onTabChange: (tab: DashboardTab) => void
  onPreviewClick: () => void
}

export function OverviewTab({ data, onTabChange, onPreviewClick }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <StatsGrid stats={data.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Performance and Recent Feedback */}
        <div className="lg:col-span-2 space-y-6">
          <PerformanceSummary stats={data.stats} />
          <RecentFeedback stats={data.stats} />
        </div>

        {/* Right Column - Quick Actions and Feedback Link */}
        <div className="space-y-6">
          <FeedbackLinkCard
            businessSlug={data.business.slug}
            onPreviewClick={onPreviewClick}
          />
          <QuickActions
            businessSlug={data.business.slug}
            onTabChange={onTabChange}
          />
        </div>
      </div>
    </div>
  )
}
