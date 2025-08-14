"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  MessageSquare,
  Users,
  Star,
  AlertTriangle
} from "lucide-react"
import type { DashboardData } from "../../types/dashboard"

interface InsightsTabProps {
  data: DashboardData
}

export function InsightsTab({ data }: InsightsTabProps) {
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

  useEffect(() => { 
    fetchAiInsights() 
  }, [])

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
      setAiError(e.message || 'Failed to load AI insights')
    } finally {
      setAiLoading(false)
    }
  }

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Fetch enhanced insights for metrics
      const enhancedResponse = await fetch(`/api/insights?timeRange=${timeRange}&compareWith=${compareWith}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Fetch detailed insights for charts
      const detailedResponse = await fetch(`/api/dashboard/insights`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (enhancedResponse.ok) {
        const enhancedResult = await enhancedResponse.json()
        setEnhancedInsights(enhancedResult.insights)
        setCustomerJourney(enhancedResult.customerJourney)
        setBenchmarks(enhancedResult.benchmarks)
      }

      if (detailedResponse.ok) {
        const detailedResult = await detailedResponse.json()
        setInsights(detailedResult.insights)
      }
    } catch (error) {
      // Error handling - could add toast notification here
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
      // Error handling - could add toast notification here
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
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading trends...</p>
                  </div>
                </div>
              ) : insights?.submissionTrends && insights.submissionTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={insights.submissionTrends}>
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
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">No submission data yet</p>
                    <p className="text-sm text-gray-400">Trends will appear once you receive feedback</p>
                  </div>
                </div>
              )}
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

      {/* AI Conclusions */}
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
                  // Handle both data formats - parse submission_data if it's a string
                  let submissionData = feedback.submission_data
                  if (typeof submissionData === 'string') {
                    try {
                      submissionData = JSON.parse(submissionData)
                    } catch (e) {
                      submissionData = {}
                    }
                  }

                  const rating = feedback.rating || submissionData?.rating || 0
                  const feedbackText = feedback.feedback ||
                                     submissionData?.feedback ||
                                     submissionData?.message ||
                                     submissionData?.comment ||
                                     "No feedback text provided"
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
