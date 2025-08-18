-- Add unique constraint for email per business in customers table
-- This ensures that each email is unique within a business, but allows the same email across different businesses

-- First, remove any existing unique constraint on email alone
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_email_key;

-- Add a composite unique constraint for email + business_id
-- This allows the same email to exist for different businesses but not within the same business
ALTER TABLE customers ADD CONSTRAINT customers_email_business_unique 
UNIQUE (email, business_id);

-- Create an index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email_business ON customers(email, business_id);

-- Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'customers' 
    AND tc.constraint_type = 'UNIQUE';
