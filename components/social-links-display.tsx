"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SOCIAL_PLATFORMS } from "@/lib/social-platforms"
import type { SocialLink } from "@/lib/types"

interface SocialLinksDisplayProps {
  socialLinks: SocialLink[]
  onLinkClick?: (platform: string, url: string) => void
  layout?: 'grid' | 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
}

export function SocialLinksDisplay({ 
  socialLinks, 
  onLinkClick,
  layout = 'grid',
  size = 'md',
  showLabels = false,
  className 
}: SocialLinksDisplayProps) {
  const activeSocialLinks = socialLinks
    .filter(link => link.is_active && link.url)
    .sort((a, b) => a.display_order - b.display_order)

  if (activeSocialLinks.length === 0) {
    return null
  }

  const handleLinkClick = (link: SocialLink) => {
    // Track the click if callback provided
    if (onLinkClick) {
      onLinkClick(link.platform, link.url)
    }
    
    // Open the link
    window.open(link.url, "_blank", "noopener,noreferrer")
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-8 w-8',
          icon: 'h-3 w-3',
          text: 'text-xs'
        }
      case 'lg':
        return {
          button: 'h-14 w-14',
          icon: 'h-6 w-6',
          text: 'text-base'
        }
      default:
        return {
          button: 'h-12 w-12',
          icon: 'h-5 w-5',
          text: 'text-sm'
        }
    }
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-3 justify-center'
      case 'vertical':
        return 'flex flex-col gap-3'
      default:
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
    }
  }

  const sizeClasses = getSizeClasses()
  const layoutClasses = getLayoutClasses()

  return (
    <Card className={`bg-white/95 backdrop-blur-sm shadow-lg border-0 ${className}`}>
      <CardContent className="pt-6">
        <div className={layoutClasses}>
          {activeSocialLinks.map((link) => {
            const platform = SOCIAL_PLATFORMS[link.platform]
            const Icon = platform?.icon
            
            if (!Icon || !platform) {
              return null
            }

            return (
              <div key={link.id} className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`
                    ${sizeClasses.button} 
                    bg-white/90 hover:bg-white 
                    border-2 hover:border-opacity-80
                    transition-all duration-200 
                    hover:scale-105 hover:shadow-md
                    group relative overflow-hidden
                  `}
                  style={{ 
                    borderColor: platform.color,
                    color: platform.color
                  }}
                  onClick={() => handleLinkClick(link)}
                  title={`Visit our ${platform.name}`}
                >
                  {/* Background color on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                    style={{ backgroundColor: platform.color }}
                  />
                  
                  <Icon 
                    className={`${sizeClasses.icon} relative z-10 group-hover:scale-110 transition-transform duration-200`}
                  />
                </Button>
                
                {showLabels && (
                  <span 
                    className={`${sizeClasses.text} font-medium text-center`}
                    style={{ color: platform.color }}
                  >
                    {platform.name}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Subtle branding */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Connect with us
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for smaller spaces
export function SocialLinksCompact({ 
  socialLinks, 
  onLinkClick,
  className 
}: Pick<SocialLinksDisplayProps, 'socialLinks' | 'onLinkClick' | 'className'>) {
  const activeSocialLinks = socialLinks
    .filter(link => link.is_active && link.url)
    .sort((a, b) => a.display_order - b.display_order)

  if (activeSocialLinks.length === 0) {
    return null
  }

  const handleLinkClick = (link: SocialLink) => {
    if (onLinkClick) {
      onLinkClick(link.platform, link.url)
    }
    window.open(link.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {activeSocialLinks.map((link) => {
        const platform = SOCIAL_PLATFORMS[link.platform]
        const Icon = platform?.icon
        
        if (!Icon || !platform) {
          return null
        }

        return (
          <Button
            key={link.id}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            onClick={() => handleLinkClick(link)}
            title={`Visit our ${platform.name}`}
          >
            <Icon 
              className="h-4 w-4" 
              style={{ color: platform.color }}
            />
          </Button>
        )
      })}
    </div>
  )
}

// Floating action button style
export function SocialLinksFloating({ 
  socialLinks, 
  onLinkClick,
  className 
}: Pick<SocialLinksDisplayProps, 'socialLinks' | 'onLinkClick' | 'className'>) {
  const activeSocialLinks = socialLinks
    .filter(link => link.is_active && link.url)
    .sort((a, b) => a.display_order - b.display_order)

  if (activeSocialLinks.length === 0) {
    return null
  }

  const handleLinkClick = (link: SocialLink) => {
    if (onLinkClick) {
      onLinkClick(link.platform, link.url)
    }
    window.open(link.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className={`fixed right-4 bottom-4 flex flex-col gap-3 z-50 ${className}`}>
      {activeSocialLinks.map((link) => {
        const platform = SOCIAL_PLATFORMS[link.platform]
        const Icon = platform?.icon
        
        if (!Icon || !platform) {
          return null
        }

        return (
          <Button
            key={link.id}
            size="sm"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: platform.color,
              color: 'white'
            }}
            onClick={() => handleLinkClick(link)}
            title={`Visit our ${platform.name}`}
          >
            <Icon className="h-5 w-5" />
          </Button>
        )
      })}
    </div>
  )
}
