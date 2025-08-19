'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationList } from './NotificationList'
import { NotificationStats } from './NotificationStats'
import { NotificationFilters } from './NotificationFilters'
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Settings
} from 'lucide-react'
import type { NotificationFilters as FilterType } from '@/lib/types/notifications'

interface NotificationDashboardProps {
  userId?: string
  className?: string
}

export function NotificationDashboard({ 
  userId = 'admin', 
  className = '' 
}: NotificationDashboardProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    unreadCount,
    criticalCount,
    overdueCount
  } = useNotifications({
    userId,
    categories: ['Business Intelligence and Analytics'],
    autoConnect: true,
    enableToasts: true
  })

  const handleFilterChange = (filters: FilterType) => {
    fetchNotifications(filters)
  }

  const handleRefresh = () => {
    fetchNotifications()
  }

  const getTabNotifications = (tab: string) => {
    switch (tab) {
      case 'unread':
        return notifications.filter(n => !n.is_read)
      case 'critical':
        return notifications.filter(n => n.priority === 'critical')
      case 'overdue':
        return notifications.filter(n => n.is_overdue)
      case 'completed':
        return notifications.filter(n => n.status === 'completed')
      case 'failed':
        return notifications.filter(n => n.status === 'failed')
      default:
        return notifications
    }
  }

  const tabNotifications = getTabNotifications(activeTab)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BellRing className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Business Intelligence Notifications</h1>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionStatus.connected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Offline</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleReconnect}
                  className="ml-2"
                >
                  Reconnect
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && <NotificationStats stats={stats} />}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter notifications by status, priority, and other criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationFilters onFilterChange={handleFilterChange} />
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            All
            <Badge variant="secondary" className="ml-1">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="critical" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Critical
            {criticalCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {criticalCount}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Overdue
            {overdueCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {overdueCount}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
            <Badge variant="secondary" className="ml-1">
              {notifications.filter(n => n.status === 'completed').length}
            </Badge>
          </TabsTrigger>
          
          <TabsTrigger value="failed" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Failed
            <Badge variant="destructive" className="ml-1">
              {notifications.filter(n => n.status === 'failed').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <NotificationList
            notifications={tabNotifications}
            loading={loading}
            onMarkAsRead={markAsRead}
            onArchive={archiveNotification}
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {!loading && tabNotifications.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500">
                {activeTab === 'all' 
                  ? 'No notifications available for Business Intelligence and Analytics.'
                  : `No ${activeTab} notifications found.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
