"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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
  BarChart3,
  MessageSquare,
  Star,
  Users,
  User,
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
  Eye,
  GripVertical
} from "lucide-react"
import Link from "next/link"
import { SocialLinksManager } from "@/components/social-links-manager"
import { BusinessProfileManager } from "@/components/business-profile-manager"
import { LoadingSpinner, LoadingState } from "@/components/loading-spinner"
import type { Business } from "@/lib/database"
import type { FormField, SocialLink, FeedbackForm } from "@/lib/types"


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
  feedbackForm: FeedbackForm | null
}

interface FormBuilderField {
  id: string
  type: "text" | "email" | "textarea" | "rating" | "select" | "checkbox"
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

// Sample data for insights (will be replaced with real data from API)
const satisfactionData = [
  { month: 'Jan', satisfied: 85, neutral: 10, unsatisfied: 5 },
  { month: 'Feb', satisfied: 88, neutral: 8, unsatisfied: 4 },
  { month: 'Mar', satisfied: 92, neutral: 6, unsatisfied: 2 },
  { month: 'Apr', satisfied: 87, neutral: 9, unsatisfied: 4 },
  { month: 'May', satisfied: 90, neutral: 7, unsatisfied: 3 },
  { month: 'Jun', satisfied: 94, neutral: 4, unsatisfied: 2 },
]

const pieData = [
  { name: 'Satisfied', value: 70, color: '#22c55e' },
  { name: 'Neutral', value: 20, color: '#eab308' },
  { name: 'Unsatisfied', value: 10, color: '#ef4444' },
]

const recentFeedbackData = [
  { id: 1, rating: 5, comment: "Great Service!", time: "5h ago" },
  { id: 2, rating: 4, comment: "Loved the ambiance", time: "1d ago" },
  { id: 3, rating: 4, comment: "Prices could be lower", time: "3d ago" },
]

function InsightsTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Feedback Dashboard</h2>
          <p className="text-gray-600">Analytics and insights from your customer feedback</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Last 30 Days</span>
          <Button variant="outline" size="sm">
            <span>📅</span>
          </Button>
        </div>
      </div>

      {/* Satisfaction Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Satisfaction Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={satisfactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="satisfied" stroke="#22c55e" strokeWidth={3} />
                  <Line type="monotone" dataKey="neutral" stroke="#eab308" strokeWidth={2} />
                  <Line type="monotone" dataKey="unsatisfied" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <div className="text-3xl font-bold">100</div>
                <div className="text-sm text-gray-500">Customers</div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">N/A</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback and Top Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customer Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Customer Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFeedbackData.map((feedback) => (
                <div key={feedback.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{feedback.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">{feedback.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Reported Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Top Reported Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">High Pricing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Limited Selection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Long wait times</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface FormTemplate {
  id: string
  name: string
  description: string
  fields: FormBuilderField[]
  category: string
}

// Profile Tab Component
function ProfileTab({ data }: { data: DashboardData }) {
  const [businessName, setBusinessName] = useState(data.business.name)
  const [profileImage, setProfileImage] = useState(data.business.profile_image || "")
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color")
  const [backgroundValue, setBackgroundValue] = useState("#6366f1")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(data.socialLinks || [])
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // Save business profile
      const profileResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: businessName,
          profile_image: profileImage
        })
      })

      // Save social links
      const socialResponse = await fetch('/api/profile/social', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          social_links: socialLinks
        })
      })

      if (profileResponse.ok && socialResponse.ok) {
        console.log('✅ Profile saved successfully')
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }



  return (
    <div className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Update your business profile and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="profile-image">Profile Image URL</Label>
              <Input
                id="profile-image"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
            {profileImage ? (
              <img
                src={profileImage}
                alt={businessName}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {businessName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{businessName}</p>
              <p className="text-sm text-gray-600">@{data.business.slug}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Profile Management */}
      <BusinessProfileManager
        business={data.business}
        onBusinessUpdate={(updates) => {
          // Update local state
          setData(prev => prev ? { ...prev, business: { ...prev.business, ...updates } } : null)
          // The actual save will be handled by the component
        }}
      />

