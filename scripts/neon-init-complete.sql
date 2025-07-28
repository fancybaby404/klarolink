-- =====================================================
-- KlaroLink Platform - Neon Database Initialization
-- =====================================================
-- This script creates all necessary tables, relationships, 
-- indexes, and seeds initial data for the KlaroLink platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- DROP TABLES (for clean reinstall - uncomment if needed)
-- =====================================================
-- DROP TABLE IF EXISTS analytics_events CASCADE;
-- DROP TABLE IF EXISTS feedback_submissions CASCADE;
-- DROP TABLE IF EXISTS social_links CASCADE;
-- DROP TABLE IF EXISTS feedback_forms CASCADE;
-- DROP TABLE IF EXISTS businesses CASCADE;

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Businesses table - Core business entities
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    background_type VARCHAR(20) DEFAULT 'color' CHECK (background_type IN ('color', 'image')),
    background_value TEXT DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback forms table - Customizable forms for each business
CREATE TABLE IF NOT EXISTS feedback_forms (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Feedback Form',
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    form_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Social links table - Social media and website links
CREATE TABLE IF NOT EXISTS social_links (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback submissions table - Customer feedback responses
CREATE TABLE IF NOT EXISTS feedback_submissions (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    form_id INTEGER NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

-- Analytics events table - Track user interactions
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view', 'form_view', 'form_submit', 'link_click', 'form_start', 'form_abandon')),
    event_data JSONB DEFAULT '{}'::jsonb,
    session_id UUID,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT
);

-- Business settings table - Additional business configuration
CREATE TABLE IF NOT EXISTS business_settings (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, setting_key)
);

-- Feedback categories table - Categorize feedback for better organization
CREATE TABLE IF NOT EXISTS feedback_categories (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback tags table - Many-to-many relationship for feedback categorization
CREATE TABLE IF NOT EXISTS feedback_tags (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES feedback_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, category_id)
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Businesses indexes
CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);

-- Feedback forms indexes
CREATE INDEX IF NOT EXISTS idx_feedback_forms_business_id ON feedback_forms(business_id);
CREATE INDEX IF NOT EXISTS idx_feedback_forms_active ON feedback_forms(business_id, is_active);

-- Social links indexes
CREATE INDEX IF NOT EXISTS idx_social_links_business_id ON social_links(business_id);
CREATE INDEX IF NOT EXISTS idx_social_links_active ON social_links(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_social_links_order ON social_links(business_id, display_order);

-- Feedback submissions indexes
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_business_id ON feedback_submissions(business_id);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_form_id ON feedback_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_submitted_at ON feedback_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_rating ON feedback_submissions(business_id, rating);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_email ON feedback_submissions(customer_email);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_business_id ON analytics_events(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(business_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

-- Business settings indexes
CREATE INDEX IF NOT EXISTS idx_business_settings_business_id ON business_settings(business_id);

-- =====================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_forms_updated_at BEFORE UPDATE ON feedback_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to extract rating from submission data
CREATE OR REPLACE FUNCTION extract_rating_from_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract rating from JSONB data if it exists
    IF NEW.submission_data ? 'rating' THEN
        NEW.rating = (NEW.submission_data->>'rating')::INTEGER;
    END IF;
    
    -- Extract customer info if available
    IF NEW.submission_data ? 'email' THEN
        NEW.customer_email = NEW.submission_data->>'email';
    END IF;
    
    IF NEW.submission_data ? 'name' THEN
        NEW.customer_name = NEW.submission_data->>'name';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically extract rating and customer info
CREATE TRIGGER extract_feedback_data BEFORE INSERT OR UPDATE ON feedback_submissions FOR EACH ROW EXECUTE FUNCTION extract_rating_from_submission();

-- =====================================================
-- SEED INITIAL DATA
-- =====================================================

-- Insert demo business (using bcrypt hash for password "demo123")
INSERT INTO businesses (name, email, password_hash, slug, profile_image, background_type, background_value) 
VALUES (
    'Demo Business',
    'demo@klarolink.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PqhEIu', -- bcrypt hash for "demo123"
    'demo-business',
    '/placeholder.svg?height=100&width=100',
    'color',
    '#6366f1'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample business for testing
INSERT INTO businesses (name, email, password_hash, slug, profile_image, background_type, background_value) 
VALUES (
    'Acme Restaurant',
    'contact@acme-restaurant.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PqhEIu', -- bcrypt hash for "demo123"
    'acme-restaurant',
    '/placeholder.svg?height=100&width=100',
    'color',
    '#dc2626'
) ON CONFLICT (email) DO NOTHING;

-- Insert feedback forms
INSERT INTO feedback_forms (business_id, title, description, fields) 
SELECT 
    b.id,
    'Customer Feedback',
    'We value your feedback! Please share your experience with us.',
    '[
        {
            "id": "name",
            "type": "text",
            "label": "Your Name",
            "required": true,
            "placeholder": "Enter your name"
        },
        {
            "id": "email",
            "type": "email",
            "label": "Email Address",
            "required": false,
            "placeholder": "your@email.com"
        },
        {
            "id": "rating",
            "type": "rating",
            "label": "Overall Rating",
            "required": true
        },
        {
            "id": "feedback",
            "type": "textarea",
            "label": "Your Feedback",
            "required": true,
            "placeholder": "Tell us about your experience..."
        },
        {
            "id": "recommend",
            "type": "select",
            "label": "Would you recommend us?",
            "required": false,
            "options": ["Yes, definitely", "Maybe", "No, probably not"]
        }
    ]'::jsonb
FROM businesses b
WHERE b.email IN ('demo@klarolink.com', 'contact@acme-restaurant.com')
ON CONFLICT DO NOTHING;

-- Insert social links for demo business
INSERT INTO social_links (business_id, platform, url, display_order) 
SELECT 
    b.id,
    'website',
    'https://demo-business.com',
    1
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

INSERT INTO social_links (business_id, platform, url, display_order) 
SELECT 
    b.id,
    'instagram',
    'https://instagram.com/demobusiness',
    2
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

INSERT INTO social_links (business_id, platform, url, display_order) 
SELECT 
    b.id,
    'twitter',
    'https://twitter.com/demobusiness',
    3
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

-- Insert social links for restaurant
INSERT INTO social_links (business_id, platform, url, display_order) 
SELECT 
    b.id,
    'website',
    'https://acme-restaurant.com',
    1
FROM businesses b
WHERE b.email = 'contact@acme-restaurant.com'
ON CONFLICT DO NOTHING;

INSERT INTO social_links (business_id, platform, url, display_order) 
SELECT 
    b.id,
    'facebook',
    'https://facebook.com/acmerestaurant',
    2
FROM businesses b
WHERE b.email = 'contact@acme-restaurant.com'
ON CONFLICT DO NOTHING;

-- Insert feedback categories
INSERT INTO feedback_categories (business_id, name, color, description)
SELECT 
    b.id,
    'Service Quality',
    '#10b981',
    'Feedback related to service quality and staff performance'
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

INSERT INTO feedback_categories (business_id, name, color, description)
SELECT 
    b.id,
    'Product Quality',
    '#3b82f6',
    'Feedback about product quality and features'
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

INSERT INTO feedback_categories (business_id, name, color, description)
SELECT 
    b.id,
    'General',
    '#6b7280',
    'General feedback and suggestions'
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

-- Insert sample feedback submissions
INSERT INTO feedback_submissions (business_id, form_id, submission_data, submitted_at)
SELECT 
    b.id,
    f.id,
    '{
        "name": "John Smith",
        "email": "john@example.com",
        "rating": 5,
        "feedback": "Excellent service! Very satisfied with the experience.",
        "recommend": "Yes, definitely"
    }'::jsonb,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM businesses b
JOIN feedback_forms f ON f.business_id = b.id
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

INSERT INTO feedback_submissions (business_id, form_id, submission_data, submitted_at)
SELECT 
    b.id,
    f.id,
    '{
        "name": "Sarah Johnson",
        "email": "sarah@example.com",
        "rating": 4,
        "feedback": "Good overall experience, but there is room for improvement in delivery time.",
        "recommend": "Yes, definitely"
    }'::jsonb,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM businesses b
JOIN feedback_forms f ON f.business_id = b.id
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

INSERT INTO feedback_submissions (business_id, form_id, submission_data, submitted_at)
SELECT 
    b.id,
    f.id,
    '{
        "name": "Mike Wilson",
        "rating": 3,
        "feedback": "Average experience. The product was okay but customer service could be better.",
        "recommend": "Maybe"
    }'::jsonb,
    CURRENT_TIMESTAMP - INTERVAL '3 hours'
FROM businesses b
JOIN feedback_forms f ON f.business_id = b.id
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

-- Insert sample analytics events
INSERT INTO analytics_events (business_id, event_type, event_data, session_id, created_at)
SELECT 
    b.id,
    'page_view',
    '{"page": "feedback_form", "user_agent": "Mozilla/5.0"}'::jsonb,
    uuid_generate_v4(),
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

INSERT INTO analytics_events (business_id, event_type, event_data, session_id, created_at)
SELECT 
    b.id,
    'form_submit',
    '{"form_id": 1, "completion_time": 120}'::jsonb,
    uuid_generate_v4(),
    CURRENT_TIMESTAMP - INTERVAL '30 minutes'
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT DO NOTHING;

-- Insert business settings
INSERT INTO business_settings (business_id, setting_key, setting_value)
SELECT 
    b.id,
    'notifications',
    '{
        "email_on_feedback": true,
        "daily_summary": true,
        "weekly_report": false
    }'::jsonb
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT (business_id, setting_key) DO NOTHING;

