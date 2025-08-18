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
  isPublished?: boolean
}

export function PhoneMockupPreview({
  data,
  backgroundType = "color",
  backgroundValue = "#6366f1",
  backgroundImage = "",
  submitButtonColor = "#CC79F0",
  submitButtonTextColor = "#FDFFFA",
  submitButtonHoverColor = "#3E7EF7",
  isPublished = false
}: PhoneMockupPreviewProps) {
  return (
    <div className="relative">
      {/* Publish Status Indicator */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isPublished
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          {isPublished ? '🟢 Published' : '⚫ Draft'}
        </div>
      </div>

      {/* Phone Frame */}
      <div className="w-64 h-[500px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
        {/* Screen */}
        <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-black rounded-t-[2rem] flex items-center justify-between px-4">
            <div className="text-white text-xs font-medium">9:41</div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3 h-1 bg-white rounded-sm m-0.5"></div>
              </div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Form Content */}
          <div
            className="pt-6 h-full overflow-y-auto p-4"
            style={{
              backgroundColor: backgroundType === "color" ? (backgroundValue || "#6366f1") : undefined,
              backgroundImage: backgroundType === "image" && (backgroundImage || backgroundValue) ? `url(${backgroundImage || backgroundValue})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="p-4 min-h-full flex flex-col">
              {/* Business Header Preview */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {data.business.profile_image ? (
                    <img
                      src={data.business.profile_image}
                      alt={data.business.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-lg">
                      <span className="text-lg font-bold text-header">{data.business.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <h1 className="text-lg font-bold text-white mb-2 drop-shadow-lg">
                  {data.business.name}
                </h1>

                {/* Location Display */}
                {data.business.location && (
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                    <p className="text-white/80 text-xs drop-shadow">{data.business.location}</p>
                    <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                  </div>
                )}

                <p className="text-white/90 text-xs drop-shadow">We'd love to hear your feedback!</p>
              </div>

              {/* Form Preview */}
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-shadow flex-1">
                <CardHeader>
                  <CardTitle className="text-header text-sm">
                    {data.feedbackForm?.title || "Share Your Experience"}
                  </CardTitle>
                  <CardDescription className="text-subheader text-xs">
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
