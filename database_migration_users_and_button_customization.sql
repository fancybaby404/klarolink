-- =====================================================
-- KlaroLink Database Migration: Users Table & Button Customization
-- Execute these queries in order in your Neon SQL editor
-- =====================================================

-- 1. Create users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- 2. Add button customization fields to businesses table
ALTER TABLE businesses ADD COLUMN submit_button_color VARCHAR(7) DEFAULT '#CC79F0';
ALTER TABLE businesses ADD COLUMN submit_button_text_color VARCHAR(7) DEFAULT '#FDFFFA';
ALTER TABLE businesses ADD COLUMN submit_button_hover_color VARCHAR(7) DEFAULT '#3E7EF7';

-- 3. Add user_id foreign key to feedback_submissions for authenticated submissions
ALTER TABLE feedback_submissions ADD COLUMN user_id INT REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_feedback_submissions_user_id ON feedback_submissions(user_id);

-- 4. Add preview_enabled field to businesses table if it doesn't exist
-- (This ensures feedback forms can be enabled/disabled)
ALTER TABLE businesses ADD COLUMN preview_enabled BOOLEAN DEFAULT TRUE;

-- 5. Create user_business_access table to link users to businesses they can manage
CREATE TABLE user_business_access (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin',
    granted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- Create indexes for user_business_access table
CREATE INDEX idx_user_business_access_user_id ON user_business_access(user_id);
CREATE INDEX idx_user_business_access_business_id ON user_business_access(business_id);

-- 6. Insert sample users (optional - for testing)
-- Note: These passwords are hashed versions of 'password123'
-- In production, users will be created by external registration system
INSERT INTO users (email, password_hash, first_name, last_name) VALUES
('admin@klarolink.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK', 'Admin', 'User'),
('demo@klarolink.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK', 'Demo', 'User');

-- 7. Link sample users to existing businesses (adjust business IDs as needed)
-- This assumes you have businesses with IDs 1 and 2
-- Update the business_id values to match your actual business IDs
INSERT INTO user_business_access (user_id, business_id, role) 
SELECT u.id, b.id, 'admin'
FROM users u, businesses b 
WHERE u.email = 'admin@klarolink.com' AND b.slug = 'acme-corp'
ON CONFLICT (user_id, business_id) DO NOTHING;

INSERT INTO user_business_access (user_id, business_id, role) 
SELECT u.id, b.id, 'admin'
FROM users u, businesses b 
WHERE u.email = 'demo@klarolink.com' AND b.slug = 'demo-business'
ON CONFLICT (user_id, business_id) DO NOTHING;

-- 8. Update existing businesses with default button colors
UPDATE businesses 
SET 
    submit_button_color = '#CC79F0',
    submit_button_text_color = '#FDFFFA', 
    submit_button_hover_color = '#3E7EF7'
WHERE submit_button_color IS NULL;

-- 9. Ensure all businesses have preview enabled by default
UPDATE businesses 
SET preview_enabled = TRUE 
WHERE preview_enabled IS NULL;

-- =====================================================
-- Verification Queries (run these to check the migration)
-- =====================================================

-- Check users table
SELECT 'Users created:' as check_type, COUNT(*) as count FROM users;

-- Check businesses with button customization
SELECT 'Businesses with button colors:' as check_type, COUNT(*) as count 
FROM businesses 
WHERE submit_button_color IS NOT NULL;

-- Check user-business access relationships
SELECT 'User-business access records:' as check_type, COUNT(*) as count 
FROM user_business_access;

-- Show sample data
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    b.name as business_name,
    b.slug as business_slug,
    uba.role
FROM users u
JOIN user_business_access uba ON u.id = uba.user_id
JOIN businesses b ON uba.business_id = b.id
ORDER BY u.email;

-- =====================================================
-- Notes for Implementation:
-- =====================================================
-- 1. Update your authentication system to use the users table
-- 2. Modify login API to authenticate against users instead of businesses
-- 3. Use user_business_access table to determine which businesses a user can manage
-- 4. Update feedback submission to require user authentication
-- 5. Add button customization UI in dashboard/profile settings
-- 6. Update feedback page to use custom button colors from database
-- =====================================================
