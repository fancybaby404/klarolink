-- Test Users for Feedback System
-- This script adds test users to the users table
-- Note: Your current users table structure uses 'username' instead of 'email'
-- Adjust column names as needed based on your actual table structure

-- First, let's see what columns exist in your users table
-- Run this query first to check your table structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';

-- Based on your actual table structure: email, username, password, role, created_at, first_name, last_name
-- Your table uses 'password' column (not 'password_hash') and has both 'email' and 'username'

INSERT INTO users (email, username, password, first_name, last_name, role, created_at) VALUES
('user5@example.com', 'user5@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'John', 'Doe', 'user', NOW()),
('user6@example.com', 'user6@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'Jane', 'Smith', 'user', NOW()),
('user7@example.com', 'user7@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'Bob', 'Johnson', 'user', NOW()),
('admin@example.com', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'Admin', 'User', 'admin', NOW()),
('test@test.com', 'test@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'Test', 'User', 'user', NOW());

-- Alternative: If you want to update existing users instead of inserting new ones
-- UPDATE users SET password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O' WHERE email = 'user3@example.com';

-- Password Information:
-- All test users have the password: "password123"
-- The hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O
-- This was generated using bcryptjs with salt rounds = 12

-- Test Login Credentials:
-- Email: user1@example.com, Password: password123
-- Email: user2@example.com, Password: password123  
-- Email: user3@example.com, Password: password123
-- Email: admin@example.com, Password: password123
-- Email: test@test.com, Password: password123

-- To verify the table structure, run:
-- \d users;
-- or
-- DESCRIBE users;
-- or  
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
