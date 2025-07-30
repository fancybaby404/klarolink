"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  BarChart3,
  MessageSquare,
  Star,
  Users,
  TrendingUp,
  FileText,
  BarChart,
  UserCheck,
  ExternalLink,
  Copy,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  Eye
} from "lucide-react"
import Link from "next/link"
import type { Business } from "@/lib/database"
import type { FormField, SocialLink } from "@/lib/types"
import { Globe, Instagram, Twitter, Facebook, Linkedin, Youtube } from "lucide-react"

interface DashboardStats {
  totalFeedback: number
  completionRate: number
  averageRating: number
  pageViews: number
  recentFeedback: Array<{
    id: number
    rating: number
    feedback: string
    submitted_at: string
  }>
}

interface DashboardData {
  business: Business
  stats: DashboardStats
  socialLinks: SocialLink[]
}

interface FormBuilderField {
  id: string
  type: "text" | "email" | "textarea" | "rating" | "select" | "checkbox"
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface FormTemplate {
  id: string
  name: string
  description: string
  fields: FormBuilderField[]
  category: string
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formFields, setFormFields] = useState<FormBuilderField[]>([])
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [isEditingForm, setIsEditingForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const router = useRouter()

  // Form templates
  const formTemplates: FormTemplate[] = [
    {
      id: "customer-satisfaction",
      name: "Customer Satisfaction",
      description: "Basic satisfaction survey",
      category: "feedback",
      fields: [
        {
          id: "rating",
          type: "rating",
          label: "How would you rate your overall experience?",
          required: true
        },
        {
          id: "feedback",
          type: "textarea",
          label: "What did you like most? (Optional)",
          required: false,
          placeholder: "Tell us what you enjoyed..."
        },
        {
          id: "improvements",
          type: "textarea",
          label: "What can we improve? (Optional)",
          required: false,
          placeholder: "Share your suggestions..."
        },
        {
          id: "recommend",
          type: "select",
          label: "Would you recommend us to others?",
          required: true,
          options: ["Yes, definitely", "Maybe", "No, probably not"]
        },
        {
          id: "contact",
          type: "email",
          label: "Email (Optional)",
          required: false,
          placeholder: "your@email.com"
        }
      ]
    },
    {
      id: "product-feedback",
      name: "Product Feedback",
      description: "Detailed product review",
      category: "product",
      fields: [
        {
          id: "product-rating",
          type: "rating",
          label: "Rate this product",
          required: true
        },
        {
          id: "product-quality",
          type: "select",
          label: "How would you rate the product quality?",
          required: true,
          options: ["Excellent", "Good", "Average", "Poor"]
        },
        {
          id: "features",
          type: "textarea",
          label: "Which features do you like most?",
          required: false,
          placeholder: "Tell us about your favorite features..."
        },
        {
          id: "missing-features",
          type: "textarea",
          label: "What features are missing?",
          required: false,
          placeholder: "What would you like to see added..."
        },
        {
          id: "purchase-again",
          type: "select",
          label: "Would you purchase this product again?",
          required: true,
          options: ["Yes", "Maybe", "No"]
        }
      ]
    },
    {
      id: "service-review",
      name: "Service Review",
      description: "Service quality assessment",
      category: "service",
      fields: [
        {
          id: "service-rating",
          type: "rating",
          label: "Rate our service",
          required: true
        },
        {
          id: "staff-rating",
          type: "rating",
          label: "How helpful was our staff?",
          required: true
        },
        {
          id: "response-time",
          type: "select",
          label: "How was our response time?",
          required: true,
          options: ["Very fast", "Fast", "Average", "Slow", "Very slow"]
        },
        {
          id: "service-feedback",
          type: "textarea",
          label: "Tell us about your experience",
          required: false,
          placeholder: "Share your experience with our service..."
        },
        {
          id: "recommend-service",
          type: "select",
          label: "Would you recommend our service?",
          required: true,
          options: ["Yes, definitely", "Yes, probably", "Maybe", "Probably not", "Definitely not"]
        }
      ]
    },
    {
      id: "custom",
      name: "Custom Form",
      description: "Start from scratch",
      category: "custom",
      fields: [
        {
          id: "rating",
          type: "rating",
          label: "Overall Rating",
          required: true
        },
        {
          id: "feedback",
          type: "textarea",
          label: "Your Feedback",
          required: true,
          placeholder: "Tell us what you think..."
        }
      ]
    }
  ]

  const handleTemplateSelect = (template: FormTemplate) => {
    setFormTitle(template.name)
    setFormDescription(template.description)
    setFormFields(template.fields)
    setIsEditingForm(true)
    setShowCreateForm(false)
  }

  const handlePreviewForm = () => {
    if (data?.business.slug) {
      window.open(`/${data.business.slug}`, '_blank')
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const dashboardResponse = await fetch("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!dashboardResponse.ok) {
        if (dashboardResponse.status === 401) {
          localStorage.removeItem("token")
          router.push("/login")
          return
        }
        throw new Error("Failed to fetch dashboard data")
      }

      const dashboardData = await dashboardResponse.json()
      setData(dashboardData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h1>
          <p className="text-gray-600">Unable to load dashboard data.</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 px-2 py-2">
              {data.business.profile_image ? (
                <img
                  src={data.business.profile_image}
                  alt={data.business.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {data.business.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 truncate">
                  {data.business.name}
                </h2>
                <p className="text-xs text-gray-500 truncate">Dashboard</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("overview")}
                  isActive={activeTab === "overview"}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("forms")}
                  isActive={activeTab === "forms"}
                >
                  <FileText className="h-4 w-4" />
                  <span>Forms</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("insights")}
                  isActive={activeTab === "insights"}
                >
                  <BarChart className="h-4 w-4" />
                  <span>Insights</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("audience")}
                  isActive={activeTab === "audience"}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Audience</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold text-gray-900">
                  {activeTab === "overview" && "Dashboard Overview"}
                  {activeTab === "forms" && "Forms Management"}
                  {activeTab === "insights" && "Analytics & Insights"}
                  {activeTab === "audience" && "Audience Management"}
                </h1>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </header>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Your Feedback Link Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      <CardTitle className="text-lg">Your Feedback Link</CardTitle>
                    </div>
                    <CardDescription>
                      Share the link with your customers to collect feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <code className="flex-1 text-sm text-gray-700">
                        https://localhost:3000/{data.business.slug}
                      </code>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <MessageSquare className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Feedback</p>
                          <p className="text-2xl font-bold text-gray-900">{data.stats.totalFeedback}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Page Views</p>
                          <p className="text-2xl font-bold text-gray-900">{data.stats.pageViews}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Average Rating</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {data.stats.averageRating > 0 ? `${data.stats.averageRating}/5` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completion Rate</p>
                          <p className="text-2xl font-bold text-gray-900">{data.stats.completionRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Feedback Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <CardTitle className="text-lg">Recent Feedback</CardTitle>
                    </div>
                    <CardDescription>
                      Latest feedback submissions from your customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.stats.recentFeedback.length > 0 ? (
                      <div className="space-y-4">
                        {data.stats.recentFeedback.map((feedback) => (
                          <div key={feedback.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < feedback.rating
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(feedback.submitted_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{feedback.feedback}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
                        <p className="text-gray-500 mb-4">
                          Share your feedback link to start collecting customer feedback
                        </p>
                        <Button variant="outline" className="gap-2">
                          <Copy className="h-4 w-4" />
                          Copy Feedback Link
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "forms" && (
              <div className="flex gap-6">
                {/* Left Panel - Form Management */}
                <div className={`transition-all duration-300 ${previewCollapsed ? 'w-full' : 'w-2/3'} space-y-6`}>
                  {/* Business Profile Section */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {data.business.profile_image ? (
                          <img
                            src={data.business.profile_image}
                            alt={data.business.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {data.business.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900">{data.business.name}</h2>
                          <p className="text-gray-600">@{data.business.slug}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {data.socialLinks?.filter(link => link.platform === 'website').map((link) => (
                              <Button key={link.id} variant="ghost" size="sm" className="p-1">
                                <Globe className="h-4 w-4" />
                              </Button>
                            ))}
                            {data.socialLinks?.filter(link => link.platform !== 'website').map((link) => {
                              const IconComponent = {
                                instagram: Instagram,
                                twitter: Twitter,
                                facebook: Facebook,
                                linkedin: Linkedin,
                                youtube: Youtube,
                              }[link.platform] || Globe

                              return (
                                <Button key={link.id} variant="ghost" size="sm" className="p-1">
                                  <IconComponent className="h-4 w-4" />
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Publish Form Section */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Settings className="h-5 w-5 text-gray-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">Publish your form</h3>
                            <p className="text-sm text-gray-600">Share your form with customers</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handlePreviewForm}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Default Form Card */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formTitle || "Default Form"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formDescription || "Form Description"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingForm(true)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Create New Form Button */}
                  <div className="text-center">
                    <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create new form
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Form</DialogTitle>
                          <DialogDescription>
                            Choose a template or start from scratch to create your feedback form.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Form Templates */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Form Templates</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {formTemplates.map((template) => {
                                const iconColors = {
                                  "customer-satisfaction": { bg: "bg-blue-100", text: "text-blue-600", icon: Star },
                                  "product-feedback": { bg: "bg-green-100", text: "text-green-600", icon: MessageSquare },
                                  "service-review": { bg: "bg-purple-100", text: "text-purple-600", icon: Users },
                                  "custom": { bg: "bg-orange-100", text: "text-orange-600", icon: FileText }
                                }
                                const config = iconColors[template.id as keyof typeof iconColors]
                                const IconComponent = config.icon

                                return (
                                  <Card
                                    key={template.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow hover:border-blue-300"
                                    onClick={() => handleTemplateSelect(template)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                                          <IconComponent className={`h-5 w-5 ${config.text}`} />
                                        </div>
                                        <div>
                                          <h4 className="font-medium">{template.name}</h4>
                                          <p className="text-sm text-gray-600">{template.description}</p>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {template.fields.length} fields included
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                            Cancel
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Getting Started Card */}
                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">Start building connections by making your first form</h3>
                          <p className="text-green-100 text-sm mb-4">
                            Engage better with your customers
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowCreateForm(true)}
                          >
                            Get Started
                          </Button>
                        </div>
                        <div className="hidden md:block">
                          <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-12 w-12 text-white/80" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Form Editor */}
                  {isEditingForm && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Edit Form</CardTitle>
                            <CardDescription>Customize your feedback form</CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingForm(false)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Close Editor
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="form-title">Form Title</Label>
                            <Input
                              id="form-title"
                              value={formTitle}
                              onChange={(e) => setFormTitle(e.target.value)}
                              placeholder="Enter form title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="form-description">Form Description</Label>
                            <Input
                              id="form-description"
                              value={formDescription}
                              onChange={(e) => setFormDescription(e.target.value)}
                              placeholder="Enter form description"
                            />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Form Fields</h4>
                          <div className="space-y-3">
                            {formFields.map((field, index) => (
                              <Card key={field.id} className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium capitalize">
                                        {field.type}
                                      </span>
                                      {field.required && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                          Required
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{field.label}</p>
                                    {field.placeholder && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        Placeholder: {field.placeholder}
                                      </p>
                                    )}
                                    {field.options && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        Options: {field.options.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newFields = formFields.filter((_, i) => i !== index)
                                        setFormFields(newFields)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <Button variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Field
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditingForm(false)}>
                              Cancel
                            </Button>
                            <Button className="gap-2">
                              <Save className="h-4 w-4" />
                              Save Form
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Panel - Live Preview */}
                {!previewCollapsed && (
                  <div className="w-1/3 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewCollapsed(true)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <Card className="h-[600px] overflow-hidden">
                      <CardContent className="p-0 h-full">
                        <iframe
                          src={`/${data.business.slug}`}
                          className="w-full h-full border-0"
                          title="Form Preview"
                        />
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handlePreviewForm}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                )}

                {/* Collapsed Preview Button */}
                {previewCollapsed && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="fixed right-6 top-1/2 transform -translate-y-1/2 z-10"
                    onClick={() => setPreviewCollapsed(false)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Show Preview
                  </Button>
                )}
              </div>
            )}

            {activeTab === "insights" && (
              <div className="text-center py-12">
                <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Insights Coming Soon</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Advanced analytics and insights about your feedback data will be available here soon.
                </p>
              </div>
            )}

            {activeTab === "audience" && (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Audience Management Coming Soon</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Customer management features will be available here soon.
                </p>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}