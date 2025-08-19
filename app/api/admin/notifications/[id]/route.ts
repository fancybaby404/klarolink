import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'
import type { NotificationUpdate } from '@/lib/types/notifications'

// GET /api/admin/notifications/[id] - Get specific notification
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    const query = `
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
      WHERE id = $1
    `

    const result = await db.query!(query, [id])
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])

  } catch (error) {
    console.error('Error fetching notification:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/notifications/[id] - Update notification
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    const body: NotificationUpdate = await request.json()
    
    // Build dynamic update query
    const updateFields: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

    if (body.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      queryParams.push(body.status)
      paramIndex++
      
      // Auto-set completion time if status is completed
      if (body.status === 'completed' && !body.actual_completion) {
        updateFields.push(`actual_completion = NOW()`)
      }
    }

    if (body.progress_percentage !== undefined) {
      updateFields.push(`progress_percentage = $${paramIndex}`)
      queryParams.push(body.progress_percentage)
      paramIndex++
    }

    if (body.error_message !== undefined) {
      updateFields.push(`error_message = $${paramIndex}`)
      queryParams.push(body.error_message)
      paramIndex++
    }

    if (body.metadata !== undefined) {
      updateFields.push(`metadata = $${paramIndex}`)
      queryParams.push(JSON.stringify(body.metadata))
      paramIndex++
    }

    if (body.is_read !== undefined) {
      updateFields.push(`is_read = $${paramIndex}`)
      queryParams.push(body.is_read)
      paramIndex++
    }

    if (body.is_archived !== undefined) {
      updateFields.push(`is_archived = $${paramIndex}`)
      queryParams.push(body.is_archived)
      paramIndex++
    }

    if (body.estimated_completion !== undefined) {
      updateFields.push(`estimated_completion = $${paramIndex}`)
      queryParams.push(body.estimated_completion)
      paramIndex++
    }

    if (body.actual_completion !== undefined) {
      updateFields.push(`actual_completion = $${paramIndex}`)
      queryParams.push(body.actual_completion)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Add updated_at
    updateFields.push('updated_at = NOW()')
    
    // Add ID parameter
    queryParams.push(id)

    const updateQuery = `
      UPDATE task_notifications 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await db.query!(updateQuery, queryParams)
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    const updatedNotification = result[0]

    // TODO: Broadcast to WebSocket subscribers
    // await broadcastNotification('notification_updated', updatedNotification)

    return NextResponse.json(updatedNotification)

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    const deleteQuery = `
      DELETE FROM task_notifications 
      WHERE id = $1
      RETURNING id, task_id, title
    `

    const result = await db.query!(deleteQuery, [id])
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    const deletedNotification = result[0]

    // TODO: Broadcast to WebSocket subscribers
    // await broadcastNotification('notification_deleted', { id })

    return NextResponse.json({
      message: 'Notification deleted successfully',
      deleted: deletedNotification
    })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/notifications/[id]/read - Mark as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'read') {
      const updateQuery = `
        UPDATE task_notifications 
        SET is_read = true, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `

      const result = await db.query!(updateQuery, [id])
      
      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        message: 'Notification marked as read',
        notification: result[0]
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating notification read status:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
