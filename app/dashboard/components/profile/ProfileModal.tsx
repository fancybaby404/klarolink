"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { SocialLinksManager } from "@/components/social-links-manager"
import {
  ArrowLeft,
  User,
  MapPin,
  Camera,
  Save,
  ExternalLink,
  Loader2,
  Link,
  Palette,
  MousePointer,
  Eye,
  RefreshCw,
  X,
  AlertCircle,
  Star,
  Undo2,
  Redo2
} from "lucide-react"
import type { DashboardData } from "../../types/dashboard"
import type { SocialLink } from "@/lib/types"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  data: DashboardData
  onDataUpdate: (newData: DashboardData) => void
}

interface ProfileSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const profileSections: ProfileSection[] = [
  { id: "business-profile", label: "Business Profile", icon: User },
  { id: "profile-image", label: "Profile Image", icon: Camera },
  { id: "social-links", label: "Social Media Links", icon: Link },
  { id: "form-background", label: "Form Background", icon: Palette },
  { id: "button-styling", label: "Button Styling", icon: MousePointer },
]

export function ProfileModal({ isOpen, onClose, data, onDataUpdate }: ProfileModalProps) {
  const [businessName, setBusinessName] = useState(data.business.name || "")
  const [businessLocation, setBusinessLocation] = useState(data.business.location || "")
  const [profileImageUrl, setProfileImageUrl] = useState(data.business.profile_image || "")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(data.socialLinks || [])
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState("business-profile")

  // Undo/Redo state management
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])

  // New customization state
  const [backgroundType, setBackgroundType] = useState<"color" | "image">(data.business.background_type || "color")
  const [backgroundValue, setBackgroundValue] = useState(data.business.background_value || "#6366f1")
  const [backgroundImage, setBackgroundImage] = useState<string>(data.business.background_type === "image" ? data.business.background_value : "")
  const [submitButtonColor, setSubmitButtonColor] = useState(data.business.submit_button_color || "#CC79F0")
  const [submitButtonTextColor, setSubmitButtonTextColor] = useState(data.business.submit_button_text_color || "#FDFFFA")
  const [submitButtonHoverColor, setSubmitButtonHoverColor] = useState(data.business.submit_button_hover_color || "#3E7EF7")
  const [colorError, setColorError] = useState("")

  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  // Save current state for undo functionality
  const saveStateForUndo = () => {
    const currentState = {
      businessName,
      businessLocation,
      profileImageUrl,
      socialLinks,
      backgroundType,
      backgroundValue,
      backgroundImage,
      submitButtonColor,
      submitButtonTextColor,
      submitButtonHoverColor
    }
    setUndoStack(prev => [...prev, currentState])
    setRedoStack([]) // Clear redo stack when new action is performed
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return

    const currentState = {
      businessName,
      businessLocation,
      profileImageUrl,
      socialLinks,
      backgroundType,
      backgroundValue,
      backgroundImage,
      submitButtonColor,
      submitButtonTextColor,
      submitButtonHoverColor
    }

    const previousState = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, currentState])
    setUndoStack(prev => prev.slice(0, -1))

    // Restore previous state
    setBusinessName(previousState.businessName)
    setBusinessLocation(previousState.businessLocation)
    setProfileImageUrl(previousState.profileImageUrl)
    setSocialLinks(previousState.socialLinks)
    setBackgroundType(previousState.backgroundType)
    setBackgroundValue(previousState.backgroundValue)
    setBackgroundImage(previousState.backgroundImage)
    setSubmitButtonColor(previousState.submitButtonColor)
    setSubmitButtonTextColor(previousState.submitButtonTextColor)
    setSubmitButtonHoverColor(previousState.submitButtonHoverColor)
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return

    const currentState = {
      businessName,
      businessLocation,
      profileImageUrl,
      socialLinks,
      backgroundType,
      backgroundValue,
      backgroundImage,
      submitButtonColor,
      submitButtonTextColor,
      submitButtonHoverColor
    }

    const nextState = redoStack[redoStack.length - 1]
    setUndoStack(prev => [...prev, currentState])
    setRedoStack(prev => prev.slice(0, -1))

    // Restore next state
    setBusinessName(nextState.businessName)
    setBusinessLocation(nextState.businessLocation)
    setProfileImageUrl(nextState.profileImageUrl)
    setSocialLinks(nextState.socialLinks)
    setBackgroundType(nextState.backgroundType)
    setBackgroundValue(nextState.backgroundValue)
    setBackgroundImage(nextState.backgroundImage)
    setSubmitButtonColor(nextState.submitButtonColor)
    setSubmitButtonTextColor(nextState.submitButtonTextColor)
    setSubmitButtonHoverColor(nextState.submitButtonHoverColor)
  }

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const scrollTop = contentRef.current.scrollTop
      const sections = Object.entries(sectionRefs.current)

      // Find the section that's currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const [sectionId, element] = sections[i]
        if (element && element.offsetTop - 100 <= scrollTop) {
          setActiveSection(sectionId)
          break
        }
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll)
      return () => contentElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    setBusinessName(data.business.name || "")
    setBusinessLocation(data.business.location || "")
    setProfileImageUrl(data.business.profile_image || "")
    setSocialLinks(data.socialLinks || [])
    setBackgroundType(data.business.background_type || "color")
    setBackgroundValue(data.business.background_value || "#6366f1")
    setBackgroundImage(data.business.background_type === "image" ? data.business.background_value : "")
    setSubmitButtonColor(data.business.submit_button_color || "#CC79F0")
    setSubmitButtonTextColor(data.business.submit_button_text_color || "#FDFFFA")
    setSubmitButtonHoverColor(data.business.submit_button_hover_color || "#3E7EF7")

    // Clear undo/redo stacks when data changes
    setUndoStack([])
    setRedoStack([])
  }, [data])

  // Scroll spy functionality
  useEffect(() => {
    if (!isOpen) return

    const handleScroll = () => {
      if (!contentRef.current) return

      const scrollPosition = contentRef.current.scrollTop
      const scrollHeight = contentRef.current.scrollHeight
      const clientHeight = contentRef.current.clientHeight
      const sections = Object.entries(sectionRefs.current)

      // If we're at the bottom of the page, highlight the last section
      if (scrollPosition + clientHeight >= scrollHeight - 10) {
        const lastSection = sections[sections.length - 1]
        if (lastSection) {
          setActiveSection(lastSection[0])
          return
        }
      }

      // Otherwise, find the section that's currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const [sectionId, element] = sections[i]
        if (element) {
          const offsetTop = element.offsetTop - 100 // Account for header
          if (scrollPosition >= offsetTop) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll)
      return () => contentElement.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen])

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId) // Immediately set active section
    const element = sectionRefs.current[sectionId]
    if (element && contentRef.current) {
      const offsetTop = element.offsetTop - 80 // Account for header
      contentRef.current.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }





  // Utility functions
  const validateHexColor = (color: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexRegex.test(color)
  }

  const handleColorChange = (value: string, setter: (value: string) => void) => {
    setter(value)
    if (value && !validateHexColor(value)) {
      setColorError("Please enter a valid hex color (e.g., #FF0000)")
    } else {
      setColorError("")
    }
    // Save state for undo
    saveStateForUndo()
  }



  const resetButtonColors = () => {
    saveStateForUndo()
    setSubmitButtonColor("#CC79F0")
    setSubmitButtonTextColor("#FDFFFA")
    setSubmitButtonHoverColor("#3E7EF7")
    toast.success("Button colors reset to defaults")
  }



  // Undo functionality


  const handleSaveProfile = async () => {
    if (!businessName.trim()) {
      toast.error("Business name is required")
      return
    }

    // Validate colors
    if (backgroundType === "color" && !validateHexColor(backgroundValue)) {
      toast.error("Please enter a valid background color")
      return
    }

    if (!validateHexColor(submitButtonColor) || !validateHexColor(submitButtonTextColor) || !validateHexColor(submitButtonHoverColor)) {
      toast.error("Please enter valid button colors")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      // Save business profile
      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: businessName.trim(),
          location: businessLocation.trim(),
          profile_image: profileImageUrl.trim(),
        }),
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to save profile")
      }

      // Save background customization
      const backgroundResponse = await fetch("/api/profile/background", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          background_type: backgroundType,
          background_value: backgroundType === "color" ? backgroundValue : backgroundImage,
        }),
      })

      if (!backgroundResponse.ok) {
        throw new Error("Failed to save background settings")
      }

      // Save button customization
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

      if (!buttonResponse.ok) {
        throw new Error("Failed to save button customization")
      }

      // Save social links
      const socialResponse = await fetch("/api/profile/social", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ social_links: socialLinks }),
      })

      if (!socialResponse.ok) {
        throw new Error("Failed to save social links")
      }

      // Update the data
      const updatedData = {
        ...data,
        business: {
          ...data.business,
          name: businessName.trim(),
          location: businessLocation.trim(),
          profile_image: profileImageUrl.trim(),
          background_type: backgroundType,
          background_value: backgroundType === "color" ? backgroundValue : backgroundImage,
          submit_button_color: submitButtonColor,
          submit_button_text_color: submitButtonTextColor,
          submit_button_hover_color: submitButtonHoverColor,
        },
        socialLinks,
      }
      onDataUpdate(updatedData)

      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSocialLinksChange = (newSocialLinks: SocialLink[]) => {
    saveStateForUndo()
    setSocialLinks(newSocialLinks)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="h-full w-full max-w-7xl mx-auto bg-white rounded-3xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Profile edit</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar Navigation */}
          <div className="w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Navigation Links */}
            <nav className="flex-1 p-6 pt-8">
              <div className="space-y-2 lg:block flex flex-wrap gap-2">
                {profileSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium lg:inline hidden">{section.label}</span>
                      <span className="font-medium lg:hidden text-xs">{section.label}</span>
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => window.open(`/${data.business.slug}`, '_blank')}
                className="w-full gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Preview Page
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="w-2/4 flex flex-col min-h-0">
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto p-8 space-y-12"
              style={{ scrollBehavior: 'smooth' }}
            >
            {/* Business Profile Section */}
            <section
              ref={(el) => (sectionRefs.current["business-profile"] = el)}
              id="business-profile"
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
              </div>
              
              <Card>
                <CardHeader>
                  <CardDescription>
                    Update your business information and details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="business-name">Business Name *</Label>
                    <Input
                      id="business-name"
                      value={businessName}
                      onChange={(e) => {
                        saveStateForUndo()
                        setBusinessName(e.target.value)
                      }}
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="business-location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="business-location"
                        value={businessLocation}
                        onChange={(e) => {
                          saveStateForUndo()
                          setBusinessLocation(e.target.value)
                        }}
                        placeholder="City, Country"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving || !businessName.trim()}
                    className="w-full gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Profile Image Section */}
            <section
              ref={(el) => (sectionRefs.current["profile-image"] = el)}
              id="profile-image"
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Camera className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Image</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardDescription>
                    Set a profile image URL for your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={businessName}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-image-url">Profile Image URL</Label>
                    <Input
                      id="profile-image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={profileImageUrl}
                      onChange={(e) => {
                        saveStateForUndo()
                        setProfileImageUrl(e.target.value)
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      Enter a URL to an image. Recommended: Square image, at least 200x200px
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Social Media Links Section */}
            <section
              ref={(el) => (sectionRefs.current["social-links"] = el)}
              id="social-links"
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Link className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Social Media Links</h2>
              </div>

              <SocialLinksManager
                socialLinks={socialLinks}
                onSocialLinksChange={handleSocialLinksChange}
              />
            </section>

            {/* Form Background Section */}
            <section
              ref={(el) => (sectionRefs.current["form-background"] = el)}
              id="form-background"
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Palette className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Form Background</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardDescription>
                    Customize the background appearance of your feedback form
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Background Type</Label>
                    <RadioGroup
                      value={backgroundType}
                      onValueChange={(value: "color" | "image") => {
                        saveStateForUndo()
                        setBackgroundType(value)
                      }}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="color" id="color" />
                        <Label htmlFor="color">Solid Color</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="image" />
                        <Label htmlFor="image">Background Image</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {backgroundType === "color" && (
                    <div className="space-y-4">
                      <Label htmlFor="background-color">Background Color</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          id="background-color"
                          value={backgroundValue}
                          onChange={(e) => handleColorChange(e.target.value, setBackgroundValue)}
                          className="w-16 h-8 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={backgroundValue}
                          onChange={(e) => handleColorChange(e.target.value, setBackgroundValue)}
                          placeholder="#6366f1"
                          className="flex-1"
                        />
                      </div>
                      {colorError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {colorError}
                        </div>
                      )}
                    </div>
                  )}

                  {backgroundType === "image" && (
                    <div className="space-y-4">
                      <Label htmlFor="background-image-url">Background Image URL</Label>
                      <Input
                        id="background-image-url"
                        type="url"
                        value={backgroundImage}
                        onChange={(e) => {
                          saveStateForUndo()
                          setBackgroundImage(e.target.value)
                          setBackgroundValue(e.target.value)
                        }}
                        placeholder="https://example.com/background.jpg"
                      />
                      {backgroundImage && (
                        <div className="space-y-2">
                          <img
                            src={backgroundImage}
                            alt="Background preview"
                            className="max-h-32 w-full object-cover rounded-lg border"
                            onError={() => {
                              // Handle broken image URLs
                              setBackgroundImage("")
                              setBackgroundValue("")
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBackgroundImage("")
                              setBackgroundValue("")
                            }}
                            className="w-full"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove Image
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Enter a URL to an image. Supported formats: JPG, PNG, WebP
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Button Styling Section */}
            <section
              ref={(el) => (sectionRefs.current["button-styling"] = el)}
              id="button-styling"
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <MousePointer className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Button Customization</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardDescription>
                    Customize the appearance of your form submit button
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="button-bg-color">Button Background Color</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          id="button-bg-color"
                          value={submitButtonColor}
                          onChange={(e) => handleColorChange(e.target.value, setSubmitButtonColor)}
                          className="w-16 h-8 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={submitButtonColor}
                          onChange={(e) => handleColorChange(e.target.value, setSubmitButtonColor)}
                          placeholder="#CC79F0"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="button-text-color">Button Text Color</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          id="button-text-color"
                          value={submitButtonTextColor}
                          onChange={(e) => handleColorChange(e.target.value, setSubmitButtonTextColor)}
                          className="w-16 h-8 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={submitButtonTextColor}
                          onChange={(e) => handleColorChange(e.target.value, setSubmitButtonTextColor)}
                          placeholder="#FDFFFA"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="button-hover-color">Button Hover Color</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          id="button-hover-color"
                          value={submitButtonHoverColor}
                          onChange={(e) => handleColorChange(e.target.value, setSubmitButtonHoverColor)}
                          className="w-16 h-8 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={submitButtonHoverColor}
                          onChange={(e) => handleColorChange(e.target.value, setSubmitButtonHoverColor)}
                          placeholder="#3E7EF7"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={resetButtonColors}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="w-1/4 bg-gray-50 border-l border-gray-200 flex flex-col min-h-0">
            <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center min-h-0">
              {/* Phone Mockup Container */}
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-64 h-[500px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  {/* Screen */}
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-black rounded-t-[2rem] flex items-center justify-center">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Form Content */}
                    <div
                      className="pt-6 h-full overflow-y-auto"
                      style={{
                        backgroundColor: backgroundType === "color" ? backgroundValue : "#6366f1",
                        backgroundImage: backgroundType === "image" && (backgroundImage || backgroundValue) ? `url(${backgroundImage || backgroundValue})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="p-4 min-h-full flex flex-col">
                        {/* Business Header Preview */}
                        <div className="text-center mb-4">
                          {profileImageUrl && (
                            <img
                              src={profileImageUrl}
                              alt={businessName}
                              className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white shadow-lg"
                            />
                          )}
                          <h1 className="text-lg font-bold text-white drop-shadow-lg">
                            {businessName || data.business.name}
                          </h1>
                          {businessLocation && (
                            <div className="flex items-center justify-center gap-1 text-white/90 text-xs mt-1">
                              <MapPin className="h-3 w-3" />
                              {businessLocation}
                            </div>
                          )}
                        </div>

                        {/* Form Preview */}
                        <Card className="bg-white/95 backdrop-blur-sm shadow-xl flex-1">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">
                              {data.feedbackForm?.title || "Share Your Experience"}
                            </CardTitle>
                            <CardDescription className="text-xs">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
