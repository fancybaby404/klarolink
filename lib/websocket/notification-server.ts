// WebSocket server for real-time notifications
import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { parse } from 'url'
import { db } from '@/lib/database-adapter'
import type { 
  TaskNotification, 
  NotificationWebSocketMessage, 
  NotificationSubscriber 
} from '@/lib/types/notifications'

interface ExtendedWebSocket extends WebSocket {
  userId?: string
  connectionId?: string
  categories?: string[]
  isAlive?: boolean
  lastPing?: Date
}

class NotificationWebSocketServer {
  private wss: WebSocketServer | null = null
  private clients: Map<string, ExtendedWebSocket> = new Map()
  private pingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.setupServer()
  }

  private setupServer() {
    if (typeof window !== 'undefined') {
      // Client-side, don't initialize server
      return
    }

    try {
      this.wss = new WebSocketServer({ 
        port: parseInt(process.env.WS_PORT || '8080'),
        path: '/ws/notifications'
      })

      console.log(`🔌 WebSocket server started on port ${process.env.WS_PORT || '8080'}`)

      this.wss.on('connection', this.handleConnection.bind(this))
      this.setupPingInterval()

    } catch (error) {
      console.error('Failed to start WebSocket server:', error)
    }
  }

  private handleConnection(ws: ExtendedWebSocket, request: IncomingMessage) {
    const { query } = parse(request.url || '', true)
    const userId = query.userId as string
    const categories = (query.categories as string)?.split(',') || ['Business Intelligence and Analytics']

    if (!userId) {
      ws.close(1008, 'User ID required')
      return
    }

    const connectionId = this.generateConnectionId()
    ws.userId = userId
    ws.connectionId = connectionId
    ws.categories = categories
    ws.isAlive = true
    ws.lastPing = new Date()

    this.clients.set(connectionId, ws)

    console.log(`👤 User ${userId} connected with connection ${connectionId}`)

    // Register subscriber in database
    this.registerSubscriber(userId, connectionId, categories)

    // Send welcome message
    this.sendMessage(ws, {
      type: 'ping',
      data: { connectionId, categories },
      timestamp: new Date().toISOString(),
      user_id: userId
    })

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        this.handleMessage(ws, message)
      } catch (error) {
        console.error('Invalid message format:', error)
      }
    })

    // Handle connection close
    ws.on('close', () => {
      console.log(`👤 User ${userId} disconnected (${connectionId})`)
      this.clients.delete(connectionId)
      this.unregisterSubscriber(connectionId)
    })

    // Handle pong responses
    ws.on('pong', () => {
      ws.isAlive = true
      ws.lastPing = new Date()
    })

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${userId}:`, error)
      this.clients.delete(connectionId)
      this.unregisterSubscriber(connectionId)
    })
  }

  private handleMessage(ws: ExtendedWebSocket, message: any) {
    switch (message.type) {
      case 'ping':
        this.sendMessage(ws, {
          type: 'pong',
          timestamp: new Date().toISOString(),
          user_id: ws.userId
        })
        break

      case 'subscribe_categories':
        if (message.categories && Array.isArray(message.categories)) {
          ws.categories = message.categories
          this.updateSubscriberCategories(ws.connectionId!, message.categories)
        }
        break

      case 'mark_read':
        if (message.notification_id) {
          this.markNotificationRead(message.notification_id, ws.userId!)
        }
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  }

  private setupPingInterval() {
    this.pingInterval = setInterval(() => {
      this.clients.forEach((ws, connectionId) => {
        if (!ws.isAlive) {
          console.log(`🔌 Terminating inactive connection: ${connectionId}`)
          ws.terminate()
          this.clients.delete(connectionId)
          this.unregisterSubscriber(connectionId)
          return
        }

        ws.isAlive = false
        ws.ping()
      })
    }, 30000) // Ping every 30 seconds
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private sendMessage(ws: ExtendedWebSocket, message: NotificationWebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  // Public methods for broadcasting notifications
  public async broadcastNotification(
    type: 'notification_created' | 'notification_updated' | 'notification_deleted',
    notification: TaskNotification | { id: number },
    targetCategories?: string[]
  ) {
    const categories = targetCategories || ['Business Intelligence and Analytics']
    
    const message: NotificationWebSocketMessage = {
      type,
      data: notification,
      timestamp: new Date().toISOString()
    }

    this.clients.forEach((ws) => {
      if (ws.categories?.some(cat => categories.includes(cat))) {
        this.sendMessage(ws, message)
      }
    })

    console.log(`📡 Broadcasted ${type} to ${this.getActiveConnectionsCount()} connections`)
  }

  public async broadcastToUser(userId: string, message: NotificationWebSocketMessage) {
    this.clients.forEach((ws) => {
      if (ws.userId === userId) {
        this.sendMessage(ws, message)
      }
    })
  }

  public getActiveConnectionsCount(): number {
    return this.clients.size
  }

  public getConnectionsByCategory(category: string): number {
    let count = 0
    this.clients.forEach((ws) => {
      if (ws.categories?.includes(category)) {
        count++
      }
    })
    return count
  }

  // Database operations
  private async registerSubscriber(userId: string, connectionId: string, categories: string[]) {
    try {
      await db.query!(
        `INSERT INTO notification_subscribers (user_id, connection_id, categories, subscribed_at, last_ping, is_active)
         VALUES ($1, $2, $3, NOW(), NOW(), true)
         ON CONFLICT (user_id, connection_id) 
         DO UPDATE SET categories = $3, last_ping = NOW(), is_active = true`,
        [userId, connectionId, categories]
      )
    } catch (error) {
      console.error('Failed to register subscriber:', error)
    }
  }

  private async unregisterSubscriber(connectionId: string) {
    try {
      await db.query!(
        `UPDATE notification_subscribers 
         SET is_active = false 
         WHERE connection_id = $1`,
        [connectionId]
      )
    } catch (error) {
      console.error('Failed to unregister subscriber:', error)
    }
  }

  private async updateSubscriberCategories(connectionId: string, categories: string[]) {
    try {
      await db.query!(
        `UPDATE notification_subscribers 
         SET categories = $1, last_ping = NOW() 
         WHERE connection_id = $2`,
        [categories, connectionId]
      )
    } catch (error) {
      console.error('Failed to update subscriber categories:', error)
    }
  }

  private async markNotificationRead(notificationId: number, userId: string) {
    try {
      await db.query!(
        `UPDATE task_notifications 
         SET is_read = true, updated_at = NOW() 
         WHERE id = $1`,
        [notificationId]
      )

      // Broadcast the update
      const updatedNotification = await db.query!(
        `SELECT * FROM task_notifications WHERE id = $1`,
        [notificationId]
      )

      if (updatedNotification.length > 0) {
        this.broadcastNotification('notification_updated', updatedNotification[0])
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  public shutdown() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }

    this.clients.forEach((ws) => {
      ws.close(1001, 'Server shutting down')
    })

    if (this.wss) {
      this.wss.close()
    }

    console.log('🔌 WebSocket server shut down')
  }
}

// Singleton instance
let notificationServer: NotificationWebSocketServer | null = null

export function getNotificationServer(): NotificationWebSocketServer {
  if (!notificationServer) {
    notificationServer = new NotificationWebSocketServer()
  }
  return notificationServer
}

export function broadcastNotification(
  type: 'notification_created' | 'notification_updated' | 'notification_deleted',
  notification: TaskNotification | { id: number },
  targetCategories?: string[]
) {
  const server = getNotificationServer()
  return server.broadcastNotification(type, notification, targetCategories)
}

export { NotificationWebSocketServer }
