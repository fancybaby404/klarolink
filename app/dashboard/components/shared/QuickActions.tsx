"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, FileText, BarChart, ExternalLink } from "lucide-react"
import type { DashboardTab } from "../../types/dashboard"

interface QuickActionsProps {
  businessSlug: string
  onTabChange: (tab: DashboardTab) => void
}

export function QuickActions({ businessSlug, onTabChange }: QuickActionsProps) {
  const handlePreviewPage = () => {
    window.open(`/${businessSlug}`, '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => onTabChange("forms")}
          >
            <FileText className="h-4 w-4" />
            Customize Form
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => onTabChange("insights")}
          >
            <BarChart className="h-4 w-4" />
            View Analytics
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handlePreviewPage}
          >
            <ExternalLink className="h-4 w-4" />
            Preview Page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
