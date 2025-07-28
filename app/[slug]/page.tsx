"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Rating } from "@/components/ui/rating"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Instagram, Twitter, Facebook, Linkedin, Youtube, Globe, Send, CheckCircle } from "lucide-react"
import { useParams } from "next/navigation"
import type { Business, FormField, SocialLink } from "@/lib/database"

interface FeedbackPageData {
  business: Business
  formFields: FormField[]
  socialLinks: SocialLink[]
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

  useEffect(() => {
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
    } finally {
      setSubmitting(false)
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

      default:
        return null
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
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 mb-6">
          <CardHeader>
            <CardTitle>Share Your Experience</CardTitle>
            <CardDescription>Your feedback helps us improve our service</CardDescription>
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
    </div>
  )
}
