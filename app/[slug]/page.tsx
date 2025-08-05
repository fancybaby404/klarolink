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
import { Instagram, Twitter, Facebook, Linkedin, Youtube, Globe, Send, CheckCircle, Eye, Share2, Copy, QrCode } from "lucide-react"
import { useParams } from "next/navigation"
import type { Business, FormField, SocialLink } from "@/lib/database"
import QRCode from "qrcode"

interface FeedbackPageData {
  business: Business
  formFields: FormField[]
  socialLinks: SocialLink[]
  previewEnabled: boolean
}

const socialIcons = {
  website: Globe,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Globe,
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

  useEffect(() => {
    // Check if we're in preview mode
    const urlParams = new URLSearchParams(window.location.search)
    setIsPreviewMode(urlParams.get('preview') === 'true')

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

    // Validate required fields
    const requiredFields = data?.formFields.filter((field) => field.required) || []
    for (const field of requiredFields) {
      if (!formData[field.id] || formData[field.id] === "") {
        setError(`${field.label} is required`)
        setSubmitting(false)
        return
      }
    }

    // Show login dialog instead of submitting directly
    setSubmitting(false)
    setShowLoginDialog(true)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")

    try {
      const response = await fetch('/api/auth/login', {
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

      const { user } = await response.json()

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
      const response = await fetch(`/api/feedback/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      setSubmitted(true)

      // Track form submission
      await fetch(`/api/analytics/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "form_submit",
        }),
      })
    } catch (error) {
      setError("Failed to submit feedback. Please try again.")
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">The feedback page you're looking for doesn't exist.</p>
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={backgroundStyle}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate you taking the time to share your thoughts with
            us.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Submit Another Response
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4" style={backgroundStyle}>
      <div className="max-w-md mx-auto pt-8">
        {/* Share Button - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
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
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                <span className="text-2xl font-bold text-gray-700">{data.business.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{data.business.name}</h1>
          <p className="text-white/90 drop-shadow">We'd love to hear your feedback!</p>
        </div>

        {/* Feedback Form */}
        {(isPreviewMode || data.previewEnabled) && (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 mb-6">
            <CardHeader>
              <CardTitle>Share Your Experience</CardTitle>
              <CardDescription>Your feedback helps us improve our service</CardDescription>
              {isPreviewMode && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-2">
                  <p className="text-sm text-blue-800 font-medium">
                    🔍 Preview Mode - This form is being previewed from the dashboard
                  </p>
                </div>
              )}
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

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 mb-6">
            <CardContent className="pt-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Feedback Form Currently Unavailable
                  </h3>
                  <p className="text-sm text-gray-600">
                    The feedback form for this business is currently disabled. Please check back later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Links */}
        {data.socialLinks.length > 0 && (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-3">
                {data.socialLinks
                  .filter((link) => link.is_active)
                  .map((link, index) => {
                    const Icon = socialIcons[link.platform as keyof typeof socialIcons] || Globe
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="flex items-center gap-2 h-12 bg-transparent"
                        onClick={() => {
                          window.open(link.url, "_blank")
                          // Track link click
                          fetch(`/api/analytics/${slug}`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              event_type: "link_click",
                              event_data: { platform: link.platform },
                            }),
                          }).catch(console.error)
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{link.platform}</span>
                      </Button>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/70 text-sm">
          <p>Powered by KlaroLink</p>
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
                className="flex-1"
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
                className="flex-1"
              >
                Download QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please login to submit your feedback
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLoginDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="flex-1"
              >
                {isLoggingIn ? "Logging in..." : "Login & Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