INSERT INTO business_settings (business_id, setting_key, setting_value)
SELECT 
    b.id,
    'branding',
    '{
        "primary_color": "#6366f1",
        "secondary_color": "#8b5cf6",
        "font_family": "Inter",
        "logo_url": "/placeholder.svg?height=100&width=100"
    }'::jsonb
FROM businesses b
WHERE b.email = 'demo@klarolink.com'
ON CONFLICT (business_id, setting_key) DO NOTHING;

-- =====================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for business analytics summary
CREATE OR REPLACE VIEW business_analytics_summary AS
SELECT 
    b.id as business_id,
    b.name as business_name,
    b.slug,
    COUNT(DISTINCT fs.id) as total_feedback,
    AVG(fs.rating) as average_rating,
    COUNT(DISTINCT CASE WHEN ae.event_type = 'page_view' THEN ae.id END) as page_views,
    COUNT(DISTINCT CASE WHEN ae.event_type = 'form_submit' THEN ae.id END) as form_submissions,
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN ae.event_type = 'page_view' THEN ae.id END) > 0 
        THEN (COUNT(DISTINCT CASE WHEN ae.event_type = 'form_submit' THEN ae.id END)::float / COUNT(DISTINCT CASE WHEN ae.event_type = 'page_view' THEN ae.id END) * 100)
        ELSE 0 
    END as conversion_rate
