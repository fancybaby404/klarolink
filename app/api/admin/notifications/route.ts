import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'
import type { 
  TaskNotification, 
  NotificationFilters, 
  CreateNotificationRequest,
  NotificationStats 
} from '@/lib/types/notifications'

// GET /api/admin/notifications - Fetch notifications with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filters: NotificationFilters = {
      category: searchParams.get('category') || 'Business Intelligence and Analytics',
      status: searchParams.get('status')?.split(',') as any,
      priority: searchParams.get('priority')?.split(',') as any,
      is_read: searchParams.get('is_read') === 'true' ? true : searchParams.get('is_read') === 'false' ? false : undefined,
      is_archived: searchParams.get('is_archived') === 'true' ? true : false,
      business_id: searchParams.get('business_id') ? parseInt(searchParams.get('business_id')!) : undefined,
      assigned_to: searchParams.get('assigned_to') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Build WHERE clause
    const whereConditions: string[] = ['is_archived = $1']
    const queryParams: any[] = [filters.is_archived]
    let paramIndex = 2

    if (filters.category) {
      whereConditions.push(`category = $${paramIndex}`)
      queryParams.push(filters.category)
      paramIndex++
    }

    if (filters.status && filters.status.length > 0) {
      whereConditions.push(`status = ANY($${paramIndex})`)
      queryParams.push(filters.status)
      paramIndex++
    }

    if (filters.priority && filters.priority.length > 0) {
      whereConditions.push(`priority = ANY($${paramIndex})`)
      queryParams.push(filters.priority)
      paramIndex++
    }

    if (filters.is_read !== undefined) {
      whereConditions.push(`is_read = $${paramIndex}`)
      queryParams.push(filters.is_read)
      paramIndex++
    }

    if (filters.business_id) {
      whereConditions.push(`business_id = $${paramIndex}`)
      queryParams.push(filters.business_id)
      paramIndex++
    }

    if (filters.assigned_to) {
      whereConditions.push(`assigned_to = $${paramIndex}`)
      queryParams.push(filters.assigned_to)
      paramIndex++
    }

    if (filters.date_from) {
      whereConditions.push(`created_at >= $${paramIndex}`)
      queryParams.push(filters.date_from)
      paramIndex++
    }

    if (filters.date_to) {
      whereConditions.push(`created_at <= $${paramIndex}`)
      queryParams.push(filters.date_to)
      paramIndex++
    }

    const whereClause = whereConditions.join(' AND ')

    // Get notifications
    const notificationsQuery = `
      SELECT 
        id,
        task_id,
        task_type,
        category,
        title,
        description,
        priority,
        status,
        business_id,
        assigned_to,
        metadata,
        progress_percentage,
        estimated_completion,
        actual_completion,
        error_message,
        retry_count,
        max_retries,
        is_read,
        is_archived,
        created_at,
        updated_at,
        CASE 
          WHEN status = 'failed' THEN 'error'
          WHEN status = 'completed' THEN 'success'
          WHEN status = 'in_progress' THEN 'info'
          WHEN priority = 'critical' THEN 'error'
          WHEN priority = 'high' THEN 'warning'
          ELSE 'info'
        END as notification_type,
        CASE 
          WHEN estimated_completion < NOW() AND status NOT IN ('completed', 'failed', 'cancelled') THEN true
          ELSE false
        END as is_overdue
      FROM task_notifications 
      WHERE ${whereClause}
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const notifications = await db.query!(notificationsQuery, queryParams)

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM task_notifications 
      WHERE ${whereClause}
    `
    const countResult = await db.query!(countQuery, queryParams.slice(0, -2))
    const total = parseInt(countResult[0].total)

    // Get stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = false) as unread,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE priority = 'low') as low_priority,
        COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
        COUNT(*) FILTER (WHERE priority = 'critical') as critical_priority,
        COUNT(*) FILTER (WHERE estimated_completion < NOW() AND status NOT IN ('completed', 'failed', 'cancelled')) as overdue,
        COUNT(*) FILTER (WHERE status = 'completed' AND DATE(actual_completion) = CURRENT_DATE) as completed_today,
        COUNT(*) FILTER (WHERE status = 'failed' AND DATE(updated_at) = CURRENT_DATE) as failed_today
      FROM task_notifications 
      WHERE category = $1 AND is_archived = false
    `
    
    const statsResult = await db.query!(statsQuery, [filters.category || 'Business Intelligence and Analytics'])
    const statsRow = statsResult[0]

    const stats: NotificationStats = {
      total: parseInt(statsRow.total),
      unread: parseInt(statsRow.unread),
      by_status: {
        pending: parseInt(statsRow.pending),
        in_progress: parseInt(statsRow.in_progress),
        completed: parseInt(statsRow.completed),
        failed: parseInt(statsRow.failed),
        cancelled: parseInt(statsRow.cancelled)
      },
      by_priority: {
        low: parseInt(statsRow.low_priority),
        medium: parseInt(statsRow.medium_priority),
        high: parseInt(statsRow.high_priority),
        critical: parseInt(statsRow.critical_priority)
      },
      overdue: parseInt(statsRow.overdue),
      completed_today: parseInt(statsRow.completed_today),
      failed_today: parseInt(statsRow.failed_today)
    }

    return NextResponse.json({
      notifications,
      stats,
      total,
      page,
      limit,
      has_more: total > page * limit
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/admin/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body: CreateNotificationRequest = await request.json()

    const {
      task_id,
      task_type,
      category = 'Business Intelligence and Analytics',
      title,
      description,
      priority = 'medium',
      status = 'pending',
      business_id,
      assigned_to,
      metadata = {},
      progress_percentage = 0,
      estimated_completion,
      max_retries = 3
    } = body

    if (!task_id || !title) {
      return NextResponse.json(
        { error: 'task_id and title are required' },
        { status: 400 }
      )
    }

    const insertQuery = `
      INSERT INTO task_notifications (
        task_id, task_type, category, title, description, priority, status,
        business_id, assigned_to, metadata, progress_percentage, 
        estimated_completion, max_retries
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `

    const result = await db.query!(insertQuery, [
      task_id, task_type, category, title, description, priority, status,
      business_id, assigned_to, JSON.stringify(metadata), progress_percentage,
      estimated_completion, max_retries
    ])

    const notification = result[0]

    // TODO: Broadcast to WebSocket subscribers
    // await broadcastNotification('notification_created', notification)

    return NextResponse.json(notification, { status: 201 })

  } catch (error) {
    console.error('Error creating notification:', error)
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Notification with this task_id already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
