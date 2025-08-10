-- Create users table for KlaroLink
-- This table stores user accounts for feedback submission

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Insert test users with the same password hash as in the mock data
-- Password for all test users is: password123
INSERT INTO users (id, email, password_hash, first_name, last_name, is_active) VALUES
(1, 'admin@klarolink.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK', 'Admin', 'User', TRUE),
(2, 'demo@klarolink.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK', 'Demo', 'User', TRUE),
(3, 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK', 'John', 'Smith', TRUE),
(4, 'jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK', 'Jane', 'Doe', TRUE),
(5, 'customer@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK', 'Customer', 'Test', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Reset the sequence to ensure future inserts use correct IDs
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Create user_business_access table for user permissions
CREATE TABLE IF NOT EXISTS user_business_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    access_level VARCHAR(50) DEFAULT 'customer', -- 'admin', 'manager', 'customer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, business_id)
);

-- Grant all test users access to all businesses as customers
INSERT INTO user_business_access (user_id, business_id, access_level)
SELECT u.id, b.id, 'customer'
FROM users u
CROSS JOIN businesses b
ON CONFLICT (user_id, business_id) DO NOTHING;

-- Create indexes for user_business_access
CREATE INDEX IF NOT EXISTS idx_user_business_access_user ON user_business_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_business_access_business ON user_business_access(business_id);

COMMENT ON TABLE users IS 'User accounts for feedback submission and authentication';
COMMENT ON TABLE user_business_access IS 'User access permissions to businesses';
