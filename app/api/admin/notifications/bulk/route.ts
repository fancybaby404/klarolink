import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'

interface BulkActionRequest {
  action: 'mark_read' | 'mark_unread' | 'archive' | 'unarchive' | 'delete'
  notification_ids?: number[]
  filters?: {
    category?: string
    status?: string[]
    priority?: string[]
    business_id?: number
    assigned_to?: string
  }
}

// POST /api/admin/notifications/bulk - Perform bulk actions
export async function POST(request: NextRequest) {
  try {
    const body: BulkActionRequest = await request.json()
    const { action, notification_ids, filters } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    if (!notification_ids && !filters) {
      return NextResponse.json(
        { error: 'Either notification_ids or filters must be provided' },
        { status: 400 }
      )
    }

    // Build WHERE clause
    const whereConditions: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

    if (notification_ids && notification_ids.length > 0) {
      whereConditions.push(`id = ANY($${paramIndex})`)
      queryParams.push(notification_ids)
      paramIndex++
    } else if (filters) {
      // Apply filters
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
    }

    if (whereConditions.length === 0) {
      return NextResponse.json(
        { error: 'No valid conditions provided' },
        { status: 400 }
      )
    }

    const whereClause = whereConditions.join(' AND ')
    let updateQuery = ''
    let successMessage = ''

    switch (action) {
      case 'mark_read':
        updateQuery = `
          UPDATE task_notifications 
          SET is_read = true, updated_at = NOW()
          WHERE ${whereClause}
          RETURNING id, title, is_read
        `
        successMessage = 'Notifications marked as read'
        break

      case 'mark_unread':
        updateQuery = `
          UPDATE task_notifications 
          SET is_read = false, updated_at = NOW()
          WHERE ${whereClause}
          RETURNING id, title, is_read
        `
        successMessage = 'Notifications marked as unread'
        break

      case 'archive':
        updateQuery = `
          UPDATE task_notifications 
          SET is_archived = true, updated_at = NOW()
          WHERE ${whereClause}
          RETURNING id, title, is_archived
        `
        successMessage = 'Notifications archived'
        break

      case 'unarchive':
        updateQuery = `
          UPDATE task_notifications 
          SET is_archived = false, updated_at = NOW()
          WHERE ${whereClause}
          RETURNING id, title, is_archived
        `
        successMessage = 'Notifications unarchived'
        break

      case 'delete':
        updateQuery = `
          DELETE FROM task_notifications 
          WHERE ${whereClause}
          RETURNING id, title
        `
        successMessage = 'Notifications deleted'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const result = await db.query!(updateQuery, queryParams)

    // TODO: Broadcast bulk update to WebSocket subscribers
    // await broadcastNotification('bulk_update', { action, affected_ids: result.map(r => r.id) })

    return NextResponse.json({
      message: successMessage,
      affected_count: result.length,
      affected_notifications: result
    })

  } catch (error) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}

// GET /api/admin/notifications/bulk/stats - Get bulk action preview stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      category: searchParams.get('category') || 'Business Intelligence and Analytics',
      status: searchParams.get('status')?.split(','),
      priority: searchParams.get('priority')?.split(','),
      business_id: searchParams.get('business_id') ? parseInt(searchParams.get('business_id')!) : undefined,
      assigned_to: searchParams.get('assigned_to') || undefined,
      is_read: searchParams.get('is_read') === 'true' ? true : searchParams.get('is_read') === 'false' ? false : undefined,
      is_archived: searchParams.get('is_archived') === 'true' ? true : false,
    }

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

    const whereClause = whereConditions.join(' AND ')

    const statsQuery = `
      SELECT 
        COUNT(*) as total_matching,
        COUNT(*) FILTER (WHERE is_read = false) as unread_matching,
        COUNT(*) FILTER (WHERE is_archived = false) as unarchived_matching,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_matching,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_matching,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_matching,
        COUNT(*) FILTER (WHERE priority = 'critical') as critical_matching,
        COUNT(*) FILTER (WHERE priority = 'high') as high_matching
      FROM task_notifications 
      WHERE ${whereClause}
    `

    const result = await db.query!(statsQuery, queryParams)
    const stats = result[0]

    return NextResponse.json({
      total_matching: parseInt(stats.total_matching),
      unread_matching: parseInt(stats.unread_matching),
      unarchived_matching: parseInt(stats.unarchived_matching),
      pending_matching: parseInt(stats.pending_matching),
      in_progress_matching: parseInt(stats.in_progress_matching),
      failed_matching: parseInt(stats.failed_matching),
      critical_matching: parseInt(stats.critical_matching),
      high_matching: parseInt(stats.high_matching),
      filters_applied: filters
    })

  } catch (error) {
    console.error('Error getting bulk stats:', error)
    return NextResponse.json(
      { error: 'Failed to get bulk stats' },
      { status: 500 }
    )
  }
}
