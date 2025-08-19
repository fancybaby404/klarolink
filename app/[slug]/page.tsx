"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Rating } from "@/components/ui/rating"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Instagram, Twitter, Facebook, Linkedin, Youtube, Globe, Send, CheckCircle, Eye, Share2, Copy, QrCode, Gift, Trophy } from "lucide-react"
import { useParams } from "next/navigation"
// Removed gamification imports
import { SocialLinksDisplay, SocialLinksCompact } from "@/components/social-links-display"
import { RegistrationModal } from "@/components/auth/registration-modal"
import type { Business, FormField, SocialLink } from "@/lib/database"
import QRCode from "qrcode"

interface FeedbackPageData {
  business: Business
  formFields: FormField[]
  socialLinks: SocialLink[]
  previewEnabled: boolean
}

// Function to calculate luminance and determine optimal button color
function getOptimalButtonColor(backgroundColor: string) {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return appropriate color based on background luminance
  if (luminance > 0.5) {
    // Light background - use dark button
    return {
      backgroundColor: '#333135', // header color
      color: '#FDFFFA', // background color (light)
      hoverColor: '#5F5B62' // subheader color
    }
  } else {
    // Dark background - use light button
    return {
      backgroundColor: '#CC79F0', // primary color
      color: '#FDFFFA', // background color (light)
      hoverColor: '#3E7EF7' // secondary color
    }
  }
}

