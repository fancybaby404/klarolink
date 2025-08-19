"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Star,
  Mail
} from "lucide-react"
import type { AudienceData } from "../../types/dashboard"

export function AudienceTab() {
  const [audienceData, setAudienceData] = useState<AudienceData | null>(null)
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
      // Error handling - could add toast notification here
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

  const filteredCustomers = audienceData?.customerProfiles?.filter((customer) => {
    const matchesSearch = customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
    // Removed segment filtering since segments are hidden
    return matchesSearch
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Customer Segments - TEMPORARILY HIDDEN */}
      {/*
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
            {audienceData?.customerSegments?.map((segment) => (
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
      */}

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
              {filteredCustomers.map((customer) => (
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
