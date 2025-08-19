# Real-Time Notification System for Business Intelligence & Analytics

A comprehensive real-time notification system built for admin dashboards, specifically focused on Business Intelligence and Analytics tasks. Features real-time updates via WebSocket, optimized database queries, and a modern React UI.

## 🚀 Features

- **Real-time Updates**: WebSocket-based live notifications
- **Filtered Categories**: Focus on "Business Intelligence and Analytics"
- **Priority Management**: Critical, High, Medium, Low priority levels
- **Status Tracking**: Pending, In Progress, Completed, Failed, Cancelled
- **Progress Monitoring**: Visual progress bars and completion tracking
- **Advanced Filtering**: Filter by status, priority, date, business, assignee
- **Bulk Actions**: Mark multiple notifications as read, archive, delete
- **Responsive UI**: Modern design with Tailwind CSS and shadcn/ui
- **Optimized Performance**: Indexed database queries and efficient state management

## 📋 Database Schema

The system uses a PostgreSQL database with the following main tables:

### `task_notifications`
- Stores all notification data with metadata
- Indexed for optimal query performance
- Supports JSON metadata for flexible task-specific data

### `notification_subscribers`
- Manages WebSocket connections and subscriptions
- Tracks active connections and categories

## 🛠 Setup Instructions

### 1. Database Setup

Run the database schema:

```sql
-- Execute the schema file
\i database-task-notifications-schema.sql
```

### 2. Environment Variables

Add to your `.env` file:

```env
# WebSocket server port
WS_PORT=8080

# WebSocket URL for client connections
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### 3. Install Dependencies

```bash
npm install ws date-fns
npm install --save-dev @types/ws
```

### 4. Start the Application

```bash
# Start the Next.js application
npm run dev

# The WebSocket server will start automatically on port 8080
```

### 5. Access the Admin Dashboard

- **Admin Dashboard**: http://localhost:3000/admin
- **Test Page**: http://localhost:3000/admin/test
- **Notification Bell**: Visible in top-right corner on all admin pages

### 6. Test the System

```bash
# Run the test script
node scripts/test-notifications.js
```

## 📡 API Endpoints

### Notifications
- `GET /api/admin/notifications` - Fetch notifications with filters
- `POST /api/admin/notifications` - Create new notification
- `GET /api/admin/notifications/[id]` - Get specific notification
- `PATCH /api/admin/notifications/[id]` - Update notification
- `DELETE /api/admin/notifications/[id]` - Delete notification

### Bulk Actions
- `POST /api/admin/notifications/bulk` - Perform bulk actions
- `GET /api/admin/notifications/bulk/stats` - Get bulk action preview

### Simulation (for testing)
- `POST /api/admin/notifications/simulate` - Create test notifications
- `PUT /api/admin/notifications/simulate` - Update notifications for demo

## 🎯 Usage

### Basic Implementation

```tsx
import { NotificationDashboard } from '@/components/admin/NotificationDashboard'

export default function AdminPage() {
  return (
    <div>
      <NotificationDashboard userId="admin" />
    </div>
  )
}
```

### Using the Hook

```tsx
import { useNotifications } from '@/hooks/useNotifications'

function MyComponent() {
  const {
    notifications,
    stats,
    loading,
    connectionStatus,
    markAsRead,
    markAllAsRead
  } = useNotifications({
    userId: 'admin',
    categories: ['Business Intelligence and Analytics'],
    enableToasts: true
  })

  return (
    <div>
      {/* Your notification UI */}
    </div>
  )
}
```

## 🔧 Configuration

### WebSocket Connection

The WebSocket server automatically starts when the application loads. Configure the connection:

```typescript
const {
  notifications,
  connectionStatus
} = useNotifications({
  userId: 'admin',
  categories: ['Business Intelligence and Analytics'],
  autoConnect: true,
  enableToasts: true,
  pollInterval: 30000 // Fallback polling interval
})
```

### Notification Filters

```typescript
const filters: NotificationFilters = {
  category: 'Business Intelligence and Analytics',
  status: ['pending', 'in_progress'],
  priority: ['high', 'critical'],
  is_read: false,
  business_id: 123,
  date_from: '2024-01-01',
  date_to: '2024-01-31'
}
```

## 🧪 Testing

### Create Test Notifications

```bash
# Create 5 random test notifications
curl -X POST http://localhost:3000/api/admin/notifications/simulate \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "type": "random"}'

# Simulate progress updates
curl -X PUT http://localhost:3000/api/admin/notifications/simulate \
  -H "Content-Type: application/json" \
  -d '{"action": "progress"}'
```

### WebSocket Testing

Connect to the WebSocket server:

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/notifications?userId=admin&categories=Business Intelligence and Analytics')

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  console.log('Received:', message)
}
```

## 📊 Performance Optimizations

### Database Indexes
- Composite indexes on frequently queried columns
- Partial indexes for active notifications
- Optimized queries with proper WHERE clauses

### WebSocket Management
- Connection pooling and cleanup
- Automatic reconnection with exponential backoff
- Ping/pong heartbeat for connection health

### React Optimizations
- Memoized components and callbacks
- Efficient state updates with useCallback
- Virtualized lists for large notification sets

## 🔒 Security Considerations

- Input validation on all API endpoints
- SQL injection prevention with parameterized queries
- WebSocket authentication and authorization
- Rate limiting for API endpoints

## 🚀 Deployment

### Production Environment

1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy Next.js application
4. Set up WebSocket server (consider using a separate service)
5. Configure load balancer for WebSocket connections

### Docker Deployment

```dockerfile
# Add WebSocket server to your Dockerfile
EXPOSE 3000 8080
```

## 📈 Monitoring

Monitor the notification system:

- WebSocket connection count
- Notification processing rate
- Database query performance
- Error rates and failed notifications

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure TypeScript types are properly defined

## 📝 License

This notification system is part of the KlaroLink project.
