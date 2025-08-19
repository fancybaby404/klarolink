'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Archive, 
  ExternalLink,
  User,
  Calendar,
  Target
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { TaskNotification } from '@/lib/types/notifications'

interface NotificationListProps {
  notifications: TaskNotification[]
  loading?: boolean
  onMarkAsRead: (id: number) => void
  onArchive: (id: number) => void
}

export function NotificationList({ 
  notifications, 
  loading = false, 
  onMarkAsRead, 
  onArchive 
}: NotificationListProps) {
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'in_progress': return 'text-blue-600'
      case 'pending': return 'text-yellow-600'
      case 'cancelled': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const formatMetadata = (metadata: Record<string, any>) => {
    const entries = Object.entries(metadata)
    if (entries.length === 0) return null

    return (
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        {entries.slice(0, 4).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
            <span className="font-medium">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`transition-all hover:shadow-md ${
            !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
          } ${
            notification.is_overdue ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Main Content */}
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`${getStatusColor(notification.status)}`}>
                      {getStatusIcon(notification.status)}
                    </div>
                    <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(notification.priority)}>
                      {notification.priority}
                    </Badge>
                    <Badge variant="outline">
                      {notification.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                {notification.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {notification.description}
                  </p>
                )}

                {/* Progress Bar */}
                {notification.progress_percentage > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{notification.progress_percentage}%</span>
                    </div>
                    <Progress value={notification.progress_percentage} className="h-2" />
                  </div>
                )}

                {/* Error Message */}
                {notification.error_message && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Error</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{notification.error_message}</p>
                  </div>
                )}

                {/* Metadata */}
                {Object.keys(notification.metadata).length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Details</h4>
                    {formatMetadata(notification.metadata)}
                  </div>
                )}

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {notification.assigned_to && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{notification.assigned_to}</span>
                      </div>
                    )}

                    {notification.estimated_completion && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>
                          Due {formatDistanceToNow(new Date(notification.estimated_completion), { addSuffix: true })}
                        </span>
                      </div>
                    )}

                    {notification.business_id && (
                      <div className="flex items-center gap-1">
                        <span>Business #{notification.business_id}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    ID: {notification.task_id}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {!notification.is_read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Read
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onArchive(notification.id)}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>

                {notification.metadata.external_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(notification.metadata.external_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