export default function FeedbackPage() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<FeedbackPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [error, setError] = useState("")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  // Removed gamification state
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Check if we're in preview mode and referral code
    const urlParams = new URLSearchParams(window.location.search)
    setIsPreviewMode(urlParams.get('preview') === 'true')

    // Removed referral tracking

    // Clear any existing user authentication to ensure clean start for public feedback session
    localStorage.removeItem("userToken")
    setCurrentUser(null)

    fetchPageData()
    trackPageView()
  }, [slug])

  const fetchPageData = async () => {
    try {
      const response = await fetch(`/api/page/${slug}`)
      if (!response.ok) {
        throw new Error("Page not found")
      }
      const pageData = await response.json()
      setData(pageData)
    } catch (error) {
      console.error("Error fetching page data:", error)
    } finally {
      setLoading(false)
    }
  }

  const trackPageView = async () => {
    try {
      await fetch(`/api/analytics/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "page_view",
        }),
      })
    } catch (error) {
      console.error("Error tracking page view:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    // Validate required fields first
    const requiredFields = data?.formFields.filter((field) => field.required) || []
    for (const field of requiredFields) {
      if (!formData[field.id] || formData[field.id] === "") {
        setError(`${field.label} is required`)
        setSubmitting(false)
        return
      }
    }

    // Check if user is authenticated
    const token = localStorage.getItem("userToken")
    if (!token) {
      setSubmitting(false)
      setShowLoginDialog(true)
      return
    }

    // Submit feedback with authentication
    try {
      await submitFeedback()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")

    try {
      // Try customer login first, then fall back to user login
      let response = await fetch('/api/auth/login-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          businessSlug: slug,
        }),
      })

      let loginData
      let isCustomerLogin = false

      if (response.ok) {
        // Customer login successful
        loginData = await response.json()
        isCustomerLogin = true
        console.log('✅ Customer login successful')
      } else {
        // Fall back to user login for backward compatibility
        console.log('🔄 Customer login failed, trying user login...')
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Login failed')
        }

        loginData = await response.json()
        console.log('✅ User login successful')
      }

      // Store the token for future requests
      localStorage.setItem("userToken", loginData.token)

      // Set current user (customer or user)
      const userData = isCustomerLogin ? loginData.customer : loginData.user
      setCurrentUser(userData)

      // Now submit the feedback
      await submitFeedback()

      setShowLoginDialog(false)
      setLoginEmail("")
      setLoginPassword("")
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const submitFeedback = async () => {
    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem("userToken")
      if (!token) {
        throw new Error("Authentication required. Please log in to submit feedback.")
      }

      const response = await fetch(`/api/feedback/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))

        // If it's an authentication error, clear the token and show login modal
        if (response.status === 401) {
          localStorage.removeItem("userToken")
          setShowLoginDialog(true)
          return
        }

        throw new Error(errorData.error || "Failed to submit feedback")
      }

      const result = await response.json()
      setSubmitted(true)

      // Track form submission
      try {
        await fetch(`/api/analytics/${slug}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "form_submit",
          }),
        })
      } catch (analyticsError) {
        // Don't fail the whole submission if analytics fails
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit feedback. Please try again.")
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const renderFormField = (field: FormField) => {
    const value = formData[field.id] || ""

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case "email":
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        )

      case "rating":
        return <Rating value={value} onChange={(rating) => handleFieldChange(field.id, rating)} size="lg" />

      case "select":
        return (
          <Select value={value} onValueChange={(selectedValue) => handleFieldChange(field.id, selectedValue)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        const checkboxValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-3">
            {field.options && field.options.length > 0 ? (
              field.options.map((option, index) => {
                const optionId = `${field.id}_${index}`
                const isChecked = checkboxValues.includes(option)

                return (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <input
                      type="checkbox"
                      id={optionId}
                      checked={isChecked}
                      onChange={(e) => {
                        let newValues = [...checkboxValues]
                        if (e.target.checked) {
                          if (!newValues.includes(option)) {
                            newValues.push(option)
                          }
                        } else {
                          newValues = newValues.filter(v => v !== option)
                        }
                        handleFieldChange(field.id, newValues)
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <Label htmlFor={optionId} className="text-sm font-medium text-gray-700 cursor-pointer flex-1 leading-5">
                      {option}
                    </Label>
                  </div>
                )
              })
            ) : (
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id={field.id}
                  checked={value === true || value === "true"}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 cursor-pointer flex-1 leading-5">
                  {field.label || "Check this box"}
                </Label>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const generateQRCode = async () => {
    try {
      const currentUrl = window.location.origin + window.location.pathname
      const qrDataUrl = await QRCode.toDataURL(currentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataUrl)
      setShowQrDialog(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const copyToClipboard = async () => {
    try {
      const currentUrl = window.location.origin + window.location.pathname
      await navigator.clipboard.writeText(currentUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const shareToSocial = (platform: string) => {
    const currentUrl = encodeURIComponent(window.location.origin + window.location.pathname)
    const title = encodeURIComponent(`Share your feedback with ${data?.business.name}`)

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${currentUrl}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
      whatsapp: `https://wa.me/?text=${title}%20${currentUrl}`,
      telegram: `https://t.me/share/url?url=${currentUrl}&text=${title}`
    }

    const url = shareUrls[platform as keyof typeof shareUrls]
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-subheader">Loading...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-header mb-2">Page Not Found</h1>
          <p className="text-body">The feedback page you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const backgroundStyle =
    data.business.background_type === "image" && data.business.background_value
      ? {
          backgroundImage: `url(${data.business.background_value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: data.business.background_value }

  // Use custom button colors from business settings, or calculate optimal colors based on background
  const buttonColors = (() => {
    // If business has custom button colors, use them
    if (data.business.submit_button_color) {
      return {
        backgroundColor: data.business.submit_button_color,
        color: data.business.submit_button_text_color || '#FDFFFA',
        hoverColor: data.business.submit_button_hover_color || '#3E7EF7'
      }
    }

    // Otherwise, calculate optimal colors based on background
    if (data.business.background_type === "color" && data.business.background_value) {
      return getOptimalButtonColor(data.business.background_value)
    }

    // Default fallback colors
    return {
      backgroundColor: '#CC79F0', // default primary
      color: '#FDFFFA',
      hoverColor: '#3E7EF7'
    }
  })()

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={backgroundStyle}>
        <div className="max-w-2xl w-full space-y-6">
          {/* Success Message */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl border border-shadow">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-header mb-2">Thank You!</h1>
            <p className="text-body mb-6">
              Your feedback has been submitted successfully. We appreciate you taking the time to share your thoughts with
              us.
            </p>

            {/* Removed gamification and referral widgets */}

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-shadow text-header hover:bg-shadow hover:text-primary"
            >
              Submit Another Response
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen p-4 ${isPreviewMode ? 'preview-mode' : ''}`}
      style={backgroundStyle}
    >
      {isPreviewMode && (
        <style dangerouslySetInnerHTML={{
          __html: `
            body, html {
              overflow: hidden !important;
            }
            ::-webkit-scrollbar {
              display: none !important;
            }
            * {
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            *::-webkit-scrollbar {
              display: none !important;
            }
          `
        }} />
      )}
      <div className="max-w-md mx-auto pt-8">
        {/* Share Button - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/95 backdrop-blur-sm hover:bg-shadow border-shadow text-header hover:text-primary shadow-lg transition-all duration-200"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                {copySuccess ? "Copied!" : "Copy Link"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={generateQRCode}>
                <QrCode className="h-4 w-4 mr-2" />
                Show QR Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => shareToSocial('twitter')}>
                <Twitter className="h-4 w-4 mr-2" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareToSocial('facebook')}>
                <Facebook className="h-4 w-4 mr-2" />
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareToSocial('linkedin')}>
                <Linkedin className="h-4 w-4 mr-2" />
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareToSocial('whatsapp')}>
                <Globe className="h-4 w-4 mr-2" />
                Share on WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareToSocial('telegram')}>
                <Send className="h-4 w-4 mr-2" />
                Share on Telegram
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Business Profile */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {data.business.profile_image ? (
              <img
                src={data.business.profile_image || "/placeholder.svg"}
                alt={data.business.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                <span className="text-2xl font-bold text-header">{data.business.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{data.business.name}</h1>

          {/* Location Display */}
          {data.business.location && (
            <div className="flex items-center justify-center gap-1 mb-2">
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
              <p className="text-white/80 text-sm drop-shadow">{data.business.location}</p>
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
            </div>
          )}

          <p className="text-white/90 drop-shadow">We'd love to hear your feedback!</p>
        </div>

        {/* Feedback Form */}
        {(isPreviewMode || data.previewEnabled) && (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-shadow mb-6">
            <CardHeader>
              <CardTitle className="text-header">{data.formTitle || 'Share Your Experience'}</CardTitle>
              <CardDescription className="text-subheader">{data.formDescription || 'Your feedback helps us improve our service'}</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {data.formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderFormField(field)}
                </div>
              ))}

              <Button
                type="submit"
                className="w-full transition-all duration-200 shadow-sm border-0"
                disabled={submitting}
                style={{
                  backgroundColor: buttonColors.backgroundColor,
                  color: buttonColors.color,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = buttonColors.hoverColor
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = buttonColors.backgroundColor
                }}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        )}

        {/* Form Disabled Message */}
        {!isPreviewMode && !data.previewEnabled && (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-shadow mb-6">
            <CardContent className="pt-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-shadow rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-8 w-8 text-subheader" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-header mb-2">
                    Feedback Form Currently Unavailable
                  </h3>
                  <p className="text-sm text-body">
                    The feedback form for this business is currently disabled. Please check back later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Links - Minimalistic Horizontal Row */}
        {data.socialLinks && data.socialLinks.length > 0 && (
          <div className="flex justify-center mb-6">
            <SocialLinksCompact
              socialLinks={data.socialLinks}
              onLinkClick={(platform, url) => {
                // Track link click
                fetch(`/api/analytics/${slug}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    event_type: "link_click",
                    event_data: { platform },
                  }),
                }).catch(console.error)
              }}
              className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/70 text-sm">
          <p className="drop-shadow">Powered by KlaroLink</p>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg shadow-inner">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
            <p className="text-sm text-gray-600 text-center">
              Scan this QR code to access the feedback form
            </p>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex-1 border-shadow text-header hover:bg-shadow"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copySuccess ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                onClick={() => {
                  const link = document.createElement('a')
                  link.download = `${data?.business.name}-qr-code.png`
                  link.href = qrCodeUrl
                  link.click()
                }}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Download QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md bg-white border-shadow">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold text-header">Login Required</DialogTitle>
            <DialogDescription className="text-subheader">
              Please sign in to submit your feedback and help us improve our service
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <Alert variant="destructive" className="border-error/20 bg-error/5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <AlertDescription className="text-error">{loginError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-sm font-medium text-header">
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="mt-1 border-shadow focus:border-primary focus:ring-primary/20"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="login-password" className="text-sm font-medium text-header">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 border-shadow focus:border-primary focus:ring-primary/20"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoggingIn || !loginEmail || !loginPassword}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-11 font-medium"
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In & Submit Feedback"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLoginDialog(false)
                  setLoginError("")
                  setLoginEmail("")
                  setLoginPassword("")
                }}
                className="w-full border-shadow text-subheader hover:bg-shadow hover:text-header h-11"
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-shadow">
            <p className="text-xs text-body text-center">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setShowLoginDialog(false)
                  setShowRegistrationModal(true)
                }}
                className="text-primary hover:text-secondary underline-offset-4 hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        businessSlug={slug}
        onSuccess={(userData) => {
          // Registration modal handles auto-login and token storage
          // We just need to set the current user from the login response
          // The userData contains the user info from the login response (customer or user)
          setCurrentUser(userData)
          setShowRegistrationModal(false)
          // The user is now logged in and can submit feedback
        }}
      />
    </div>
  )
}
