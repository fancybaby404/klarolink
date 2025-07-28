"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { FormField, SocialLink } from "@/lib/database"

export default function CustomizePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color")
  const [backgroundColor, setBackgroundColor] = useState("#6366f1")
  const [backgroundImage, setBackgroundImage] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchCustomizationData()
  }, [])

  const fetchCustomizationData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/customize", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch customization data")
      }

      const data = await response.json()
      setFormFields(data.formFields || [])
      setSocialLinks(data.socialLinks || [])
      setBackgroundType(data.backgroundType || "color")
      setBackgroundColor(data.backgroundColor || "#6366f1")
      setBackgroundImage(data.backgroundImage || "")
    } catch (error) {
      console.error("Error fetching customization data:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveCustomization = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/customize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formFields,
          socialLinks,
          backgroundType,
          backgroundColor,
          backgroundImage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save customization")
      }

      // Show success message or redirect
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving customization:", error)
    } finally {
      setSaving(false)
    }
  }

  const addFormField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      required: false,
      placeholder: "",
    }
    setFormFields([...formFields, newField])
  }

  const updateFormField = (index: number, updates: Partial<FormField>) => {
    const updated = [...formFields]
    updated[index] = { ...updated[index], ...updates }
    setFormFields(updated)
  }

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index))
  }

  const addSocialLink = () => {
    const newLink: Partial<SocialLink> = {
      platform: "website",
      url: "",
      display_order: socialLinks.length,
      is_active: true,
    }
    setSocialLinks([...socialLinks, newLink as SocialLink])
  }

  const updateSocialLink = (index: number, updates: Partial<SocialLink>) => {
    const updated = [...socialLinks]
    updated[index] = { ...updated[index], ...updates }
    setSocialLinks(updated)
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customization options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Customize Your Page</h1>
            </div>
            <Button onClick={saveCustomization} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="form" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">Feedback Form</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Form Fields</CardTitle>
                <CardDescription>
                  Customize your feedback form by adding, removing, and reordering fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {formFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateFormField(index, { type: value as FormField["type"] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                              <SelectItem value="rating">Rating</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateFormField(index, { label: e.target.value })}
                            placeholder="Field label"
                          />
                        </div>
                        <div>
                          <Label>Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) => updateFormField(index, { placeholder: e.target.value })}
                            placeholder="Placeholder text"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateFormField(index, { required: checked })}
                          />
                          <Label>Required field</Label>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeFormField(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button onClick={addFormField} variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Form Field
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Add links to your social media profiles and website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {socialLinks.map((link, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Platform</Label>
                          <Select
                            value={link.platform}
                            onValueChange={(value) => updateSocialLink(index, { platform: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={link.url}
                            onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={link.is_active}
                            onCheckedChange={(checked) => updateSocialLink(index, { is_active: checked })}
                          />
                          <Label>Active</Label>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeSocialLink(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button onClick={addSocialLink} variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your feedback page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Background Type</Label>
                  <Select
                    value={backgroundType}
                    onValueChange={(value) => setBackgroundType(value as "color" | "image")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Solid Color</SelectItem>
                      <SelectItem value="image">Background Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {backgroundType === "color" ? (
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label>Background Image URL</Label>
                    <Input
                      value={backgroundImage}
                      onChange={(e) => setBackgroundImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <Label className="text-sm font-medium">Preview</Label>
                  <div
                    className="mt-2 h-32 rounded-lg flex items-center justify-center text-white"
                    style={{
                      background:
                        backgroundType === "color"
                          ? backgroundColor
                          : backgroundImage
                            ? `url(${backgroundImage}) center/cover`
                            : backgroundColor,
                    }}
                  >
                    <span className="text-sm font-medium">Your Page Background</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
