"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar"
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  BarChart3,
  FileText,
  BarChart,
  UserCheck,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Camera,
  ExternalLink
} from "lucide-react"
import type { Business } from "@/lib/types"

interface ProfileData {
  business: Business
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
  const [success, setSuccess] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  // Form fields
  const [businessName, setBusinessName] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [location, setLocation] = useState("")
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color")
  const [backgroundValue, setBackgroundValue] = useState("#CC79F0")
  const [submitButtonColor, setSubmitButtonColor] = useState("#CC79F0")
  const [submitButtonTextColor, setSubmitButtonTextColor] = useState("#FDFFFA")
  const [submitButtonHoverColor, setSubmitButtonHoverColor] = useState("#3E7EF7")

  const router = useRouter()

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/dashboard", {
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
      console.error("Profile fetch error:", error)
      setError("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: ValidationError[] = []

    if (!businessName.trim()) {
      errors.push({ field: "businessName", message: "Business name is required" })
    }

    if (profileImage.trim() && !isValidUrl(profileImage.trim())) {
      errors.push({ field: "profileImage", message: "Please enter a valid URL for the profile image" })
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const clearFieldError = (field: string) => {
    setValidationErrors(prev => prev.filter(error => error.field !== field))
  }

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message
  }

  const handleSaveProfile = async () => {
    if (!data?.business.id) return

    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

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
        setSuccess("Profile updated successfully!")
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
        const profileError = profileResponse.ok ? null : await profileResponse.text()
        const backgroundError = backgroundResponse.ok ? null : await backgroundResponse.text()
        const buttonError = buttonResponse.ok ? null : await buttonResponse.text()
        const errorMessage = profileError || backgroundError || buttonError || "Failed to update profile"
        setError(errorMessage)
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Profile save error:", error)
      setError("Failed to update profile. Please try again.")
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg font-medium text-header">Loading profile...</p>
          <p className="text-sm text-subheader">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-header mb-2">Failed to load profile data</h1>
          <p className="text-body mb-6">We couldn't load your profile information. Please try again.</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} variant="outline" className="border-shadow text-header hover:bg-shadow">
              Try Again
            </Button>
            <Button onClick={() => router.push("/dashboard")} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 px-3 py-3">
              {data.business.profile_image ? (
                <img
                  src={data.business.profile_image}
                  alt={data.business.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    {data.business.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-left w-full">
                  <h2 className="text-sm font-semibold text-header truncate">
                    {data.business.name}
                  </h2>
                  <p className="text-xs text-subheader truncate">Editing Profile</p>
                </div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => router.push("/dashboard")}
                  className="w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 text-header hover:bg-shadow hover:text-primary"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => router.push("/dashboard")}
                  className="w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 text-header hover:bg-shadow hover:text-primary"
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Forms</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => router.push("/dashboard")}
                  className="w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 text-header hover:bg-shadow hover:text-primary"
                >
                  <BarChart className="h-4 w-4" />
                  <span className="font-medium">Insights</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => router.push("/dashboard")}
                  className="w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 text-header hover:bg-shadow hover:text-primary"
                >
                  <UserCheck className="h-4 w-4" />
                  <span className="font-medium">Audience</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 bg-primary text-primary-foreground shadow-sm"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="bg-white border-b border-shadow sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-header hover:bg-shadow" />
                <div>
                  <h1 className="text-xl font-semibold text-header">Business Profile</h1>
                  <p className="text-sm text-subheader">Manage your business information and appearance</p>
                </div>
              </div>
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

          <div className="p-6">
            {/* Alerts */}
            {error && (
              <Alert className="mb-6 border-error/20 bg-error/10">
                <AlertCircle className="h-4 w-4 text-error" />
                <AlertDescription className="text-error">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-success/20 bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Business Information */}
              <Card className="border border-shadow shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg text-header">Business Information</CardTitle>
                  </div>
                  <CardDescription className="text-subheader">
                    Update your business name, profile image, and location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="business-name" className="text-sm font-medium text-header">
                      Business Name *
                    </Label>
                    <Input
                      id="business-name"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value)
                        clearFieldError("businessName")
                      }}
                      placeholder="Enter your business name"
                      className={getFieldError("businessName") ? "border-error focus:border-error" : "border-shadow focus:border-primary"}
                    />
                    {getFieldError("businessName") && (
                      <p className="text-sm text-error flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError("businessName")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-image" className="text-sm font-medium text-header flex items-center gap-2">
                      <Camera className="h-4 w-4 text-secondary" />
                      Profile Image URL (Optional)
                    </Label>
                    <Input
                      id="profile-image"
                      value={profileImage}
                      onChange={(e) => {
                        setProfileImage(e.target.value)
                        clearFieldError("profileImage")
                      }}
                      placeholder="https://example.com/image.jpg"
                      className={getFieldError("profileImage") ? "border-error focus:border-error" : "border-shadow focus:border-primary"}
                    />
                    {getFieldError("profileImage") && (
                      <p className="text-sm text-error flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError("profileImage")}
                      </p>
                    )}
                    <p className="text-xs text-subheader">
                      Enter a URL to an image or leave blank for default avatar
                    </p>
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
                      placeholder="e.g., San Francisco, CA or 123 Main St, City, State"
                      className="border-shadow focus:border-primary"
                    />
                    <p className="text-xs text-subheader">
                      Enter your business location - city, state, or full address
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Preview */}
              <Card className="border border-shadow shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-success" />
                    <CardTitle className="text-lg text-header">Profile Preview</CardTitle>
                  </div>
                  <CardDescription className="text-subheader">
                    See how your profile will appear to customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Profile Card Preview */}
                    <div className="p-6 border-2 border-dashed border-shadow rounded-lg bg-shadow">
                      <div className="flex items-center gap-4">
                        {profileImage ? (
                          <div className="relative">
                            <img
                              src={profileImage}
                              alt="Profile preview"
                              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            {!profileImage && (
                              <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary flex items-center justify-center border-4 border-white shadow-lg">
                                <span className="text-primary-foreground font-bold text-2xl">
                                  {businessName.charAt(0).toUpperCase() || 'B'}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-primary-foreground font-bold text-2xl">
                              {businessName.charAt(0).toUpperCase() || 'B'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-header">
                            {businessName || 'Business Name'}
                          </h3>
                          <p className="text-sm text-subheader font-medium">@{data.business.slug}</p>
                          {location && (
                            <p className="text-sm text-body flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-secondary" />
                              {location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-2xl font-bold text-primary">Live</p>
                        <p className="text-xs text-subheader">Profile Status</p>
                      </div>
                      <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
                        <p className="text-2xl font-bold text-success">Ready</p>
                        <p className="text-xs text-subheader">For Customers</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Background Settings - Full Width */}
            <Card className="border border-shadow shadow-sm bg-white mt-8">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-primary"></div>
                  <CardTitle className="text-lg text-header">Background Settings</CardTitle>
                </div>
                <CardDescription className="text-subheader">
                  Customize how your feedback page looks to customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-header">Background Type</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={backgroundType === "color" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBackgroundType("color")}
                      className={`flex-1 sm:flex-none ${
                        backgroundType === "color"
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-shadow text-header hover:bg-shadow"
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                      Solid Color
                    </Button>
                    <Button
                      variant={backgroundType === "image" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBackgroundType("image")}
                      className={`flex-1 sm:flex-none ${
                        backgroundType === "image"
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-shadow text-header hover:bg-shadow"
                      }`}
                    >
                      <Camera className="w-3 h-3 mr-2" />
                      Background Image
                    </Button>
                  </div>
                </div>

                {backgroundType === "color" ? (
                  <div className="space-y-3">
                    <Label htmlFor="background-color" className="text-sm font-medium text-header">
                      Background Color
                    </Label>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Input
                          id="background-color"
                          type="color"
                          value={backgroundValue}
                          onChange={(e) => setBackgroundValue(e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer border-shadow"
                        />
                      </div>
                      <Input
                        value={backgroundValue}
                        onChange={(e) => setBackgroundValue(e.target.value)}
                        placeholder="#CC79F0"
                        className="flex-1 font-mono text-sm border-shadow focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {['#CC79F0', '#3E7EF7', '#00B146', '#CF2C3A', '#FFA300', '#1979FE'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setBackgroundValue(color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            backgroundValue === color ? 'border-primary scale-110' : 'border-shadow hover:border-primary/50'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="background-image" className="text-sm font-medium text-header">
                      Background Image URL
                    </Label>
                    <Input
                      id="background-image"
                      value={backgroundValue}
                      onChange={(e) => setBackgroundValue(e.target.value)}
                      placeholder="https://example.com/background.jpg"
                      className="font-mono text-sm border-shadow focus:border-primary"
                    />
                    <p className="text-xs text-subheader">
                      Enter a URL to a background image for your feedback page
                    </p>
                  </div>
                )}

                {/* Background Preview */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-header">Background Preview</Label>
                  <div
                    className="h-40 rounded-lg border-2 border-dashed border-shadow flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: backgroundType === "color"
                        ? backgroundValue
                        : backgroundValue ? `url(${backgroundValue}) center/cover` : '#f3f4f6'
                    }}
                  >
                    <div className="text-center">
                      <p className="text-white font-semibold text-lg drop-shadow-lg mb-1">
                        Your Feedback Page
                      </p>
                      <p className="text-white/80 text-sm drop-shadow">
                        This is how your background will look
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Button Customization */}
            <Card className="border border-shadow shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">B</span>
                  </div>
                  <CardTitle className="text-lg text-header">Submit Button Customization</CardTitle>
                </div>
                <CardDescription className="text-subheader">
                  Customize the appearance of the submit feedback button on your feedback page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="button-color" className="text-sm font-medium text-header">
                      Button Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="button-color"
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
                      Text Color
                    </Label>
                    <div className="flex gap-2">
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

                  <div className="space-y-2">
                    <Label htmlFor="button-hover-color" className="text-sm font-medium text-header">
                      Hover Color
                    </Label>
                    <div className="flex gap-2">
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
                </div>

                {/* Button Preview */}
                <div className="p-6 border-2 border-dashed border-shadow rounded-lg bg-shadow">
                  <div className="text-center">
                    <p className="text-sm text-subheader mb-4">Button Preview:</p>
                    <Button
                      className="transition-all duration-200 shadow-sm border-0 pointer-events-none"
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-shadow">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="gap-2 border-shadow text-header hover:bg-shadow"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/${data.business.slug}`, '_blank')}
                  className="gap-2 border-shadow text-header hover:bg-shadow"
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview Page
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving || !businessName.trim() || validationErrors.length > 0}
                  className="gap-2 min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90"
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
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
