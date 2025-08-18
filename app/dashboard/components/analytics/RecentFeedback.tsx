"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Star, Copy } from "lucide-react"
import type { DashboardStats } from "../../types/dashboard"
import { extractDataWithFallback } from "@/lib/field-categorization"

interface RecentFeedbackProps {
  stats: DashboardStats
}

export function RecentFeedback({ stats }: RecentFeedbackProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <CardTitle className="text-lg">Recent Feedback</CardTitle>
        </div>
        <CardDescription>
          Latest feedback submissions from your customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.recentFeedback.length > 0 ? (
          <div className="space-y-4">
            {stats.recentFeedback.map((feedback) => {
              // Extract rating and feedback text using enhanced field categorization
              const extractedData = extractDataWithFallback(feedback.submission_data || {})
              const rating = feedback.rating || extractedData.rating || 0
              const feedbackText = feedback.feedback || extractedData.feedbackText || "No feedback text provided"

              return (
                <div key={feedback.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(feedback.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{feedbackText}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
            <p className="text-gray-500 mb-4">
              Share your feedback link to start collecting customer feedback
            </p>
            <Button variant="outline" className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Feedback Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
