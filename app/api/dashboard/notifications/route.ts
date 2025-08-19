import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Dashboard Notifications API: Processing request')
    
    // Check for authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔑 Dashboard Notifications API: Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Dashboard Notifications API: No valid authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the token
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      console.log('❌ Dashboard Notifications API: Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('✅ Dashboard Notifications API: Authentication successful for business ID:', decoded.businessId)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'Dashboard Analytics'
    const isRead = searchParams.get('is_read')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('📝 Dashboard Notifications API: Query params:', { category, isRead, priority, limit })

    // Mock notification data for dashboard
    const mockNotifications = [
      {
        id: 1,
        title: 'New Feedback Received',
        description: 'You have received 3 new feedback submissions today',
        category: 'Business Intelligence and Analytics',
        priority: 'medium',
        status: 'pending',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        data: { count: 3, type: 'feedback' }
      },
      {
        id: 2,
        title: 'Form Performance Alert',
        description: 'Your feedback form completion rate has increased by 15%',
        category: 'Business Intelligence and Analytics',
        priority: 'low',
        status: 'completed',
        is_read: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        data: { metric: 'completion_rate', change: 15 }
      },
      {
        id: 3,
        title: 'Weekly Analytics Summary',
        description: 'Your weekly analytics report is ready for review',
        category: 'Business Intelligence and Analytics',
        priority: 'low',
        status: 'completed',
        is_read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        data: { report_type: 'weekly', period: 'last_week' }
      },
      {
        id: 4,
        title: 'Customer Satisfaction Milestone',
        description: 'Congratulations! You\'ve reached 100 positive reviews',
        category: 'Business Intelligence and Analytics',
        priority: 'high',
        status: 'completed',
        is_read: false,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        data: { milestone: 'positive_reviews', count: 100 }
      },
      {
        id: 5,
        title: 'Form Optimization Suggestion',
        description: 'Consider adding a rating field to improve feedback quality',
        category: 'Business Intelligence and Analytics',
        priority: 'medium',
        status: 'pending',
        is_read: false,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        data: { suggestion_type: 'form_optimization', field: 'rating' }
      }
    ]

    // Filter notifications based on query parameters
    console.log(`🔍 Filtering notifications for category: "${category}"`)
    console.log(`📊 Available categories in mock data:`, [...new Set(mockNotifications.map(n => n.category))])

    let filteredNotifications = mockNotifications.filter(n => n.category === category)
    console.log(`✅ Found ${filteredNotifications.length} notifications for category "${category}"`)
    
    if (isRead !== null) {
      const readFilter = isRead === 'true'
      filteredNotifications = filteredNotifications.filter(n => n.is_read === readFilter)
    }
    
    if (priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority)
    }

    // Limit results
    filteredNotifications = filteredNotifications.slice(0, limit)

    // Calculate stats
    const stats = {
      total: mockNotifications.length,
      unread: mockNotifications.filter(n => !n.is_read).length,
      by_priority: {
        critical: mockNotifications.filter(n => n.priority === 'critical').length,
        high: mockNotifications.filter(n => n.priority === 'high').length,
        medium: mockNotifications.filter(n => n.priority === 'medium').length,
        low: mockNotifications.filter(n => n.priority === 'low').length
      },
      by_status: {
        pending: mockNotifications.filter(n => n.status === 'pending').length,
        completed: mockNotifications.filter(n => n.status === 'completed').length,
        dismissed: mockNotifications.filter(n => n.status === 'dismissed').length
      },
      overdue: mockNotifications.filter(n => 
        n.status === 'pending' && 
        new Date(n.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    }

    console.log('📊 Dashboard Notifications API: Returning stats:', stats)
    console.log('📋 Dashboard Notifications API: Returning notifications:', filteredNotifications.length)

    return NextResponse.json({
      notifications: filteredNotifications,
      stats,
      success: true
    })

  } catch (error) {
    console.error('❌ Dashboard Notifications API: Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
