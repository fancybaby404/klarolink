'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import type { 
  TaskNotification, 
  NotificationFilters, 
  NotificationStats,
  NotificationState,
  NotificationAction,
  NotificationWebSocketMessage,
  ConnectionStatus
} from '@/lib/types/notifications'

interface UseNotificationsOptions {
  userId?: string
  categories?: string[]
  autoConnect?: boolean
  enableToasts?: boolean
  pollInterval?: number
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    userId = 'admin',
    categories = ['Business Intelligence and Analytics'],
    autoConnect = true,
    enableToasts = true,
    pollInterval = 30000 // 30 seconds fallback polling
  } = options

  const [state, setState] = useState<NotificationState>({
    notifications: [],
    stats: null,
    filters: { category: categories[0] },
    loading: false,
    error: null,
    connectionStatus: {
      connected: false,
      reconnect_attempts: 0
    }
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reducer-like state updates
  const dispatch = useCallback((action: NotificationAction) => {
    setState(prevState => {
      switch (action.type) {
        case 'SET_NOTIFICATIONS':
          return {
            ...prevState,
            notifications: action.payload,
            loading: false,
            error: null
          }

        case 'ADD_NOTIFICATION':
          return {
            ...prevState,
            notifications: [action.payload, ...prevState.notifications]
          }

        case 'UPDATE_NOTIFICATION':
          return {
            ...prevState,
            notifications: prevState.notifications.map(n =>
              n.id === action.payload.id ? action.payload : n
            )
          }

        case 'DELETE_NOTIFICATION':
          return {
            ...prevState,
            notifications: prevState.notifications.filter(n => n.id !== action.payload.id)
          }

        case 'MARK_READ':
          return {
            ...prevState,
            notifications: prevState.notifications.map(n =>
              n.id === action.payload.id ? { ...n, is_read: true } : n
            )
          }

        case 'MARK_ALL_READ':
          return {
            ...prevState,
            notifications: prevState.notifications.map(n => ({ ...n, is_read: true }))
          }

        case 'ARCHIVE_NOTIFICATION':
          return {
            ...prevState,
            notifications: prevState.notifications.filter(n => n.id !== action.payload.id)
          }

        case 'UPDATE_STATS':
          return {
            ...prevState,
            stats: action.payload
          }

        case 'SET_CONNECTION_STATUS':
          return {
            ...prevState,
            connectionStatus: action.payload
          }

        default:
          return prevState
      }
    })
  }, [])

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const params = new URLSearchParams()
      const currentFilters = { ...state.filters, ...filters }

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','))
          } else {
            params.append(key, String(value))
          }
        }
      })

      const response = await fetch(`/api/admin/notifications?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      dispatch({ type: 'SET_NOTIFICATIONS', payload: data.notifications })
      dispatch({ type: 'UPDATE_STATS', payload: data.stats })

    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch notifications' 
      }))
    }
  }, [state.filters, dispatch])

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'}/ws/notifications?userId=${userId}&categories=${categories.join(',')}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('🔌 WebSocket connected')
        dispatch({ 
          type: 'SET_CONNECTION_STATUS', 
          payload: { 
            connected: true, 
            last_connected: new Date().toISOString(),
            reconnect_attempts: 0,
            connection_id: `conn_${Date.now()}`
          } 
        })
      }

      ws.onmessage = (event) => {
        try {
          const message: NotificationWebSocketMessage = JSON.parse(event.data)
          handleWebSocketMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason)
        dispatch({ 
          type: 'SET_CONNECTION_STATUS', 
          payload: { 
            connected: false,
            reconnect_attempts: state.connectionStatus.reconnect_attempts + 1
          } 
        })

        // Attempt to reconnect
        if (autoConnect && state.connectionStatus.reconnect_attempts < 5) {
          const delay = Math.min(1000 * Math.pow(2, state.connectionStatus.reconnect_attempts), 30000)
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay)
        }
      }

      ws.onerror = (error) => {
        console.error('🔌 WebSocket error:', error)
      }

      wsRef.current = ws

    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }, [userId, categories, autoConnect, state.connectionStatus.reconnect_attempts, dispatch])

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: NotificationWebSocketMessage) => {
    switch (message.type) {
      case 'notification_created':
        if (message.data) {
          dispatch({ type: 'ADD_NOTIFICATION', payload: message.data as TaskNotification })
          
          if (enableToasts) {
            const notification = message.data as TaskNotification
            toast.info(notification.title, {
              description: notification.description,
              action: {
                label: 'View',
                onClick: () => markAsRead(notification.id)
              }
            })
          }
        }
        break

      case 'notification_updated':
        if (message.data) {
          dispatch({ type: 'UPDATE_NOTIFICATION', payload: message.data as TaskNotification })
        }
        break

      case 'notification_deleted':
        if (message.data && 'id' in message.data) {
          dispatch({ type: 'DELETE_NOTIFICATION', payload: { id: message.data.id } })
        }
        break

      case 'pong':
        // Keep connection alive
        break

      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  }, [enableToasts, dispatch])

  // API methods
  const markAsRead = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      })

      if (response.ok) {
        dispatch({ type: 'MARK_READ', payload: { id } })
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [dispatch])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          filters: state.filters
        })
      })

      if (response.ok) {
        dispatch({ type: 'MARK_ALL_READ', payload: {} })
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [state.filters, dispatch])

  const archiveNotification = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: true })
      })

      if (response.ok) {
        dispatch({ type: 'ARCHIVE_NOTIFICATION', payload: { id } })
      }
    } catch (error) {
      console.error('Failed to archive notification:', error)
    }
  }, [dispatch])

  // Setup polling fallback
  const startPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
    }

    pollTimeoutRef.current = setTimeout(() => {
      if (!state.connectionStatus.connected) {
        fetchNotifications()
      }
      startPolling()
    }, pollInterval)
  }, [state.connectionStatus.connected, fetchNotifications, pollInterval])

  // Initialize
  useEffect(() => {
    fetchNotifications()
    
    if (autoConnect) {
      connectWebSocket()
    }

    startPolling()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [])

  return {
    // State
    notifications: state.notifications,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    connectionStatus: state.connectionStatus,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    connectWebSocket,
    
    // Computed values
    unreadCount: state.notifications.filter(n => !n.is_read).length,
    criticalCount: state.notifications.filter(n => n.priority === 'critical').length,
    overdueCount: state.notifications.filter(n => n.is_overdue).length
  }
}
