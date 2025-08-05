"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import type { Business } from "@/lib/types"

interface ProfileData {
  business: Business
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Form fields
  const [businessName, setBusinessName] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color")
  const [backgroundValue, setBackgroundValue] = useState("#6366f1")
  
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
        setBackgroundType(result.business.background_type)
        setBackgroundValue(result.business.background_value)
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

  const handleSaveProfile = async () => {
    if (!data?.business.id) return
    
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

      if (profileResponse.ok && backgroundResponse.ok) {
        setSuccess("Profile updated successfully!")
        // Refresh data
        fetchProfileData()
      } else {
        setError("Failed to update profile")
      }
    } catch (error) {
      console.error("Profile save error:", error)
      setError("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile data</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
            <p className="text-gray-600">Manage your business information and appearance</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business name and profile image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <Label htmlFor="profile-image">Profile Image URL (Optional)</Label>
                <Input
                  id="profile-image"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL to an image or leave blank for default avatar
                </p>
              </div>

              {/* Profile Image Preview */}
              <div>
                <Label>Preview</Label>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {businessName.charAt(0).toUpperCase() || 'B'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{businessName || 'Business Name'}</p>
                    <p className="text-sm text-gray-600">@{data.business.slug}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Background Settings</CardTitle>
              <CardDescription>
                Customize how your feedback page looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Background Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={backgroundType === "color" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBackgroundType("color")}
                  >
                    Color
                  </Button>
                  <Button
                    variant={backgroundType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBackgroundType("image")}
                  >
                    Image
                  </Button>
                </div>
              </div>

              {backgroundType === "color" ? (
                <div>
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={backgroundValue}
                      onChange={(e) => setBackgroundValue(e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={backgroundValue}
                      onChange={(e) => setBackgroundValue(e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="background-image">Background Image URL</Label>
                  <Input
                    id="background-image"
                    value={backgroundValue}
                    onChange={(e) => setBackgroundValue(e.target.value)}
                    placeholder="https://example.com/background.jpg"
                  />
                </div>
              )}

              {/* Background Preview */}
              <div>
                <Label>Preview</Label>
                <div 
                  className="h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                  style={{
                    background: backgroundType === "color" 
                      ? backgroundValue 
                      : `url(${backgroundValue}) center/cover`
                  }}
                >
                  <p className="text-white font-medium drop-shadow-lg">
                    Feedback Page Background
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSaveProfile}
            disabled={saving || !businessName.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
