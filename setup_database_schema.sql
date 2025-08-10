-- KlaroLink Database Schema Setup
-- Run this in your Neon SQL console

-- Create users table (for feedback submitters)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create businesses table (for business owners who login to manage their feedback forms)
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255),
    background_type VARCHAR(50) DEFAULT 'color',
    background_value VARCHAR(255) DEFAULT '#6366f1',
    submit_button_color VARCHAR(7) DEFAULT '#CC79F0',
    submit_button_text_color VARCHAR(7) DEFAULT '#FDFFFA',
    submit_button_hover_color VARCHAR(7) DEFAULT '#3E7EF7',
    preview_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
