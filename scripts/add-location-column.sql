-- Migration to add location column to businesses table
-- This script works for both PostgreSQL (Neon) and SQLite

-- For PostgreSQL (Neon)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS location TEXT;

-- For SQLite (if using local database)
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we use a different approach
-- This will be handled in the init scripts for new databases

-- Update existing demo business with a sample location
UPDATE businesses 
SET location = 'San Francisco, CA' 
WHERE email = 'demo@klarolink.com' AND location IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN businesses.location IS 'Business location - can store city, state, or full address';
