"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MapPin, Star } from "lucide-react"
import type { DashboardData } from "../../types/dashboard"

interface PhoneMockupPreviewProps {
  data: DashboardData
  backgroundType?: "color" | "image"
  backgroundValue?: string
  backgroundImage?: string
  submitButtonColor?: string
  submitButtonTextColor?: string
  submitButtonHoverColor?: string
}

export function PhoneMockupPreview({
  data,
  backgroundType = "color",
  backgroundValue = "#6366f1",
  backgroundImage = "",
  submitButtonColor = "#CC79F0",
  submitButtonTextColor = "#FDFFFA",
  submitButtonHoverColor = "#3E7EF7"
}: PhoneMockupPreviewProps) {
  return (
    <div className="relative">
      {/* Phone Frame */}
      <div className="w-64 h-[500px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
        {/* Screen */}
        <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-black rounded-t-[2rem] flex items-center justify-center">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Form Content */}
          <div
            className="pt-6 h-full overflow-y-auto"
            style={{
              backgroundColor: backgroundType === "color" ? backgroundValue : "#6366f1",
              backgroundImage: backgroundType === "image" && (backgroundImage || backgroundValue) ? `url(${backgroundImage || backgroundValue})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="p-4 min-h-full flex flex-col">
              {/* Business Header Preview */}
              <div className="text-center mb-4">
                {data.business.profile_image && (
                  <img
                    src={data.business.profile_image}
                    alt={data.business.name}
                    className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white shadow-lg"
                  />
                )}
                <h1 className="text-lg font-bold text-white drop-shadow-lg">
                  {data.business.name}
                </h1>
                {data.business.location && (
                  <div className="flex items-center justify-center gap-1 text-white/90 text-xs mt-1">
                    <MapPin className="h-3 w-3" />
                    {data.business.location}
                  </div>
                )}
              </div>

              {/* Form Preview */}
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {data.feedbackForm?.title || "Share Your Experience"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {data.feedbackForm?.description || "Your feedback helps us improve our service"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Sample Form Fields */}
                  {data.feedbackForm?.fields?.slice(0, 2).map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <Label className="text-xs font-medium">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.type === "rating" ? (
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-gray-300" />
                          ))}
                        </div>
                      ) : field.type === "textarea" ? (
                        <div className="h-12 bg-gray-100 rounded border p-1 text-xs text-gray-500">
                          {field.placeholder || "Enter your feedback..."}
                        </div>
                      ) : field.type === "select" ? (
                        <div className="h-6 bg-gray-100 rounded border p-1 text-xs text-gray-500">
                          Select an option...
                        </div>
                      ) : (
                        <div className="h-6 bg-gray-100 rounded border p-1 text-xs text-gray-500">
                          {field.placeholder || "Enter text..."}
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Overall Rating *</Label>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-gray-300" />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Your Feedback</Label>
                        <div className="h-12 bg-gray-100 rounded border p-1 text-xs text-gray-500">
                          Tell us what you think...
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button Preview */}
                  <button
                    className="w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200"
                    style={{
                      backgroundColor: submitButtonColor,
                      color: submitButtonTextColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = submitButtonHoverColor
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = submitButtonColor
                    }}
                  >
                    Submit Feedback
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