      {/* Enhanced Social Links */}
      <SocialLinksManager
        socialLinks={socialLinks}
        onSocialLinksChange={setSocialLinks}
      />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
  )
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
  const [showFieldEditor, setShowFieldEditor] = useState(false)
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [currentField, setCurrentField] = useState<FormBuilderField | null>(null)
  const [isSavingForm, setIsSavingForm] = useState(false)
  const [previewEnabled, setPreviewEnabled] = useState(false)
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

  const handleSaveForm = async () => {
    if (!data?.business.id) return

    setIsSavingForm(true)
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          business_id: data.business.id,
          title: formTitle || 'Feedback Form',
          description: formDescription || '',
          fields: formFields,
          preview_enabled: previewEnabled
        })
      })

      if (response.ok) {
        console.log('✅ Form saved successfully')
        toast.success('Form saved successfully', {
          description: 'Your feedback form has been updated'
        })
        setIsEditingForm(false)
        // Refresh dashboard data to show updated form
        fetchDashboardData()
      } else {
        console.error('❌ Failed to save form')
        toast.error('Failed to save form', {
          description: 'Please try again'
        })
      }
    } catch (error) {
      console.error('❌ Error saving form:', error)
      toast.error('Error saving form', {
        description: 'Please check your connection and try again'
      })
    } finally {
      setIsSavingForm(false)
    }
  }

  const handlePreviewToggle = async (enabled: boolean) => {
    setPreviewEnabled(enabled)

    // Auto-save the preview setting
    if (data?.business.id) {
      try {
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            business_id: data.business.id,
            title: formTitle || 'Feedback Form',
            description: formDescription || '',
            fields: formFields,
            preview_enabled: enabled
          })
        })

        if (response.ok) {
          console.log(`✅ Preview setting saved: ${enabled ? 'enabled' : 'disabled'}`)
          toast.success(`Live preview ${enabled ? 'enabled' : 'disabled'}`, {
            description: 'Setting saved automatically'
          })
        } else {
          console.error('❌ Failed to save preview setting')
          toast.error('Failed to save preview setting', {
            description: 'Please try again'
          })
        }
      } catch (error) {
        console.error('❌ Error saving preview setting:', error)
        toast.error('Error saving preview setting', {
          description: 'Please check your connection and try again'
        })
      }
    }
  }

  const handleEditField = (index: number) => {
    setEditingFieldIndex(index)
    setCurrentField({ ...formFields[index] })
    setShowFieldEditor(true)
  }

  const handleSaveField = () => {
    if (editingFieldIndex !== null && currentField) {
      const newFields = [...formFields]

      // Clean up field-specific properties based on type
      const cleanedField = { ...currentField }

      // Remove options if not a select or checkbox field
      if (cleanedField.type !== 'select' && cleanedField.type !== 'checkbox') {
        delete cleanedField.options
      }

      // For checkbox fields, ensure we have options and clean empty lines
      if (cleanedField.type === 'checkbox') {
        // Filter out empty lines when saving
        cleanedField.options = cleanedField.options?.filter(opt => opt.trim()) || []
        if (cleanedField.options.length === 0) {
          cleanedField.options = ['Option 1']
        }
        // Remove placeholder for checkbox fields
        delete cleanedField.placeholder
      }

      // For select fields, clean empty lines when saving
      if (cleanedField.type === 'select') {
        cleanedField.options = cleanedField.options?.filter(opt => opt.trim()) || []
        if (cleanedField.options.length === 0) {
          cleanedField.options = ['Option 1']
        }
      }

      // For non-checkbox, non-select fields, remove options
      if (cleanedField.type !== 'checkbox' && cleanedField.type !== 'select') {
        delete cleanedField.options
      }

      newFields[editingFieldIndex] = cleanedField
      setFormFields(newFields)
      setShowFieldEditor(false)
      setEditingFieldIndex(null)
      setCurrentField(null)

      console.log(`✅ Field updated: ${cleanedField.label} (${cleanedField.type})`, cleanedField.options ? `with ${cleanedField.options.length} options` : '')
    }
  }

  const handleFieldTypeChange = (newType: "text" | "email" | "textarea" | "rating" | "select" | "checkbox") => {
    if (currentField) {
      const updatedField: FormBuilderField = {
        ...currentField,
        type: newType,
        // Reset type-specific properties
        options: (newType === 'select' || newType === 'checkbox') ? currentField.options || [] : undefined,
        placeholder: (newType !== 'checkbox' && newType !== 'select') ? currentField.placeholder : undefined
      }

      setCurrentField(updatedField)
      console.log(`🔄 Field type changed to: ${newType}`)
    }
  }

  const handleAddField = () => {
    const newField: FormBuilderField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      placeholder: ''
    }
    setCurrentField(newField)
    setEditingFieldIndex(null)
    setShowFieldEditor(true)
  }

  const handleAddNewField = () => {
    if (currentField) {
      const fieldToAdd = { ...currentField }

      // Ensure checkbox fields have options and clean empty lines
      if (fieldToAdd.type === 'checkbox') {
        fieldToAdd.options = fieldToAdd.options?.filter(opt => opt.trim()) || []
        if (fieldToAdd.options.length === 0) {
          fieldToAdd.options = ['Option 1', 'Option 2']
        }
      }

      // Ensure select fields have options and clean empty lines
      if (fieldToAdd.type === 'select') {
        fieldToAdd.options = fieldToAdd.options?.filter(opt => opt.trim()) || []
        if (fieldToAdd.options.length === 0) {
          fieldToAdd.options = ['Option 1', 'Option 2']
        }
      }

      // Clean up placeholder for checkbox fields
      if (fieldToAdd.type === 'checkbox') {
        delete fieldToAdd.placeholder
      }

      setFormFields([...formFields, fieldToAdd])
      setShowFieldEditor(false)
      setCurrentField(null)

      console.log(`✅ Field added: ${fieldToAdd.label} (${fieldToAdd.type})`, fieldToAdd.options ? `with ${fieldToAdd.options.length} options` : '')
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

      // Populate form fields from the loaded feedback form
      if (dashboardData.feedbackForm) {
        setFormTitle(dashboardData.feedbackForm.title || "")
        setFormDescription(dashboardData.feedbackForm.description || "")
        setFormFields(dashboardData.feedbackForm.fields || [])
        setPreviewEnabled(dashboardData.feedbackForm.preview_enabled || false)
        console.log(`📝 Loaded existing form: "${dashboardData.feedbackForm.title}" with ${dashboardData.feedbackForm.fields?.length || 0} fields, preview: ${dashboardData.feedbackForm.preview_enabled ? 'enabled' : 'disabled'}`)
      } else {
        console.log(`⚠️  No existing form found for business: ${dashboardData.business.name}`)
        // Set default form fields if no form exists
        setFormTitle("Customer Feedback")
        setFormDescription("We value your feedback!")
        setFormFields([])
        setPreviewEnabled(false)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(formFields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFormFields(items)
    console.log(`📝 Reordered form fields: moved "${reorderedItem.label}" from position ${result.source.index} to ${result.destination.index}`)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  return (
    <LoadingState
      isLoading={loading}
      error={error}
      loadingText="Loading your dashboard..."
      errorText="Failed to load dashboard"
      onRetry={() => {
        setError("")
        setLoading(true)
        fetchDashboardData()
      }}
    >
      <DashboardContent />
    </LoadingState>
  )

  function DashboardContent() {

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
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("profile")}
                  isActive={activeTab === "profile"}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
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
                  {activeTab === "profile" && "Business Profile"}
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

                        {/* Live Preview Toggle */}
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="preview-enabled"
                            checked={previewEnabled}
                            onCheckedChange={handlePreviewToggle}
                          />
                          <Label htmlFor="preview-enabled" className="font-medium">
                            Enable Live Preview
                          </Label>
                        </div>
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
                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="form-fields">
                              {(provided, snapshot) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''}`}
                                >
                                  {formFields.map((field, index) => (
                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                      {(provided, snapshot) => (
                                        <Card
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`p-4 transition-all duration-200 ${
                                            snapshot.isDragging
                                              ? 'shadow-lg rotate-2 bg-white border-blue-300'
                                              : 'hover:shadow-md'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                              {/* Drag Handle */}
                                              <div
                                                {...provided.dragHandleProps}
                                                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                                              >
                                                <GripVertical className="h-4 w-4 text-gray-400" />
                                              </div>

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
                                                {field.type === 'checkbox' && field.options && (
                                                  <p className="text-xs text-gray-400 mt-1">
                                                    Checkbox options: {field.options.join(", ")}
                                                  </p>
                                                )}
                                                {field.type === 'select' && field.options && (
                                                  <p className="text-xs text-gray-400 mt-1">
                                                    Select options: {field.options.join(", ")}
                                                  </p>
                                                )}
                                                {field.type !== 'checkbox' && field.type !== 'select' && field.placeholder && (
                                                  <p className="text-xs text-gray-400 mt-1">
                                                    Placeholder: {field.placeholder}
                                                  </p>
                                                )}
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditField(index)}
                                              >
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
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </div>

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleAddField}
                          >
                            <Plus className="h-4 w-4" />
                            Add Field
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditingForm(false)}>
                              Cancel
                            </Button>
                            <Button
                              className="gap-2"
                              onClick={handleSaveForm}
                              disabled={isSavingForm}
                            >
                              {isSavingForm ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              {isSavingForm ? 'Saving...' : 'Save Form'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Field Editor Modal */}
                  <Dialog open={showFieldEditor} onOpenChange={setShowFieldEditor}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingFieldIndex !== null ? 'Edit Field' : 'Add New Field'}
                        </DialogTitle>
                        <DialogDescription>
                          Configure the field properties below.
                        </DialogDescription>
                      </DialogHeader>

                      {currentField && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="field-type">Field Type</Label>
                              <Select
                                value={currentField.type}
                                onValueChange={handleFieldTypeChange}
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

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="field-required"
                                checked={currentField.required}
                                onCheckedChange={(checked) =>
                                  setCurrentField({ ...currentField, required: checked })
                                }
                              />
                              <Label htmlFor="field-required">Required</Label>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="field-label">Field Label</Label>
                            <Input
                              id="field-label"
                              value={currentField.label}
                              onChange={(e) =>
                                setCurrentField({ ...currentField, label: e.target.value })
                              }
                              placeholder="Enter field label"
                            />
                          </div>

                          {currentField.type === 'checkbox' ? (
                            <div>
                              <Label htmlFor="checkbox-options">Checkbox Options (one per line)</Label>
                              <Textarea
                                id="checkbox-options"
                                value={currentField.options?.join('\n') || ''}
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n')
                                  setCurrentField({
                                    ...currentField,
                                    options: lines
                                  })
                                }}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                rows={4}
                                className="font-mono"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Each line will become a separate checkbox option. Empty lines will be ignored when saving.
                              </p>
                            </div>
                          ) : (
                            <div>
                              <Label htmlFor="field-placeholder">Placeholder (Optional)</Label>
                              <Input
                                id="field-placeholder"
                                value={currentField.placeholder || ''}
                                onChange={(e) =>
                                  setCurrentField({ ...currentField, placeholder: e.target.value })
                                }
                                placeholder="Enter placeholder text"
                              />
                            </div>
                          )}

                          {currentField.type === 'select' && (
                            <div>
                              <Label htmlFor="field-options">Select Options (one per line)</Label>
                              <Textarea
                                id="field-options"
                                value={currentField.options?.join('\n') || ''}
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n')
                                  setCurrentField({
                                    ...currentField,
                                    options: lines
                                  })
                                }}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                rows={4}
                                className="font-mono"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Each line will become a separate select option. Empty lines will be ignored when saving.
                              </p>
                            </div>
                          )}

                          {currentField.type === 'checkbox' && (
                            <div>
                              <Label>Preview</Label>
                              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                                <div className="font-medium text-sm text-gray-900">
                                  {currentField.label || "Question Label"}
                                  {currentField.required && <span className="text-red-500 ml-1">*</span>}
                                </div>
                                <div className="space-y-2">
                                  {(currentField.options && currentField.options.length > 0) ? (
                                    currentField.options.map((option, index) => (
                                      <div key={index} className="flex items-start space-x-3">
                                        <input
                                          type="checkbox"
                                          disabled
                                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700 flex-1 leading-5">
                                          {option}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex items-start space-x-3">
                                      <input
                                        type="checkbox"
                                        disabled
                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                                      />
                                      <span className="text-sm text-gray-500 flex-1 leading-5 italic">
                                        Add options above to see preview
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                This is how the checkbox group will appear to users
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFieldEditor(false)}>
                          Cancel
                        </Button>
                        <Button onClick={editingFieldIndex !== null ? handleSaveField : handleAddNewField}>
                          {editingFieldIndex !== null ? 'Save Changes' : 'Add Field'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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

                    {previewEnabled ? (
                      <>
                        <Card className="h-[600px] overflow-hidden">
                          <CardContent className="p-0 h-full">
                            <iframe
                              src={`/${data.business.slug}?preview=true`}
                              className="w-full h-full border-0"
                              title="Form Preview"
                              key={`preview-${formFields.length}-${formTitle}-${previewEnabled}`}
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
                      </>
                    ) : (
                      <Card className="h-[600px] flex items-center justify-center bg-gray-50">
                        <CardContent className="text-center">
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                              <Eye className="h-8 w-8 text-gray-500" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                Live Preview Disabled
                              </h4>
                              <p className="text-sm text-gray-600 mb-4">
                                Enable live preview to see your form changes in real-time
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreviewToggle(true)}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Enable Preview
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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

            {activeTab === "insights" && <InsightsTab data={data} />}

            {activeTab === "audience" && (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Audience Management Coming Soon</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Customer management features will be available here soon.
                </p>
              </div>
            )}

            {activeTab === "profile" && (
              <ProfileTab data={data} />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
    )
  }
}