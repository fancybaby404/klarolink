"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye, X } from "lucide-react"

interface LivePreviewProps {
  businessSlug: string
  previewEnabled: boolean
  previewRefreshKey: number
  isCollapsed: boolean
  onToggleCollapse: (collapsed: boolean) => void
  onEnablePreview: () => void
}

export function LivePreview({
  businessSlug,
  previewEnabled,
  previewRefreshKey,
  isCollapsed,
  onToggleCollapse,
  onEnablePreview
}: LivePreviewProps) {
  const handlePreviewForm = () => {
    window.open(`/${businessSlug}`, '_blank')
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
    <div className="sticky top-6">
      <div className="bg-transparent">

        {previewEnabled ? (
          <div>
            {/* iPhone-style Phone Mockup */}
            <div className="mx-auto" style={{ width: '280px' }}>
              {/* Phone Frame */}
              <div className="relative bg-black rounded-[2.5rem] p-2 shadow-xl" style={{ height: '580px' }}>
                {/* Screen */}
                <div className="bg-white rounded-[2rem] overflow-hidden relative h-full">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-10"></div>

                  {/* Status Bar */}
                  <div className="h-10 bg-white flex items-center justify-between px-4 pt-7 text-black text-xs font-medium">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      </div>
                      <div className="w-5 h-2.5 border border-black rounded-sm">
                        <div className="w-4 h-1.5 bg-green-500 rounded-sm m-0.5"></div>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="relative overflow-hidden" style={{ height: 'calc(100% - 50px)' }}>
                    <iframe
                      src={`/${businessSlug}?preview=true`}
                      className="absolute top-0 left-0 border-0"
                      title="Form Preview"
                      key={`preview-${previewRefreshKey}`}
                      style={{
                        width: '276px',
                        height: '520px',
                        transform: 'scale(1)',
                        transformOrigin: 'top left',
                        overflow: 'hidden'
                      }}
                      scrolling="no"
                    />
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-black rounded-full opacity-60"></div>
                </div>
              </div>

              {/* Power Button */}
              <div className="absolute right-[-3px] top-28 w-1.5 h-16 bg-gray-800 rounded-r-lg"></div>
            </div>

            <div className="mt-4">
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
          <div className="p-6 text-center">
            <div className="space-y-4">
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
    </div>
  )
}
