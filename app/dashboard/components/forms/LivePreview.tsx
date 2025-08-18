"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye, X } from "lucide-react"
import type { DashboardData } from "../../types/dashboard"

interface LivePreviewProps {
  businessSlug: string
  previewEnabled: boolean
  previewRefreshKey: number
  isCollapsed: boolean
  onToggleCollapse: (collapsed: boolean) => void
  onEnablePreview: () => void
  data: DashboardData
}

export function LivePreview({
  businessSlug,
  previewEnabled,
  previewRefreshKey,
  isCollapsed,
  onToggleCollapse,
  onEnablePreview,
  data
}: LivePreviewProps) {
  // Get the current origin to handle dynamic ports
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const previewUrl = `${currentOrigin}/skinbloom-2`

  const handlePreviewForm = () => {
    window.open(previewUrl, '_blank')
  }

  if (isCollapsed) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed right-4 lg:right-6 top-1/2 transform -translate-y-1/2 z-10 shadow-lg"
        onClick={() => onToggleCollapse(false)}
      >
        <Eye className="h-4 w-4 lg:mr-2" />
        <span className="hidden lg:inline">Show Preview</span>
      </Button>
    )
  }

  return (
    <div className="fixed top-6 right-6 w-80 h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border-4 border-gray-900 overflow-hidden z-10">
      {previewEnabled ? (
        <div className="h-full flex flex-col">
          {/* Header with status bar simulation */}
          <div className="bg-black h-6 rounded-t-2xl flex items-center justify-center">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Live iframe container */}
          <div className="flex-1 relative overflow-hidden">
            {/* Actual page iframe */}
            <iframe
              key={previewRefreshKey}
              src={previewUrl}
              className="w-full h-full border-0"
              style={{
                transform: 'scale(1)',
                transformOrigin: 'top left',
                overflowX: 'hidden'
              }}
              sandbox="allow-same-origin allow-scripts"
              loading="lazy"
              title="Live Preview"
            />

            {/* Interaction blocker overlay - blocks clicks and form submissions but allows scrolling */}
            <div
              className="absolute inset-0 z-10"
              style={{
                pointerEvents: 'auto',
                background: 'transparent'
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          </div>

          {/* Footer with Open in New Tab button */}
          <div className="p-3 bg-white border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handlePreviewForm}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
              <Eye className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Live Preview
              </h4>
              <p className="text-sm text-gray-600">
                Your form preview will appear here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
