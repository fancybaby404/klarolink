-- Database schema updates for Forms and Products functionality
-- Run these queries in your NEON database

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_image TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_pricing table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_pricing (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_reviews table for customer reviews
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add display_order column to feedback_forms if it doesn't exist
ALTER TABLE feedback_forms 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_pricing_updated_at ON product_pricing;
CREATE TRIGGER update_product_pricing_updated_at
    BEFORE UPDATE ON product_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(business_id, display_order);
CREATE INDEX IF NOT EXISTS idx_product_pricing_product_id ON product_pricing(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_business_id ON product_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_feedback_forms_display_order ON feedback_forms(business_id, display_order);

-- Insert sample products for testing (optional)
INSERT INTO products (business_id, name, description, category, display_order) VALUES
(1, 'Premium Face Cream', 'Luxurious anti-aging face cream with natural ingredients', 'Skincare', 1),
(1, 'Vitamin C Serum', 'Brightening serum with 20% Vitamin C', 'Skincare', 2),
(1, 'Hydrating Cleanser', 'Gentle cleanser for all skin types', 'Skincare', 3)
ON CONFLICT DO NOTHING;

-- Insert sample pricing for products (optional)
INSERT INTO product_pricing (product_id, price, currency, is_active) VALUES
(1, 89.99, 'USD', true),
(2, 45.99, 'USD', true),
(3, 29.99, 'USD', true)
ON CONFLICT DO NOTHING;
