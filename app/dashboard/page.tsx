"use client"

import { useEffect, useState, useCallback, memo } from "react"
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
  TrendingDown,
  AlertTriangle,
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
  GripVertical,
  Search,
  Mail,
  Minus,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { SocialLinksManager } from "@/components/social-links-manager"
import { BusinessProfileManager } from "@/components/business-profile-manager"
import { LoadingSpinner, LoadingState } from "@/components/loading-spinner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Business } from "@/lib/types"
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
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ai, setAi] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [issuesData, setIssuesData] = useState<any>(null)
  const [issuesLoading, setIssuesLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [compareWith, setCompareWith] = useState("previous")
  const [enhancedInsights, setEnhancedInsights] = useState<any>(null)
  const [customerJourney, setCustomerJourney] = useState<any>(null)
  const [benchmarks, setBenchmarks] = useState<any>(null)

  useEffect(() => {
    fetchInsights()
    fetchIssues()
  }, [timeRange, compareWith])

  // Fetch AI insights when the user scrolls near the bottom (minor UX tweak to reduce initial load)
  useEffect(() => { fetchAiInsights(); }, [])

  const fetchAiInsights = async (force = false) => {
    try {
      setAiLoading(true)
      setAiError(null)
      const token = localStorage.getItem("token")
      if (!token) return
      const resp = await fetch(`/api/ai-insights${force ? '?force=true' : ''}` , {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resp.ok) throw new Error(`AI insights error ${resp.status}`)
      const result = await resp.json()
      setAi(result)
    } catch (e: any) {
      console.error(e)
      setAiError(e.message || 'Failed to load AI insights')
    } finally {
      setAiLoading(false)
    }
  }

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/insights?timeRange=${timeRange}&compareWith=${compareWith}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setInsights(result.insights)
        setEnhancedInsights(result.insights)
        setCustomerJourney(result.customerJourney)
        setBenchmarks(result.benchmarks)
      }
    } catch (error) {
      // Error handling without console.log
    } finally {
      setLoading(false)
    }
  }

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/dashboard/issues", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setIssuesData(result)
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error)
    } finally {
      setIssuesLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Time Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights and business intelligence from your customer feedback</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Compare:</label>
            <select
              value={compareWith}
              onChange={(e) => setCompareWith(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="previous">Previous Period</option>
              <option value="lastYear">Same Period Last Year</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchInsights(); fetchAiInsights(true); }}>
            <span>🔄 Refresh</span>
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      {enhancedInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
                  <p className="text-2xl font-bold text-gray-900">{enhancedInsights.satisfactionScore?.current}%</p>
                  <p className={`text-xs ${enhancedInsights.satisfactionScore?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {enhancedInsights.satisfactionScore?.change >= 0 ? '↗' : '↘'} {Math.abs(enhancedInsights.satisfactionScore?.change || 0)}% vs {compareWith}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">😊</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{enhancedInsights.completionRate?.current}%</p>
                  <p className={`text-xs ${enhancedInsights.completionRate?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {enhancedInsights.completionRate?.change >= 0 ? '↗' : '↘'} {Math.abs(enhancedInsights.completionRate?.change || 0)}% vs {compareWith}
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📝</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{enhancedInsights.responseTimeAnalysis?.averageResponseTime?.toFixed(1)}m</p>
                  <p className={`text-xs ${enhancedInsights.responseTimeAnalysis?.trend === 'improving' ? 'text-green-600' : 'text-red-600'}`}>
                    {enhancedInsights.responseTimeAnalysis?.trend === 'improving' ? '↗ Improving' : '↘ Declining'}
                  </p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">⏱️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{enhancedInsights.submissionTrends?.reduce((sum: number, day: any) => sum + day.count, 0) || 0}</p>
                  <p className="text-xs text-gray-500">
                    {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : timeRange === "90d" ? "Last 90 days" : "Last year"}
                  </p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submission Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Feedback Submission Trends
          </CardTitle>
          <CardDescription>Daily submissions over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={insights?.submissionTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Rating Distribution Chart */}
            <div className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={insights?.ratingDistribution?.filter((item: any) => item.count > 0).map((item: any) => ({
                      name: `${item.rating} Star${item.rating !== 1 ? 's' : ''}`,
                      value: item.count,
                      rating: item.rating
                    })) || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {insights?.ratingDistribution?.filter((item: any) => item.count > 0).map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rating >= 4 ? '#22c55e' : entry.rating >= 3 ? '#eab308' : '#ef4444'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <div className="text-3xl font-bold">{data.stats.totalFeedback}</div>
                <div className="text-sm text-gray-500">Total Ratings</div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2 mt-4">
                {insights?.ratingDistribution?.filter((item: any) => item.count > 0).map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.rating >= 4 ? '#22c55e' : item.rating >= 3 ? '#eab308' : '#ef4444' }}
                    ></div>
                    <span className="text-sm">{item.rating} Star{item.rating !== 1 ? 's' : ''} ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Conclusions - moved to end of insights page */}
      {ai?.insights?.conclusion && (
        <Card className="mt-6 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💡</span>
              Conclusions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">👍</span>
                <p><span className="font-semibold">Strength:</span> {ai.insights.conclusion.strength}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <p><span className="font-semibold">Needs Improvement:</span> {ai.insights.conclusion.needsImprovement}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🎯</span>
                <p><span className="font-semibold">Action:</span> {ai.insights.conclusion.action}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Field Analytics */}
      {insights?.fieldAnalytics && insights.fieldAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Form Field Analytics
            </CardTitle>
            <CardDescription>Insights from your custom form fields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.fieldAnalytics.map((field: any, index: number) => (
                <div key={field.fieldId} className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{field.fieldLabel}</h4>
                  <p className="text-sm text-gray-500 mb-3">Type: {field.fieldType}</p>

                  {field.fieldType === 'rating' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Average: {
                        field.responses.length > 0
                          ? (field.responses.reduce((a: number, b: number) => a + b, 0) / field.responses.length).toFixed(1)
                          : 'N/A'
                      }</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <div key={rating} className="text-center">
                            <div className="text-xs text-gray-500">{rating}</div>
                            <div
                              className="w-4 bg-blue-200 rounded"
                              style={{
                                height: `${Math.max(4, (field.responses.filter((r: number) => r === rating).length / field.responses.length) * 40)}px`
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {field.fieldType === 'text' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Responses: {field.responses.length}</p>
                      <div className="text-xs text-gray-500">
                        Avg length: {
                          field.responses.length > 0
                            ? Math.round(field.responses.reduce((a: number, b: string) => a + b.length, 0) / field.responses.length)
                            : 0
                        } chars
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold">{data.stats.totalFeedback}</p>
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
                <p className="text-2xl font-bold">{data.stats.pageViews}</p>
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
                <p className="text-2xl font-bold">
                  {data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : "N/A"}
                </p>
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
                <p className="text-2xl font-bold">{data.stats.completionRate}%</p>
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
            <CardDescription>Latest feedback submissions from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            {(data.stats.recentFeedback.length > 0 || insights?.recentSubmissions?.length > 0) ? (
              <div className="space-y-4">
                {/* Use insights data if available, otherwise fall back to dashboard data */}
                {(insights?.recentSubmissions || data.stats.recentFeedback).map((feedback: any) => {
                  // Handle both data formats
                  const rating = feedback.rating || (feedback.submission_data?.rating) || 0
                  const feedbackText = feedback.feedback ||
                                     feedback.submission_data?.feedback ||
                                     feedback.submission_data?.message ||
                                     feedback.submission_data?.comment ||
                                     "No feedback text"
                  const submittedAt = feedback.submitted_at

                  return (
                    <div key={feedback.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{feedbackText}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No feedback submissions yet</p>
                <p className="text-sm text-gray-400">Feedback will appear here once customers start submitting</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Reported Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Top Reported Issues
            </CardTitle>
            <CardDescription>
              Most frequently mentioned concerns in feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            {issuesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span className="ml-2 text-sm text-gray-600">Analyzing feedback...</span>
              </div>
            ) : issuesData?.issues && issuesData.issues.length > 0 ? (
              <div className="space-y-4">
                {issuesData.issues.map((issue: any, index: number) => (
                  <div key={issue.issue} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          issue.severity === 'high' ? 'bg-red-500' :
                          issue.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">{issue.issue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{issue.count} mentions</span>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          issue.trend === 'up' ? 'bg-red-100 text-red-700' :
                          issue.trend === 'down' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {issue.trend === 'up' ? '↗' : issue.trend === 'down' ? '↘' : '→'} {issue.trend}
                        </div>
                      </div>
                    </div>
                    {issue.recentSubmissions.length > 0 && (
                      <div className="mt-3 pl-6">
                        <p className="text-xs text-gray-500 mb-2">Recent feedback:</p>
                        <div className="space-y-1">
                          {issue.recentSubmissions.slice(0, 2).map((submission: any) => (
                            <div key={submission.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <span className="font-medium">{submission.submitter}</span>: "{submission.feedback.substring(0, 80)}..."
                              <span className="text-gray-400 ml-2">({submission.rating}★)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    📊 Analyzed {issuesData.totalSubmissions} submissions • {issuesData.negativeSubmissions} negative feedback
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No issues detected</p>
                <p className="text-sm text-gray-400">Great job! Your customers seem satisfied</p>
              </div>
            )}
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
  const [location, setLocation] = useState(data.business.location || "")
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
          profile_image: profileImage,
          location: location
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

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA or 123 Main St, City, State"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your business location - city, state, or full address
            </p>
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

function AudienceTab() {
  const [audienceData, setAudienceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAudienceData()
  }, [])

  const fetchAudienceData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/audience", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setAudienceData(result)
      }
    } catch (error) {
      console.error("Failed to fetch audience data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audience data...</p>
        </div>
      </div>
    )
  }

  const filteredCustomers = audienceData?.customerProfiles?.filter((customer: any) => {
    const matchesSearch = customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSegment = selectedSegment === "all" || customer.segments.includes(selectedSegment)
    return matchesSearch && matchesSegment
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audience Management</h2>
          <p className="text-gray-600">Manage your customer relationships and segments</p>
        </div>
        <Button variant="outline" onClick={fetchAudienceData}>
          <span>🔄</span>
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{audienceData?.overviewStats?.totalCustomers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promoters</p>
                <p className="text-2xl font-bold text-green-600">{audienceData?.overviewStats?.promoters || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passives</p>
                <p className="text-2xl font-bold text-yellow-600">{audienceData?.overviewStats?.passives || 0}</p>
              </div>
              <Minus className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Detractors</p>
                <p className="text-2xl font-bold text-red-600">{audienceData?.overviewStats?.detractors || 0}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">NPS Score</p>
                <p className="text-2xl font-bold text-purple-600">{audienceData?.overviewStats?.npsScore || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Customer Segments
          </CardTitle>
          <CardDescription>Automatically generated customer segments based on behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {audienceData?.customerSegments?.map((segment: any) => (
              <div key={segment.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                   onClick={() => setSelectedSegment(segment.name.toLowerCase().replace(/\s+/g, '_'))}>
                <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">{segment.customer_count} customers</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Customer List
              </CardTitle>
              <CardDescription>
                {filteredCustomers.length} of {audienceData?.customerProfiles?.length || 0} customers
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Segment:</label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Segments</option>
                  {audienceData?.customerSegments?.map((segment: any) => (
                    <option key={segment.id} value={segment.name.toLowerCase().replace(/\s+/g, '_')}>
                      {segment.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-3 py-1 text-sm w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length > 0 ? (
            <div className="space-y-4">
              {filteredCustomers.map((customer: any) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {customer.name ? customer.name.charAt(0).toUpperCase() : customer.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{customer.name || customer.email}</h4>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < customer.average_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {customer.average_rating.toFixed(1)} avg • {customer.total_submissions} submissions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Engagement Score</p>
                      <p className="text-lg font-bold text-blue-600">{customer.engagement_score}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {customer.segments.map((segment: string) => (
                        <span key={segment} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {segment.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No customers found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or segment filters</p>
            </div>
          )}
        </CardContent>
      </Card>
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
  // Stable preview refresh key; increments only on save or toggle
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0)

  // Completely isolated Form Editor to prevent any parent re-renders from affecting typing
  const IsolatedFormEditor = memo(function IsolatedFormEditor({
    initialTitle,
    initialDescription,
    initialFields,
    onSave,
    onCancel,
    isSaving,
    onEditField,
  }: {
    initialTitle: string
    initialDescription: string
    initialFields: FormBuilderField[]
    onSave: (data: { title: string; description: string; fields: FormBuilderField[] }) => void
    onCancel: () => void
    isSaving: boolean
    onEditField: (index: number, field: FormBuilderField) => void
  }) {
    const [localTitle, setLocalTitle] = useState(initialTitle)
    const [localDescription, setLocalDescription] = useState(initialDescription)
    const [localFields, setLocalFields] = useState<FormBuilderField[]>(initialFields)

    // Only update local state when initial values change (new edit session)
    useEffect(() => {
      setLocalTitle(initialTitle)
      setLocalDescription(initialDescription)
      setLocalFields(initialFields)
    }, [initialTitle, initialDescription, initialFields])

    const handleSave = () => {
      onSave({
        title: localTitle,
        description: localDescription,
        fields: localFields,
      })
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Form</CardTitle>
              <CardDescription>Customize your feedback form</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Close Editor
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="form-title">Form Header</Label>
              <Input
                id="form-title"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                placeholder="Share Your Experience"
              />
            </div>
            <div>
              <Label htmlFor="form-description">Form Subtext</Label>
              <Input
                id="form-description"
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                placeholder="Your feedback helps us improve our service"
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Form Fields</h4>
            <div className="space-y-3">
              {localFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
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
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onEditField(index, field)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFields = localFields.filter((_, i) => i !== index)
                          setLocalFields(newFields)
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

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Add a simple text field for now
                const newField: FormBuilderField = {
                  id: `field_${Date.now()}`,
                  type: 'text',
                  label: 'New Field',
                  required: false,
                  placeholder: 'Enter text...'
                }
                setLocalFields([...localFields, newField])
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Form'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  })

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

  const handleSaveForm = async (formData: { title: string; description: string; fields: FormBuilderField[] }) => {
    console.log('🚀 Save Form button clicked!')

    if (!data?.business.id) {
      console.log('❌ No business ID found')
      toast.error('Business ID not found', {
        description: 'Please refresh the page and try again'
      })
      return
    }

    console.log('✅ Business ID found:', data.business.id)
    setIsSavingForm(true)
    try {
      console.log('🔍 Saving form with data:', {
        business_id: data.business.id,
        title: formData.title,
        description: formData.description,
        fieldsCount: formData.fields.length,
        preview_enabled: previewEnabled
      })

      const token = localStorage.getItem('token')
      console.log('🔑 Token for form save:', token ? 'Present' : 'Missing')

      if (!token) {
        toast.error('Authentication required', {
          description: 'Please log in again'
        })
        router.push('/login')
        return
      }

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          business_id: data.business.id,
          title: formData.title.trim() || 'Feedback Form',
          description: formData.description.trim(),
          fields: formData.fields,
          preview_enabled: previewEnabled
        })
      })

      const responseData = await response.json()
      console.log('📝 Form save response:', responseData)

      if (response.ok) {
        console.log('✅ Form saved successfully')
        toast.success('Form saved successfully', {
          description: 'Your feedback form has been updated'
        })
        // Commit local edits to main state and close editor
        setFormTitle(formData.title)
        setFormDescription(formData.description)
        setFormFields(formData.fields)
        setIsEditingForm(false)
        // Bump preview only after successful save
        setPreviewRefreshKey((k) => k + 1)
        // Refresh dashboard data to show updated form
        fetchDashboardData()
      } else {
        console.error('❌ Failed to save form:', responseData)
        toast.error('Failed to save form', {
          description: responseData.error || 'Please try again'
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
            title: (formTitle || 'Feedback Form').trim(),
            description: (formDescription || '').trim(),
            fields: formFields,
            preview_enabled: enabled
          })
        })

        if (response.ok) {
          setPreviewRefreshKey((k) => k + 1)
          toast.success(`Live preview ${enabled ? 'enabled' : 'disabled'}`, {
            description: 'Setting saved automatically'
          })
        } else {
          toast.error('Failed to save preview setting', {
            description: 'Please try again'
          })
        }
      } catch (error) {
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

  const handleEditFieldFromIsolatedEditor = (index: number, field: FormBuilderField) => {
    // When editing from isolated editor, we need to work with the main formFields state
    // Set the field to edit and open the modal
    setEditingFieldIndex(index)
    setCurrentField({ ...field })
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
      } else {
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

  return (<>
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
      {/* Global Field Editor Modal - stable, not nested in DashboardContent */}
      <Dialog open={showFieldEditor}>
        <DialogContent forceMount className="max-w-2xl">
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
                    onCheckedChange={(checked) => {
                      setCurrentField({ ...currentField, required: checked })
                    }}
                  />
                  <Label htmlFor="field-required">Required</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="field-label">Field Label</Label>
                <Input
                  id="field-label"
                  value={currentField.label}
                  onChange={(e) => {
                    e.stopPropagation()
                    setCurrentField({ ...currentField, label: e.target.value })
                  }}
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
                      e.stopPropagation()
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
                    onChange={(e) => {
                      e.stopPropagation()
                      setCurrentField({ ...currentField, placeholder: e.target.value })
                    }}
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
                      e.stopPropagation()
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
            <Button type="button" variant="outline" onClick={() => {
              setShowFieldEditor(false)
              setCurrentField(null)
              setEditingFieldIndex(null)
            }}>
              Cancel
            </Button>
            <Button type="button" onClick={editingFieldIndex !== null ? handleSaveField : handleAddNewField}>
              {editingFieldIndex !== null ? 'Save Changes' : 'Add Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
                <button
                  onClick={() => router.push("/profile")}
                  className="text-left w-full hover:bg-shadow rounded-md p-2 -m-2 transition-colors group"
                >
                  <h2 className="text-sm font-semibold text-header truncate group-hover:text-primary transition-colors">
                    {data.business.name}
                  </h2>
                  <p className="text-xs text-subheader truncate">Click to edit profile</p>
                </button>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("overview")}
                  isActive={activeTab === "overview"}
                  className={`w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === "overview"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-header hover:bg-shadow hover:text-primary"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("forms")}
                  isActive={activeTab === "forms"}
                  className={`w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === "forms"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-header hover:bg-shadow hover:text-primary"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Forms</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("insights")}
                  isActive={activeTab === "insights"}
                  className={`w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === "insights"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-header hover:bg-shadow hover:text-primary"
                  }`}
                >
                  <BarChart className="h-4 w-4" />
                  <span className="font-medium">Insights</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("audience")}
                  isActive={activeTab === "audience"}
                  className={`w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === "audience"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-header hover:bg-shadow hover:text-primary"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span className="font-medium">Audience</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>

            {/* Logout Button at Bottom */}
            <div className="mt-auto p-2 border-t border-shadow">
              <SidebarMenuButton
                onClick={handleLogout}
                className="w-full justify-start px-3 py-2.5 rounded-lg text-error hover:text-error hover:bg-error/10 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </SidebarMenuButton>
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="bg-white border-b border-shadow sticky top-0 z-10">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger className="text-header hover:bg-shadow" />
              <h1 className="text-xl font-semibold text-header">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "forms" && "Forms Management"}
                {activeTab === "insights" && "Analytics & Insights"}
                {activeTab === "audience" && "Audience Management"}
              </h1>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handlePreviewForm}
                      >
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

                {/* Quick Analytics Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        This Week's Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">New Submissions</span>
                          <span className="font-semibold">{data.stats.totalFeedback}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average Rating</span>
                          <span className="font-semibold">
                            {data.stats.averageRating > 0 ? `${data.stats.averageRating}/5` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Response Rate</span>
                          <span className="font-semibold">{data.stats.completionRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => setActiveTab("forms")}
                        >
                          <FileText className="h-4 w-4" />
                          Customize Form
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => setActiveTab("insights")}
                        >
                          <BarChart className="h-4 w-4" />
                          View Analytics
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => window.open(`/${data.business.slug}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Preview Page
                        </Button>
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
                            type="button"
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
                    <IsolatedFormEditor
                      initialTitle={formTitle}
                      initialDescription={formDescription}
                      initialFields={formFields}
                      onSave={handleSaveForm}
                      onCancel={() => setIsEditingForm(false)}
                      isSaving={isSavingForm}
                      onEditField={handleEditFieldFromIsolatedEditor}
                    />
                  )}

                  {/* Field Editor Modal moved to top-level to prevent remounts */}
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
                              key={`preview-${previewRefreshKey}`}
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

            {activeTab === "audience" && <AudienceTab />}


          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
    )
  }
}