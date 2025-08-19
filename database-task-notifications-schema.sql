-- Task Notifications Schema for Admin Dashboard
-- Focused on Business Intelligence and Analytics

-- Create task_notifications table
CREATE TABLE IF NOT EXISTS task_notifications (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL DEFAULT 'business_intelligence',
    category VARCHAR(100) NOT NULL DEFAULT 'Business Intelligence and Analytics',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    assigned_to VARCHAR(255), -- Admin user or system
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional task-specific data
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT unique_task_id UNIQUE (task_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_task_notifications_category ON task_notifications(category);
CREATE INDEX IF NOT EXISTS idx_task_notifications_status ON task_notifications(status);
CREATE INDEX IF NOT EXISTS idx_task_notifications_priority ON task_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_task_notifications_business_id ON task_notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_task_notifications_created_at ON task_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_notifications_updated_at ON task_notifications(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_notifications_is_read ON task_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_task_notifications_is_archived ON task_notifications(is_archived);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_task_notifications_category_status ON task_notifications(category, status);
CREATE INDEX IF NOT EXISTS idx_task_notifications_unread_active ON task_notifications(is_read, is_archived) WHERE is_read = false AND is_archived = false;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_task_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_task_notifications_updated_at ON task_notifications;
CREATE TRIGGER update_task_notifications_updated_at
    BEFORE UPDATE ON task_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_task_notifications_updated_at();

-- Create notification_subscribers table for real-time subscriptions
CREATE TABLE IF NOT EXISTS notification_subscribers (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    connection_id VARCHAR(255) NOT NULL,
    categories TEXT[] DEFAULT ARRAY['Business Intelligence and Analytics'],
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT unique_user_connection UNIQUE (user_id, connection_id)
);

-- Create index for subscribers
CREATE INDEX IF NOT EXISTS idx_notification_subscribers_user_id ON notification_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subscribers_active ON notification_subscribers(is_active);

-- Insert sample task notifications for Business Intelligence and Analytics
INSERT INTO task_notifications (
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
    estimated_completion
) VALUES 
(
    'analytics_report_gen_001',
    'report_generation',
    'Business Intelligence and Analytics',
    'Generate Monthly Analytics Report',
    'Generating comprehensive analytics report for all businesses with performance metrics, trends, and insights.',
    'high',
    'in_progress',
    1,
    'system',
    '{"report_type": "monthly", "businesses_count": 150, "data_range": "2024-01-01 to 2024-01-31"}'::jsonb,
    75,
    NOW() + INTERVAL '30 minutes'
),
(
    'data_processing_002',
    'data_processing',
    'Business Intelligence and Analytics',
    'Process Customer Feedback Data',
    'Processing and categorizing customer feedback data for sentiment analysis and trend identification.',
    'medium',
    'pending',
    NULL,
    'analytics_engine',
    '{"feedback_count": 2500, "processing_type": "sentiment_analysis"}'::jsonb,
    0,
    NOW() + INTERVAL '2 hours'
),
(
    'dashboard_refresh_003',
    'dashboard_update',
    'Business Intelligence and Analytics',
    'Refresh Business Intelligence Dashboard',
    'Updating all dashboard metrics and KPIs with latest data from the past 24 hours.',
    'low',
    'completed',
    NULL,
    'system',
    '{"metrics_updated": 45, "kpis_refreshed": 12, "last_update": "2024-01-15T10:30:00Z"}'::jsonb,
    100,
    NOW() - INTERVAL '1 hour'
),
(
    'anomaly_detection_004',
    'anomaly_detection',
    'Business Intelligence and Analytics',
    'Detect Performance Anomalies',
    'Running anomaly detection algorithms on business performance metrics to identify unusual patterns.',
    'critical',
    'failed',
    NULL,
    'ml_engine',
    '{"algorithm": "isolation_forest", "metrics_analyzed": 200, "error": "insufficient_data"}'::jsonb,
    25,
    NOW() + INTERVAL '1 hour'
),
(
    'export_analytics_005',
    'data_export',
    'Business Intelligence and Analytics',
    'Export Analytics Data',
    'Exporting analytics data for external business intelligence tools and stakeholder reports.',
    'medium',
    'in_progress',
    2,
    'data_team',
    '{"export_format": "csv", "data_size": "2.5GB", "destination": "s3_bucket"}'::jsonb,
    60,
    NOW() + INTERVAL '45 minutes'
)
ON CONFLICT (task_id) DO NOTHING;

-- Create a view for active notifications
CREATE OR REPLACE VIEW active_task_notifications AS
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
    is_read,
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
WHERE is_archived = false 
    AND category = 'Business Intelligence and Analytics'
ORDER BY 
    CASE priority 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
    END,
    created_at DESC;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON task_notifications TO your_app_user;
-- GRANT ALL PRIVILEGES ON notification_subscribers TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE task_notifications_id_seq TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE notification_subscribers_id_seq TO your_app_user;
