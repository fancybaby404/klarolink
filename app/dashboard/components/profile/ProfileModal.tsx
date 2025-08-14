"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Link
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
]

export function ProfileModal({ isOpen, onClose, data, onDataUpdate }: ProfileModalProps) {
  const [businessName, setBusinessName] = useState(data.business.name || "")
  const [businessLocation, setBusinessLocation] = useState(data.business.location || "")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(data.socialLinks || [])
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState("business-profile")

  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => {
    setBusinessName(data.business.name || "")
    setBusinessLocation(data.business.location || "")
    setSocialLinks(data.socialLinks || [])
  }, [data])

  // Scroll spy functionality
  useEffect(() => {
    if (!isOpen) return

    const handleScroll = () => {
      const scrollPosition = contentRef.current?.scrollTop || 0
      const sections = Object.entries(sectionRefs.current)

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
    const element = sectionRefs.current[sectionId]
    if (element && contentRef.current) {
      const offsetTop = element.offsetTop - 80 // Account for header
      contentRef.current.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!businessName.trim()) {
      toast.error("Business name is required")
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
      const profileResponse = await fetch("/api/business/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: businessName.trim(),
          location: businessLocation.trim(),
        }),
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to save profile")
      }

      // Save social links
      const socialResponse = await fetch("/api/social-links", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ socialLinks }),
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
    setSocialLinks(newSocialLinks)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="h-full w-full bg-white rounded-tl-3xl overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-80 bg-gray-50 border-r border-gray-200 flex flex-col lg:h-full h-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-6">
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
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
                      onChange={(e) => setBusinessName(e.target.value)}
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
                        onChange={(e) => setBusinessLocation(e.target.value)}
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
                    Upload a profile image for your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    {data.business.profile_image ? (
                      <img
                        src={data.business.profile_image}
                        alt={data.business.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="text-center space-y-2">
                      <Button variant="outline" className="gap-2">
                        <Camera className="h-4 w-4" />
                        Upload Image
                      </Button>
                      <p className="text-xs text-gray-500">
                        Recommended: Square image, at least 200x200px
                      </p>
                    </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
