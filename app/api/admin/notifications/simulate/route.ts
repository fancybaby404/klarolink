import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'
import { broadcastNotification } from '@/lib/websocket/notification-server'
import type { CreateNotificationRequest } from '@/lib/types/notifications'

// POST /api/admin/notifications/simulate - Create test notifications for demo
export async function POST(request: NextRequest) {
  try {
    const { count = 1, type = 'random' } = await request.json()

    const simulatedNotifications = []

    for (let i = 0; i < count; i++) {
      const notification = generateSimulatedNotification(type, i)
      
      const insertQuery = `
        INSERT INTO task_notifications (
          task_id, task_type, category, title, description, priority, status,
          business_id, assigned_to, metadata, progress_percentage, 
          estimated_completion, max_retries
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `

      const result = await db.query!(insertQuery, [
        notification.task_id,
        notification.task_type,
        notification.category,
        notification.title,
        notification.description,
        notification.priority,
        notification.status,
        notification.business_id,
        notification.assigned_to,
        JSON.stringify(notification.metadata),
        notification.progress_percentage,
        notification.estimated_completion,
        notification.max_retries
      ])

      const createdNotification = result[0]
      simulatedNotifications.push(createdNotification)

      // Broadcast to WebSocket subscribers
      await broadcastNotification('notification_created', createdNotification)
    }

    return NextResponse.json({
      message: `Created ${count} simulated notifications`,
      notifications: simulatedNotifications
    })

  } catch (error) {
    console.error('Error creating simulated notifications:', error)
    return NextResponse.json(
      { error: 'Failed to create simulated notifications' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/notifications/simulate - Update existing notifications for demo
export async function PUT(request: NextRequest) {
  try {
    const { action = 'progress' } = await request.json()

    let updateQuery = ''
    let successMessage = ''

    switch (action) {
      case 'progress':
        // Simulate progress updates
        updateQuery = `
          UPDATE task_notifications 
          SET 
            progress_percentage = LEAST(progress_percentage + 25, 100),
            status = CASE 
              WHEN progress_percentage + 25 >= 100 THEN 'completed'
              WHEN progress_percentage = 0 THEN 'in_progress'
              ELSE status
            END,
            actual_completion = CASE 
              WHEN progress_percentage + 25 >= 100 THEN NOW()
              ELSE actual_completion
            END,
            updated_at = NOW()
          WHERE status IN ('pending', 'in_progress') 
            AND category = 'Business Intelligence and Analytics'
          RETURNING *
        `
        successMessage = 'Updated progress for active notifications'
        break

      case 'fail_random':
        // Simulate random failures
        updateQuery = `
          UPDATE task_notifications 
          SET 
            status = 'failed',
            error_message = 'Simulated error: ' || 
              CASE (RANDOM() * 3)::int
                WHEN 0 THEN 'Connection timeout'
                WHEN 1 THEN 'Insufficient resources'
                ELSE 'Data validation error'
              END,
            updated_at = NOW()
          WHERE status = 'in_progress' 
            AND category = 'Business Intelligence and Analytics'
            AND RANDOM() < 0.3
          RETURNING *
        `
        successMessage = 'Simulated random failures'
        break

      case 'complete_overdue':
        // Complete overdue tasks
        updateQuery = `
          UPDATE task_notifications 
          SET 
            status = 'completed',
            progress_percentage = 100,
            actual_completion = NOW(),
            updated_at = NOW()
          WHERE estimated_completion < NOW() 
            AND status NOT IN ('completed', 'failed', 'cancelled')
            AND category = 'Business Intelligence and Analytics'
          RETURNING *
        `
        successMessage = 'Completed overdue notifications'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const result = await db.query!(updateQuery)

    // Broadcast updates to WebSocket subscribers
    for (const notification of result) {
      await broadcastNotification('notification_updated', notification)
    }

    return NextResponse.json({
      message: successMessage,
      updated_count: result.length,
      notifications: result
    })

  } catch (error) {
    console.error('Error simulating notification updates:', error)
    return NextResponse.json(
      { error: 'Failed to simulate notification updates' },
      { status: 500 }
    )
  }
}

function generateSimulatedNotification(type: string, index: number): CreateNotificationRequest {
  const taskTypes = [
    'report_generation',
    'data_processing',
    'dashboard_update',
    'anomaly_detection',
    'data_export',
    'backup_process',
    'system_maintenance',
    'performance_analysis'
  ]

  const priorities = ['low', 'medium', 'high', 'critical'] as const
  const statuses = ['pending', 'in_progress'] as const
  const assignees = ['system', 'analytics_engine', 'ml_engine', 'data_team', 'admin']

  const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
  const priority = priorities[Math.floor(Math.random() * priorities.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const assignee = assignees[Math.floor(Math.random() * assignees.length)]

  const templates = {
    report_generation: {
      title: `Generate ${['Monthly', 'Weekly', 'Quarterly', 'Annual'][Math.floor(Math.random() * 4)]} Analytics Report`,
      description: 'Generating comprehensive analytics report with performance metrics, trends, and insights.',
      metadata: {
        report_type: ['monthly', 'weekly', 'quarterly'][Math.floor(Math.random() * 3)],
        businesses_count: Math.floor(Math.random() * 500) + 50,
        data_range: '2024-01-01 to 2024-01-31'
      }
    },
    data_processing: {
      title: `Process ${['Customer Feedback', 'Transaction', 'User Behavior', 'Performance'][Math.floor(Math.random() * 4)]} Data`,
      description: 'Processing and categorizing data for analysis and trend identification.',
      metadata: {
        records_count: Math.floor(Math.random() * 10000) + 1000,
        processing_type: ['sentiment_analysis', 'trend_detection', 'classification'][Math.floor(Math.random() * 3)]
      }
    },
    dashboard_update: {
      title: 'Refresh Business Intelligence Dashboard',
      description: 'Updating all dashboard metrics and KPIs with latest data.',
      metadata: {
        metrics_updated: Math.floor(Math.random() * 50) + 10,
        kpis_refreshed: Math.floor(Math.random() * 20) + 5
      }
    },
    anomaly_detection: {
      title: 'Detect Performance Anomalies',
      description: 'Running anomaly detection algorithms on business performance metrics.',
      metadata: {
        algorithm: ['isolation_forest', 'one_class_svm', 'local_outlier_factor'][Math.floor(Math.random() * 3)],
        metrics_analyzed: Math.floor(Math.random() * 300) + 100
      }
    },
    data_export: {
      title: 'Export Analytics Data',
      description: 'Exporting analytics data for external business intelligence tools.',
      metadata: {
        export_format: ['csv', 'json', 'parquet'][Math.floor(Math.random() * 3)],
        data_size: `${(Math.random() * 5 + 0.5).toFixed(1)}GB`,
        destination: ['s3_bucket', 'data_warehouse', 'ftp_server'][Math.floor(Math.random() * 3)]
      }
    }
  }

  const template = templates[taskType as keyof typeof templates] || templates.data_processing

  const estimatedMinutes = Math.floor(Math.random() * 120) + 15 // 15-135 minutes
  const estimatedCompletion = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString()

  return {
    task_id: `${taskType}_${Date.now()}_${index}`,
    task_type: taskType,
    category: 'Business Intelligence and Analytics',
    title: template.title,
    description: template.description,
    priority,
    status,
    business_id: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : undefined,
    assigned_to: assignee,
    metadata: template.metadata,
    progress_percentage: status === 'in_progress' ? Math.floor(Math.random() * 80) : 0,
    estimated_completion: estimatedCompletion,
    max_retries: 3
  }
}
