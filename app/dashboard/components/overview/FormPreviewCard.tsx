"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Eye, Smartphone } from "lucide-react"
import type { DashboardData } from "../../types/dashboard"

interface FormPreviewCardProps {
  data: DashboardData
  onPreviewClick: () => void
}

export function FormPreviewCard({ data, onPreviewClick }: FormPreviewCardProps) {
  const isPublished = data.feedbackForm?.preview_enabled || false
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <CardTitle className="text-lg">Form Preview</CardTitle>
          </div>
          <Badge variant={isPublished ? "default" : "secondary"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <CardDescription>
          Preview how your feedback form appears to customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.feedbackForm ? (
          <div className="space-y-4">
            {/* Mobile Preview Mockup */}
            <div className="relative mx-auto w-48 h-80 bg-gray-900 rounded-[1.5rem] p-1 shadow-lg">
              {/* Screen */}
              <div
                className="w-full h-full rounded-[1.25rem] overflow-hidden relative"
                style={{
                  backgroundColor: data.business.background_type === "color" ? (data.business.background_value || "#CC79F0") : "#CC79F0",
                  backgroundImage: data.business.background_type === "image" && data.business.background_value ? `url(${data.business.background_value})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-black rounded-t-[1.25rem] flex items-center justify-between px-3">
                  <div className="text-white text-xs">9:41</div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1.5 border border-white rounded-sm">
                      <div className="w-2 h-0.5 bg-white rounded-sm m-0.5"></div>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="pt-4 h-full overflow-hidden p-3">
                  <div className="space-y-3">
                    {/* Business Header */}
                    <div className="text-center">
                      {data.business.profile_image ? (
                        <img
                          src={data.business.profile_image}
                          alt={data.business.name}
                          className="w-8 h-8 rounded-full object-cover mx-auto mb-2 border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                          <span className="text-xs font-bold text-white">
                            {data.business.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <h1 className="text-xs font-bold text-gray-900 truncate">
                        {data.business.name}
                      </h1>
                    </div>

                    {/* Form Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <h2 className="text-xs font-semibold text-gray-900 truncate">
                        {data.feedbackForm.title || "Share Your Experience"}
                      </h2>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {data.feedbackForm.description || "Your feedback helps us improve"}
                      </p>
                      
                      {/* Sample Fields */}
                      <div className="space-y-2">
                        {data.feedbackForm.fields?.slice(0, 2).map((field, index) => (
                          <div key={field.id} className="space-y-1">
                            <div className="text-xs font-medium text-gray-700 truncate">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            {field.type === "rating" ? (
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div key={star} className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                                ))}
                              </div>
                            ) : field.type === "textarea" ? (
                              <div className="w-full h-8 bg-white border border-gray-200 rounded text-xs"></div>
                            ) : (
                              <div className="w-full h-6 bg-white border border-gray-200 rounded text-xs"></div>
                            )}
                          </div>
                        ))}
                        
                        {/* Submit Button */}
                        <div className="pt-2">
                          <div
                            className="w-full h-6 rounded text-xs flex items-center justify-center"
                            style={{
                              backgroundColor: data.business.submit_button_color || "#CC79F0",
                              color: data.business.submit_button_text_color || "#FDFFFA"
                            }}
                          >
                            <span className="font-medium">Submit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviewClick}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Preview
              </Button>
            </div>

            {/* Form Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {data.feedbackForm.fields?.length || 0}
                </div>
                <div className="text-xs text-gray-500">Fields</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {data.stats.totalFeedback}
                </div>
                <div className="text-xs text-gray-500">Responses</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Form Created</h3>
            <p className="text-gray-500 mb-4">
              Create your first feedback form to see the preview
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard?tab=forms'}>
              Create Form
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
