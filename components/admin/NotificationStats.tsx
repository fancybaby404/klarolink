'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity
} from 'lucide-react'
import type { NotificationStats } from '@/lib/types/notifications'

interface NotificationStatsProps {
  stats: NotificationStats
}

export function NotificationStats({ stats }: NotificationStatsProps) {
  const statCards = [
    {
      title: 'Total Notifications',
      value: stats.total,
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Unread',
      value: stats.unread,
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      badge: stats.unread > 0 ? 'attention' : null
    },
    {
      title: 'Critical Priority',
      value: stats.by_priority.critical,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badge: stats.by_priority.critical > 0 ? 'urgent' : null
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badge: stats.overdue > 0 ? 'urgent' : null
    },
    {
      title: 'Completed Today',
      value: stats.completed_today,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: 'up'
    },
    {
      title: 'Failed Today',
      value: stats.failed_today,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      trend: stats.failed_today > 0 ? 'down' : null
    }
  ]

  const statusBreakdown = [
    { label: 'Pending', value: stats.by_status.pending, color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.by_status.in_progress, color: 'bg-blue-500' },
    { label: 'Completed', value: stats.by_status.completed, color: 'bg-green-500' },
    { label: 'Failed', value: stats.by_status.failed, color: 'bg-red-500' },
    { label: 'Cancelled', value: stats.by_status.cancelled, color: 'bg-gray-500' }
  ]

  const priorityBreakdown = [
    { label: 'Critical', value: stats.by_priority.critical, color: 'bg-red-500' },
    { label: 'High', value: stats.by_priority.high, color: 'bg-orange-500' },
    { label: 'Medium', value: stats.by_priority.medium, color: 'bg-yellow-500' },
    { label: 'Low', value: stats.by_priority.low, color: 'bg-green-500' }
  ]

  const getCompletionRate = () => {
    const total = stats.total
    const completed = stats.by_status.completed
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  const getFailureRate = () => {
    const total = stats.total
    const failed = stats.by_status.failed
    return total > 0 ? Math.round((failed / total) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className={`${stat.borderColor} border-l-4`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.badge && (
                      <Badge 
                        variant={stat.badge === 'urgent' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                  {stat.trend && (
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        Today
                      </span>
                    </div>
                  )}
                </div>
                <div className={`h-8 w-8 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <span className="text-xs text-gray-400">
                      ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <span className="text-xs text-gray-400">
                      ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{getCompletionRate()}%</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all"
                      style={{ width: `${getCompletionRate()}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failure Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{getFailureRate()}%</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-red-500 rounded-full transition-all"
                      style={{ width: `${getFailureRate()}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Active Tasks</span>
                  <span>{stats.by_status.pending + stats.by_status.in_progress}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Needs Attention</span>
                  <span>{stats.overdue + stats.by_priority.critical}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
