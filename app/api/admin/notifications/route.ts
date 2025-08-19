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

    console.log(`🔍 Admin Notifications API - Filtering for category: "${filters.category}"`)
    console.log(`📊 Using database: ${process.env.DATABASE_URL ? 'Real Database' : 'Mock Database'}`)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Build WHERE clause for actual database schema
    const whereConditions: string[] = ['1=1'] // Always true condition to start
    const queryParams: any[] = []
    let paramIndex = 1

    if (filters.category) {
      whereConditions.push(`department = $${paramIndex}`)
      queryParams.push(filters.category)
      paramIndex++
    }

    // Filter by read status (maps to your 'read' column)
    if (filters.is_read !== undefined) {
      whereConditions.push(`read = $${paramIndex}`)
      queryParams.push(filters.is_read)
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

    // Get notifications using actual database schema
    const notificationsQuery = `
      SELECT
        id,
        task_id,
        department as category,
        message as title,
        message as description,
        'medium' as priority,
        CASE WHEN read = true THEN 'completed' ELSE 'pending' END as status,
        milestone as business_id,
        'system' as assigned_to,
        '{}' as metadata,
        CASE WHEN read = true THEN 100 ELSE 0 END as progress_percentage,
        NULL as estimated_completion,
        NULL as actual_completion,
        NULL as error_message,
        0 as retry_count,
        3 as max_retries,
        read as is_read,
        false as is_archived,
        created_at,
        created_at as updated_at,
        CASE WHEN read = true THEN 'success' ELSE 'info' END as notification_type,
        false as is_overdue
      FROM task_notifications
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const notifications = await db.query!(notificationsQuery, queryParams)

    console.log(`📊 Query executed - Found ${notifications.length} notifications`)
    console.log(`🔍 Query parameters:`, queryParams)

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM task_notifications
      WHERE ${whereClause}
    `
    const countResult = await db.query!(countQuery, queryParams.slice(0, -2))
    const total = parseInt(countResult[0].total)

    console.log(`📈 Total notifications in database for this filter: ${total}`)

    // Get stats using actual database schema
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE read = false) as unread,
        COUNT(*) FILTER (WHERE read = false) as pending,
        0 as in_progress,
        COUNT(*) FILTER (WHERE read = true) as completed,
        0 as failed,
        0 as cancelled,
        0 as low_priority,
        COUNT(*) as medium_priority,
        0 as high_priority,
        0 as critical_priority,
        0 as overdue,
        COUNT(*) FILTER (WHERE read = true AND DATE(created_at) = CURRENT_DATE) as completed_today,
        0 as failed_today
      FROM task_notifications
      WHERE department = $1
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
