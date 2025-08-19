# Database Column Reference Fixes

## Problem Summary
The API routes were using incorrect column references that didn't match the actual database schema:
- SQL queries used `p.id` but the database table uses `product_id` as primary key
- SQL queries used `p.name` but the database table uses `product_name`
- SQL queries used `p.description` but the database table uses `product_description`
- SQL queries used `p.category` but the database table uses `product_category`

## Files Fixed

### 1. app/api/products/route.ts
**Changes made:**
- Fixed GET query to use correct column names with aliases
- Fixed INSERT query to use correct column names
- Updated RETURNING clause to return aliased columns

**Before:**
```sql
SELECT p.id, p.name, p.description, p.category
FROM products p
LEFT JOIN product_pricing pp ON p.id = pp.product_id
```

**After:**
```sql
SELECT p.product_id as id, p.product_name as name, p.product_description as description, p.product_category as category
FROM products p
LEFT JOIN product_pricing pp ON p.product_id = pp.product_id
```

### 2. app/api/products/[businessId]/route.ts
**Changes made:**
- Fixed GET query with JSON aggregation
- Fixed POST query for product insertion
- Fixed complete product query
- Updated all JOIN conditions to use `product_id`

**Key fixes:**
- Changed `p.id` to `p.product_id` in all SELECT and WHERE clauses
- Updated JOIN conditions: `ON p.product_id = pp.product_id`
- Added proper column aliases for consistent API response format
- Fixed GROUP BY clauses to include all selected columns

### 3. app/api/products/test/route.ts
**Changes made:**
- Fixed INSERT query to use correct column names
- Updated RETURNING clause with proper aliases

## Database Schema Alignment
The fixes align with your actual database schema:
```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    product_image TEXT,
    product_category VARCHAR(100),
    business_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing the Fixes
To verify the fixes work correctly, test these endpoints:
1. `GET /api/products?businessId=9`
2. `GET /api/products/9`
3. `POST /api/products` (with proper authentication)
4. `POST /api/products/9`

The PostgreSQL error "column p.id does not exist" should no longer occur.