FROM businesses b
LEFT JOIN feedback_submissions fs ON b.id = fs.business_id
LEFT JOIN analytics_events ae ON b.id = ae.business_id
WHERE b.is_active = true
GROUP BY b.id, b.name, b.slug;

-- View for recent feedback with business info
CREATE OR REPLACE VIEW recent_feedback_view AS
SELECT 
    fs.id,
    fs.business_id,
    b.name as business_name,
    b.slug as business_slug,
    fs.submission_data,
    fs.rating,
    fs.customer_name,
    fs.customer_email,
    fs.submitted_at,
    fs.is_featured,
    fs.is_public
FROM feedback_submissions fs
JOIN businesses b ON fs.business_id = b.id
WHERE b.is_active = true
ORDER BY fs.submitted_at DESC;

-- =====================================================
-- GRANT PERMISSIONS (adjust as needed for your setup)
-- =====================================================

-- Grant permissions to application user (replace 'app_user' with your actual username)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify table creation
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify data insertion
SELECT 
    'businesses' as table_name, 
    COUNT(*) as record_count 
FROM businesses
UNION ALL
SELECT 
    'feedback_forms' as table_name, 
    COUNT(*) as record_count 
FROM feedback_forms
UNION ALL
SELECT 
    'social_links' as table_name, 
    COUNT(*) as record_count 
FROM social_links
UNION ALL
SELECT 
    'feedback_submissions' as table_name, 
    COUNT(*) as record_count 
FROM feedback_submissions
UNION ALL
SELECT 
    'analytics_events' as table_name, 
    COUNT(*) as record_count 
FROM analytics_events
ORDER BY table_name;

-- Show sample business data
SELECT 
    id,
    name,
    email,
    slug,
    background_type,
    background_value,
    is_active,
    created_at
FROM businesses
ORDER BY created_at;

-- =====================================================
-- SCRIPT COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'KlaroLink Database Initialization Complete!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tables created: businesses, feedback_forms, social_links, feedback_submissions, analytics_events, business_settings, feedback_categories, feedback_tags';
    RAISE NOTICE 'Sample data inserted for demo purposes';
    RAISE NOTICE 'Demo login: demo@klarolink.com / demo123';
    RAISE NOTICE 'Demo page: /demo-business';
    RAISE NOTICE '==============================================';
END $$;
