// Types for the Task Notification System

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'
export type NotificationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface TaskNotification {
  id: number
  task_id: string
  task_type: string
  category: string
  title: string
  description?: string
  priority: NotificationPriority
  status: NotificationStatus
  business_id?: number
  assigned_to?: string
  metadata: Record<string, any>
  progress_percentage: number
  estimated_completion?: string
  actual_completion?: string
  error_message?: string
  retry_count: number
  max_retries: number
  is_read: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  notification_type?: NotificationType
  is_overdue?: boolean
}

export interface NotificationSubscriber {
  id: number
  user_id: string
  connection_id: string
  categories: string[]
  subscribed_at: string
  last_ping: string
  is_active: boolean
}

export interface NotificationFilters {
  category?: string
  status?: NotificationStatus[]
  priority?: NotificationPriority[]
  is_read?: boolean
  is_archived?: boolean
  business_id?: number
  assigned_to?: string
  date_from?: string
  date_to?: string
}

export interface NotificationStats {
  total: number
  unread: number
  by_status: Record<NotificationStatus, number>
  by_priority: Record<NotificationPriority, number>
  overdue: number
  completed_today: number
  failed_today: number
}

export interface NotificationUpdate {
  id?: number
  task_id?: string
  status?: NotificationStatus
  progress_percentage?: number
  error_message?: string
  metadata?: Record<string, any>
  is_read?: boolean
  is_archived?: boolean
  estimated_completion?: string
  actual_completion?: string
}

export interface CreateNotificationRequest {
  task_id: string
  task_type: string
  category?: string
  title: string
  description?: string
  priority?: NotificationPriority
  status?: NotificationStatus
  business_id?: number
  assigned_to?: string
  metadata?: Record<string, any>
  progress_percentage?: number
  estimated_completion?: string
  max_retries?: number
}

export interface NotificationWebSocketMessage {
  type: 'notification_created' | 'notification_updated' | 'notification_deleted' | 'ping' | 'pong'
  data?: TaskNotification | TaskNotification[] | NotificationStats
  timestamp: string
  user_id?: string
}

export interface NotificationPreferences {
  user_id: string
  categories: string[]
  email_notifications: boolean
  push_notifications: boolean
  sound_enabled: boolean
  priority_filter: NotificationPriority[]
  auto_mark_read: boolean
  notification_frequency: 'realtime' | 'batched' | 'daily'
}

// Real-time connection status
export interface ConnectionStatus {
  connected: boolean
  last_connected?: string
  reconnect_attempts: number
  connection_id?: string
}

// Notification action types for real-time updates
export type NotificationAction = 
  | { type: 'ADD_NOTIFICATION'; payload: TaskNotification }
  | { type: 'UPDATE_NOTIFICATION'; payload: TaskNotification }
  | { type: 'DELETE_NOTIFICATION'; payload: { id: number } }
  | { type: 'MARK_READ'; payload: { id: number } }
  | { type: 'MARK_ALL_READ'; payload: {} }
  | { type: 'ARCHIVE_NOTIFICATION'; payload: { id: number } }
  | { type: 'SET_NOTIFICATIONS'; payload: TaskNotification[] }
  | { type: 'UPDATE_STATS'; payload: NotificationStats }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }

// Notification context state
export interface NotificationState {
  notifications: TaskNotification[]
  stats: NotificationStats | null
  filters: NotificationFilters
  loading: boolean
  error: string | null
  connectionStatus: ConnectionStatus
}

// API Response types
export interface NotificationResponse {
  notifications: TaskNotification[]
  stats: NotificationStats
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface NotificationApiError {
  error: string
  code?: string
  details?: any
}

// Utility types for the notification system
export interface NotificationGroup {
  category: string
  notifications: TaskNotification[]
  count: number
  unread_count: number
}

export interface NotificationSummary {
  today: number
  this_week: number
  overdue: number
  high_priority: number
  failed: number
}

// Export default notification categories
export const NOTIFICATION_CATEGORIES = {
  BUSINESS_INTELLIGENCE: 'Business Intelligence and Analytics',
  SYSTEM: 'System',
  USER_MANAGEMENT: 'User Management',
  DATA_PROCESSING: 'Data Processing',
  REPORTS: 'Reports',
  MAINTENANCE: 'Maintenance'
} as const

export const NOTIFICATION_PRIORITIES: NotificationPriority[] = ['low', 'medium', 'high', 'critical']
export const NOTIFICATION_STATUSES: NotificationStatus[] = ['pending', 'in_progress', 'completed', 'failed', 'cancelled']
