'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Bell, BellRing, CheckCircle, AlertTriangle, Clock, X } from 'lucide-react'

interface SimpleNotificationBellProps {
  userId?: string
}

export function SimpleNotificationBell({ userId = 'dashboard' }: SimpleNotificationBellProps) {
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      console.log('🔔 Fetching notifications...')

      // Get auth token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        console.log('❌ No auth token found')
        setLoading(false)
        return
      }

      const response = await fetch('/api/dashboard/notifications?category=Business Intelligence and Analytics&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const unreadCount = data.stats?.unread || 0
        setNotificationCount(unreadCount)
        setNotifications(data.notifications || [])
        console.log('✅ Notifications fetched:', data.notifications?.length, 'unread:', unreadCount)
      } else {
        console.error('❌ Failed to fetch notifications:', response.status, response.statusText)
        if (response.status === 401) {
          console.log('🔑 Authentication failed - token may be invalid')
        }
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [userId])

  const getBellIcon = () => {
    if (notificationCount > 0) {
      return <BellRing className="h-5 w-5 text-orange-600" />
    }
    return <Bell className="h-5 w-5 text-gray-600" />
  }

  const getNotificationIcon = (notification: any) => {
    switch (notification.priority) {
      case 'high':
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="relative p-2" disabled>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
      </Button>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100 transition-colors"
          title={`${notificationCount} unread notifications`}
        >
          {getBellIcon()}

          {/* Notification Badge */}
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {notificationCount} unread
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {notifications.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.description}
                          </p>
                          {!notification.is_read && (
                            <div className="mt-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}

            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="p-3 bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-sm text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      // Mark all as read functionality could go here
                      setIsOpen(false)
                    }}
                  >
                    Mark all as read
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
