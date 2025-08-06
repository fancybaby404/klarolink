"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, ExternalLink, AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  SOCIAL_PLATFORMS, 
  PLATFORM_CATEGORIES, 
  validateSocialUrl, 
  getSocialPlatformsByCategory,
  type SocialPlatform 
} from "@/lib/social-platforms"
import type { SocialLink } from "@/lib/types"

interface SocialLinksManagerProps {
  socialLinks: SocialLink[]
  onSocialLinksChange: (links: SocialLink[]) => void
  className?: string
}

interface ValidationError {
  linkId: number
  message: string
}

export function SocialLinksManager({ socialLinks, onSocialLinksChange, className }: SocialLinksManagerProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [newLinkPlatform, setNewLinkPlatform] = useState<string>('')
  const [newLinkUrl, setNewLinkUrl] = useState<string>('')
  const [newLinkError, setNewLinkError] = useState<string>('')

  const validateAllLinks = () => {
    const errors: ValidationError[] = []
    
    socialLinks.forEach(link => {
      const error = validateSocialUrl(link.platform, link.url)
      if (error) {
        errors.push({ linkId: link.id, message: error })
      }
    })
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const updateSocialLink = (id: number, updates: Partial<SocialLink>) => {
    const updatedLinks = socialLinks.map(link =>
      link.id === id ? { ...link, ...updates } : link
    )
    onSocialLinksChange(updatedLinks)

    // Validate the updated link
    if (updates.url || updates.platform) {
      const updatedLink = updatedLinks.find(l => l.id === id)
      if (updatedLink) {
        const error = validateSocialUrl(updatedLink.platform, updatedLink.url)
        setValidationErrors(prev => 
          prev.filter(e => e.linkId !== id).concat(
            error ? [{ linkId: id, message: error }] : []
          )
        )
      }
    }
  }

  const removeSocialLink = (id: number) => {
    const updatedLinks = socialLinks.filter(link => link.id !== id)
    onSocialLinksChange(updatedLinks)
    setValidationErrors(prev => prev.filter(e => e.linkId !== id))
  }

  const addSocialLink = () => {
    if (!newLinkPlatform || !newLinkUrl) {
      setNewLinkError('Please select a platform and enter a URL')
      return
    }

    const error = validateSocialUrl(newLinkPlatform, newLinkUrl)
    if (error) {
      setNewLinkError(error)
      return
    }

    // Check if platform already exists
    const existingPlatform = socialLinks.find(link => link.platform === newLinkPlatform)
    if (existingPlatform) {
      setNewLinkError('This platform is already added')
      return
    }

    const newLink: SocialLink = {
      id: Date.now(),
      business_id: socialLinks[0]?.business_id || 0,
      platform: newLinkPlatform,
      url: newLinkUrl,
      display_order: socialLinks.length,
      is_active: true,
      created_at: new Date().toISOString()
    }

    onSocialLinksChange([...socialLinks, newLink])
    setNewLinkPlatform('')
    setNewLinkUrl('')
    setNewLinkError('')
  }

  const getValidationError = (linkId: number) => {
    return validationErrors.find(e => e.linkId === linkId)?.message
  }

  const platformCategories = getSocialPlatformsByCategory()
  const availablePlatforms = Object.values(SOCIAL_PLATFORMS).filter(
    platform => !socialLinks.some(link => link.platform === platform.id)
  )

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Social Links & Contact Information
            <Badge variant="secondary" className="text-xs">
              {socialLinks.filter(l => l.is_active).length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Social Links */}
          {socialLinks.length > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Your Links</Label>
              {socialLinks.map((link) => {
                const platform = SOCIAL_PLATFORMS[link.platform]
                const Icon = platform?.icon
                const error = getValidationError(link.id)
                
                return (
                  <Card key={link.id} className={`p-4 ${error ? 'border-red-200 bg-red-50' : ''}`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {Icon && (
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: platform.color }}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{platform?.name || link.platform}</div>
                            <div className="text-xs text-gray-500">{platform?.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={link.is_active}
                            onCheckedChange={(checked) => updateSocialLink(link.id, { is_active: checked })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocialLink(link.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={link.url}
                            onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                            placeholder={platform?.placeholder || 'Enter URL...'}
                            className={error ? 'border-red-300 focus:border-red-500' : ''}
                          />
                          {link.url && !error && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(link.url, '_blank')}
                              className="shrink-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {error && (
                          <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">{error}</AlertDescription>
                          </Alert>
                        )}
                        
                        {!error && link.url && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <Check className="h-3 w-3" />
                            Valid URL
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Add New Social Link */}
          {availablePlatforms.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label className="text-sm font-medium">Add New Link</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select value={newLinkPlatform} onValueChange={setNewLinkPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platformCategories.map(category => (
                        <div key={category.id}>
                          <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {category.name}
                          </div>
                          {category.platforms
                            .filter(platform => availablePlatforms.some(ap => ap.id === platform.id))
                            .map(platform => {
                              const Icon = platform.icon
                              return (
                                <SelectItem key={platform.id} value={platform.id}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" style={{ color: platform.color }} />
                                    {platform.name}
                                  </div>
                                </SelectItem>
                              )
                            })}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder={newLinkPlatform ? SOCIAL_PLATFORMS[newLinkPlatform]?.placeholder : "Enter URL..."}
                    value={newLinkUrl}
                    onChange={(e) => {
                      setNewLinkUrl(e.target.value)
                      setNewLinkError('')
                    }}
                    className="md:col-span-2"
                  />
                </div>
                
                {newLinkError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{newLinkError}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={addSocialLink}
                  disabled={!newLinkPlatform || !newLinkUrl}
                  className="w-full md:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </>
          )}

          {availablePlatforms.length === 0 && socialLinks.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've added all available platforms. Remove a link to add a different one.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
