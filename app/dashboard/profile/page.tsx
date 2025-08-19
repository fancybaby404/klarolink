"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  User,
  Camera,
  MapPin,
  Palette,
  MousePointer,
  Save,
  Loader2,
  Upload,
  X,
  RefreshCw,
  Eye,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react"
import { SimpleNotificationBell } from "@/components/admin/SimpleNotificationBell"
import type { Business, FormField } from "@/lib/types"

interface ProfileData {
  business: Business
  formFields: FormField[]
  formTitle: string
  formDescription: string
}

interface ValidationError {
  field: string
  message: string
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [activeSection, setActiveSection] = useState("business-profile")
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

  // Form fields
  const [businessName, setBusinessName] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [location, setLocation] = useState("")
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color")
  const [backgroundValue, setBackgroundValue] = useState("#CC79F0")
  const [backgroundImage, setBackgroundImage] = useState("")
  const [submitButtonColor, setSubmitButtonColor] = useState("#CC79F0")
  const [submitButtonTextColor, setSubmitButtonTextColor] = useState("#FDFFFA")
  const [submitButtonHoverColor, setSubmitButtonHoverColor] = useState("#3E7EF7")
  const [uploadingImage, setUploadingImage] = useState(false)

  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => {
    fetchProfileData()
  }, [])

  // Scroll detection for active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const container = contentRef.current
      const scrollTop = container.scrollTop
      const sections = Object.keys(sectionRefs.current)

      let currentSection = sections[0]

      for (const sectionId of sections) {
        const element = sectionRefs.current[sectionId]
        if (element) {
          const elementTop = element.offsetTop - container.offsetTop
          if (scrollTop >= elementTop - 100) {
            currentSection = sectionId
          }
        }
      }

      if (currentSection !== activeSection) {
        setActiveSection(currentSection)
      }
    }

    const container = contentRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [activeSection])

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result)
        
        // Populate form fields
        setBusinessName(result.business.name)
        setProfileImage(result.business.profile_image || "")
        setLocation(result.business.location || "")
        setBackgroundType(result.business.background_type)
        setBackgroundValue(result.business.background_value)
        setSubmitButtonColor(result.business.submit_button_color || "#CC79F0")
        setSubmitButtonTextColor(result.business.submit_button_text_color || "#FDFFFA")
        setSubmitButtonHoverColor(result.business.submit_button_hover_color || "#3E7EF7")
      } else {
        setError("Failed to load profile data")
        if (response.status === 401) {
          router.push("/login")
        }
      }
    } catch (error) {
      setError("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = sectionRefs.current[sectionId]
    if (element && contentRef.current) {
      const container = contentRef.current
      const elementTop = element.offsetTop - container.offsetTop
      container.scrollTo({
        top: elementTop - 20,
        behavior: 'smooth'
      })
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image must be smaller than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem("token")
      const response = await fetch('/api/upload/background', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setBackgroundImage(result.url)
        setBackgroundValue(result.url)
        toast.success('Background image uploaded successfully')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const resetButtonColors = () => {
    setSubmitButtonColor("#CC79F0")
    setSubmitButtonTextColor("#FDFFFA")
    setSubmitButtonHoverColor("#3E7EF7")
    toast.success('Button colors reset to defaults')
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError("")
    setValidationErrors([])

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      // Update business profile
      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: businessName.trim(),
          profile_image: profileImage.trim() || null,
          location: location.trim() || null,
        }),
      })

      // Update background
      const backgroundResponse = await fetch("/api/profile/background", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          background_type: backgroundType,
          background_value: backgroundValue,
        }),
      })

      // Update button customization
      const buttonResponse = await fetch("/api/profile/button-customization", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submit_button_color: submitButtonColor,
          submit_button_text_color: submitButtonTextColor,
          submit_button_hover_color: submitButtonHoverColor,
        }),
      })

      if (profileResponse.ok && backgroundResponse.ok && buttonResponse.ok) {
        toast.success("Profile updated successfully!")
        // Update local data
        if (data) {
          setData({
            ...data,
            business: {
              ...data.business,
              name: businessName.trim(),
              profile_image: profileImage.trim() || null,
              location: location.trim() || null,
              background_type: backgroundType,
              background_value: backgroundValue,
              submit_button_color: submitButtonColor,
              submit_button_text_color: submitButtonTextColor,
              submit_button_hover_color: submitButtonHoverColor,
            }
          })
        }
      } else {
        setError("Failed to update profile")
        toast.error("Failed to update profile")
      }
    } catch (error) {
      setError("Failed to update profile")
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-header mb-2">Failed to load profile</h2>
          <p className="text-subheader mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const navigationItems = [
    {
      id: "business-profile",
      label: "Business Profile",
      icon: User,
      description: "Basic business information"
    },
    {
      id: "profile-image",
      label: "Profile Image",
      icon: Camera,
      description: "Upload and manage profile image"
    },
    {
      id: "form-background",
      label: "Form Background",
      icon: Palette,
      description: "Customize form background"
    },
    {
      id: "button-customization",
      label: "Button Styling",
      icon: MousePointer,
      description: "Customize form buttons"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-shadow sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-header hover:bg-shadow"
            >
              ← Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-header">Profile Customization</h1>
              <p className="text-sm text-subheader">Customize your business profile and feedback form appearance</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SimpleNotificationBell userId="dashboard" />
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar Navigation */}
        <div className="w-80 bg-white border-r border-shadow flex-shrink-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-header mb-4">Customization</h2>
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-shadow text-header'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-subheader">{item.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Middle Content Area */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={contentRef}
            className="h-full overflow-y-auto p-6 space-y-8"
          >
            {/* Business Profile Section */}
            <section
              ref={(el) => sectionRefs.current["business-profile"] = el}
              className="scroll-mt-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Business Profile</CardTitle>
                      <CardDescription>
                        Update your basic business information
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="business-name" className="text-sm font-medium text-header">
                      Business Name *
                    </Label>
                    <Input
                      id="business-name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Enter your business name"
                      className="border-shadow focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-header flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      Location (Optional)
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State or Country"
                      className="border-shadow focus:border-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Profile Image Section */}
            <section
              ref={(el) => sectionRefs.current["profile-image"] = el}
              className="scroll-mt-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Camera className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Profile Image</CardTitle>
                      <CardDescription>
                        Upload or set a URL for your business profile image
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profile-image" className="text-sm font-medium text-header">
                      Profile Image URL (Optional)
                    </Label>
                    <Input
                      id="profile-image"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="border-shadow focus:border-primary"
                    />
                  </div>

                  {profileImage && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-header">Preview</Label>
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-shadow">
                        <img
                          src={profileImage}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Form Background Section */}
            <section
              ref={(el) => sectionRefs.current["form-background"] = el}
              className="scroll-mt-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Form Background</CardTitle>
                      <CardDescription>
                        Customize the background of your feedback form
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-header">Background Type</Label>
                    <RadioGroup
                      value={backgroundType}
                      onValueChange={(value: "color" | "image") => setBackgroundType(value)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="color" id="color" />
                        <Label htmlFor="color" className="cursor-pointer">Solid Color</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="image" />
                        <Label htmlFor="image" className="cursor-pointer">Background Image</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {backgroundType === "color" && (
                    <div className="space-y-2">
                      <Label htmlFor="background-color" className="text-sm font-medium text-header">
                        Background Color
                      </Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          id="background-color"
                          type="color"
                          value={backgroundValue}
                          onChange={(e) => setBackgroundValue(e.target.value)}
                          className="w-16 h-10 p-1 border-shadow"
                        />
                        <Input
                          value={backgroundValue}
                          onChange={(e) => setBackgroundValue(e.target.value)}
                          placeholder="#CC79F0"
                          className="flex-1 border-shadow focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {backgroundType === "image" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-header">
                          Upload Background Image
                        </Label>
                        <div className="border-2 border-dashed border-shadow rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file)
                            }}
                            className="hidden"
                            id="background-upload"
                          />
                          <label
                            htmlFor="background-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            {uploadingImage ? (
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : (
                              <Upload className="h-8 w-8 text-subheader" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-header">
                                {uploadingImage ? "Uploading..." : "Click to upload"}
                              </p>
                              <p className="text-xs text-subheader">
                                JPG, PNG, WebP up to 5MB
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {backgroundImage && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-header">Current Background</Label>
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-shadow">
                            <img
                              src={backgroundImage}
                              alt="Background preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setBackgroundImage("")
                                setBackgroundValue("#CC79F0")
                                setBackgroundType("color")
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Button Customization Section */}
            <section
              ref={(el) => sectionRefs.current["button-customization"] = el}
              className="scroll-mt-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MousePointer className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Button Customization</CardTitle>
                      <CardDescription>
                        Customize the appearance of your form submit button
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="button-bg-color" className="text-sm font-medium text-header">
                        Button Background Color
                      </Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          id="button-bg-color"
                          type="color"
                          value={submitButtonColor}
                          onChange={(e) => setSubmitButtonColor(e.target.value)}
                          className="w-16 h-10 p-1 border-shadow"
                        />
                        <Input
                          value={submitButtonColor}
                          onChange={(e) => setSubmitButtonColor(e.target.value)}
                          placeholder="#CC79F0"
                          className="flex-1 border-shadow focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="button-text-color" className="text-sm font-medium text-header">
                        Button Text Color
                      </Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          id="button-text-color"
                          type="color"
                          value={submitButtonTextColor}
                          onChange={(e) => setSubmitButtonTextColor(e.target.value)}
                          className="w-16 h-10 p-1 border-shadow"
                        />
                        <Input
                          value={submitButtonTextColor}
                          onChange={(e) => setSubmitButtonTextColor(e.target.value)}
                          placeholder="#FDFFFA"
                          className="flex-1 border-shadow focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="button-hover-color" className="text-sm font-medium text-header">
                      Button Hover Color
                    </Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        id="button-hover-color"
                        type="color"
                        value={submitButtonHoverColor}
                        onChange={(e) => setSubmitButtonHoverColor(e.target.value)}
                        className="w-16 h-10 p-1 border-shadow"
                      />
                      <Input
                        value={submitButtonHoverColor}
                        onChange={(e) => setSubmitButtonHoverColor(e.target.value)}
                        placeholder="#3E7EF7"
                        className="flex-1 border-shadow focus:border-primary"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-header">Reset to Defaults</p>
                      <p className="text-xs text-subheader">Restore original button styling</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={resetButtonColors}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-96 bg-white border-l border-shadow flex-shrink-0">
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-header">Live Preview</h3>
              </div>
              <div className="flex gap-1 bg-shadow rounded-lg p-1">
                <Button
                  size="sm"
                  variant={previewDevice === "desktop" ? "default" : "ghost"}
                  onClick={() => setPreviewDevice("desktop")}
                  className="h-7 w-7 p-0"
                >
                  <Monitor className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={previewDevice === "tablet" ? "default" : "ghost"}
                  onClick={() => setPreviewDevice("tablet")}
                  className="h-7 w-7 p-0"
                >
                  <Tablet className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={previewDevice === "mobile" ? "default" : "ghost"}
                  onClick={() => setPreviewDevice("mobile")}
                  className="h-7 w-7 p-0"
                >
                  <Smartphone className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div
                className={`mx-auto transition-all duration-300 ${
                  previewDevice === "desktop" ? "w-full" :
                  previewDevice === "tablet" ? "w-80" : "w-64"
                }`}
              >
                <div
                  className="rounded-lg overflow-hidden shadow-lg border border-shadow"
                  style={{
                    background: backgroundType === "color"
                      ? backgroundValue
                      : backgroundImage
                        ? `url(${backgroundImage})`
                        : backgroundValue,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "400px"
                  }}
                >
                  <div className="p-6">
                    {/* Business Header */}
                    <div className="text-center mb-8">
                      <div className="relative inline-block">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={businessName || "Business"}
                            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=96&width=96"
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                            <span className="text-2xl font-bold text-header">
                              {(businessName || "B").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                        {businessName || "Your Business"}
                      </h1>

                      {/* Location Display */}
                      {location && (
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                          <p className="text-white/80 text-sm drop-shadow">{location}</p>
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                        </div>
                      )}

                      <p className="text-white/90 drop-shadow">We'd love to hear your feedback!</p>
                    </div>

                    {/* Form Preview */}
                    <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-shadow">
                      <CardHeader>
                        <CardTitle className="text-header">
                          {data?.formTitle || 'Share Your Experience'}
                        </CardTitle>
                        <CardDescription className="text-subheader">
                          {data?.formDescription || 'Your feedback helps us improve our service'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Sample Form Fields */}
                        {data?.formFields?.slice(0, 3).map((field, index) => (
                          <div key={field.id} className="space-y-2">
                            <Label className="text-sm font-medium text-header">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {field.type === "rating" ? (
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-6 h-6 rounded-full border-2 border-shadow bg-background"
                                  />
                                ))}
                              </div>
                            ) : field.type === "textarea" ? (
                              <div className="w-full h-20 rounded-md border border-shadow bg-background" />
                            ) : field.type === "select" ? (
                              <div className="w-full h-10 rounded-md border border-shadow bg-background" />
                            ) : (
                              <div className="w-full h-10 rounded-md border border-shadow bg-background" />
                            )}
                          </div>
                        )) || (
                          // Default form fields if no custom fields
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-header">
                                Overall Rating *
                              </Label>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-6 h-6 rounded-full border-2 border-shadow bg-background"
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-header">
                                Your Feedback
                              </Label>
                              <div className="w-full h-20 rounded-md border border-shadow bg-background" />
                            </div>
                          </>
                        )}

                        {/* Submit Button Preview */}
                        <Button
                          className="w-full transition-all duration-200 shadow-sm border-0"
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
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-shadow/50 rounded-lg">
              <p className="text-xs text-subheader text-center">
                This preview shows how your feedback form will appear to customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
