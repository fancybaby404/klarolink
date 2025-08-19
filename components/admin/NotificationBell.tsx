'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useNotifications } from '@/hooks/useNotifications'
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertTriangle,
  Clock,
  Archive,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { TaskNotification } from '@/lib/types/notifications'

interface NotificationBellProps {
  userId?: string
  maxDisplayItems?: number
}

export function NotificationBell({
  userId = 'admin',
  maxDisplayItems = 5
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Debug logging
  console.log('🔔 NotificationBell component rendered for user:', userId)
  
  const {
    notifications,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    fetchNotifications,
    unreadCount,
    criticalCount
  } = useNotifications({
    userId,
    categories: ['Business Intelligence and Analytics'],
    autoConnect: true,
    enableToasts: false // Disable toasts for the bell to avoid duplicates
  })

  const recentNotifications = notifications
    .filter(n => !n.is_archived)
    .slice(0, maxDisplayItems)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'failed': return <AlertTriangle className="h-3 w-3 text-red-600" />
      case 'in_progress': return <Clock className="h-3 w-3 text-blue-600" />
      case 'pending': return <Clock className="h-3 w-3 text-yellow-600" />
      default: return <Clock className="h-3 w-3 text-gray-600" />
    }
  }

  const handleNotificationClick = (notification: TaskNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }

  const handleViewAll = () => {
    setIsOpen(false)
    // Navigate to admin dashboard
    window.location.href = '/admin'
  }

  const getBellIcon = () => {
    if (criticalCount > 0) {
      return <BellRing className="h-5 w-5 text-red-600 animate-pulse" />
    }
    if (unreadCount > 0) {
      return <BellRing className="h-5 w-5 text-orange-600" />
    }
    return <Bell className="h-5 w-5 text-gray-600" />
  }

  const getBadgeCount = () => {
    if (criticalCount > 0) return criticalCount
    return unreadCount
  }

  const getBadgeVariant = () => {
    if (criticalCount > 0) return 'destructive'
    if (unreadCount > 0) return 'default'
    return 'secondary'
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          {getBellIcon()}
          
          {/* Notification Badge */}
          {getBadgeCount() > 0 && (
            <Badge
              variant={getBadgeVariant()}
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {getBadgeCount() > 99 ? '99+' : getBadgeCount()}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-lg">
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {/* Refresh Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchNotifications()}
                  disabled={loading}
                  className="text-xs h-6 px-2"
                  title="Refresh notifications"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>

                {/* Mark All Read */}
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Summary */}
            {stats && (
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{stats.total} total</span>
                <span>{stats.unread} unread</span>
                {stats.by_priority.critical > 0 && (
                  <span className="text-red-600 font-medium">
                    {stats.by_priority.critical} critical
                  </span>
                )}
                {stats.overdue > 0 && (
                  <span className="text-red-600 font-medium">
                    {stats.overdue} overdue
                  </span>
                )}
              </div>
            )}
          </CardHeader>

          <Separator />

          {/* Notifications List */}
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Loading notifications...
              </div>
            ) : recentNotifications.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-1">
                  {recentNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.is_read ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Icon */}
                          <div className="mt-1">
                            {getStatusIcon(notification.status)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm font-medium truncate ${
                                !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </span>
                              </div>
                            </div>

                            {notification.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.description}
                              </p>
                            )}

                            {/* Progress Bar */}
                            {notification.progress_percentage > 0 && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>{notification.progress_percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-blue-600 h-1 rounded-full transition-all"
                                    style={{ width: `${notification.progress_percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {notification.is_overdue && (
                                  <Badge variant="destructive" className="text-xs px-1 py-0">
                                    Overdue
                                  </Badge>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    archiveNotification(notification.id)
                                  }}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Archive className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {index < recentNotifications.length - 1 && (
                        <Separator className="mx-3" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewAll}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Notifications
                </Button>
              </div>
            </>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  )
}
