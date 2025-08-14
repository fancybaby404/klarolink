"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, Eye } from "lucide-react"

interface FeedbackLinkCardProps {
  businessSlug: string
  onPreviewClick: () => void
}

export function FeedbackLinkCard({ businessSlug, onPreviewClick }: FeedbackLinkCardProps) {
  const feedbackUrl = `https://localhost:3000/${businessSlug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl)
      // Could add toast notification here
    } catch (error) {
      // Error handling - could add toast notification here
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          <CardTitle className="text-lg">Your Feedback Link</CardTitle>
        </div>
        <CardDescription>
          Share the link with your customers to collect feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <code className="flex-1 text-sm text-gray-700">
            {feedbackUrl}
          </code>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onPreviewClick}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
