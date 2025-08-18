#!/usr/bin/env node

const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_J1gloZUcFQS2@ep-still-truth-a1051s4o-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function migrateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database schema migration...');
    
    // Check and add missing columns to feedback_forms table
    console.log('📋 Checking feedback_forms table schema...');
    
    // Add preview_enabled column if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE feedback_forms 
        ADD COLUMN IF NOT EXISTS preview_enabled BOOLEAN DEFAULT false;
      `);
      console.log('✅ Added preview_enabled column to feedback_forms');
    } catch (error) {
      console.log('ℹ️ preview_enabled column already exists or error:', error.message);
    }
    
    // Add form_settings column if it doesn't exist (for future use)
    try {
      await client.query(`
        ALTER TABLE feedback_forms 
        ADD COLUMN IF NOT EXISTS form_settings JSONB DEFAULT '{}'::jsonb;
      `);
      console.log('✅ Added form_settings column to feedback_forms');
    } catch (error) {
      console.log('ℹ️ form_settings column already exists or error:', error.message);
    }
    
    // Check and add missing columns to businesses table
    console.log('📋 Checking businesses table schema...');
    
    // Add location column if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE businesses 
        ADD COLUMN IF NOT EXISTS location VARCHAR(255);
      `);
      console.log('✅ Added location column to businesses');
    } catch (error) {
      console.log('ℹ️ location column already exists or error:', error.message);
    }
    
    // Add submit button styling columns if they don't exist
    try {
      await client.query(`
        ALTER TABLE businesses 
        ADD COLUMN IF NOT EXISTS submit_button_color VARCHAR(7) DEFAULT '#CC79F0',
        ADD COLUMN IF NOT EXISTS submit_button_text_color VARCHAR(7) DEFAULT '#FDFFFA',
        ADD COLUMN IF NOT EXISTS submit_button_hover_color VARCHAR(7) DEFAULT '#3E7EF7';
      `);
      console.log('✅ Added submit button styling columns to businesses');
    } catch (error) {
      console.log('ℹ️ Submit button columns already exist or error:', error.message);
    }
    
    // Update existing forms to have preview_enabled = true for demo business
    console.log('📋 Updating existing forms...');
    
    const demoBusinessResult = await client.query(`
      SELECT id FROM businesses WHERE email = 'demo@klarolink.com' LIMIT 1;
    `);
    
    if (demoBusinessResult.rows.length > 0) {
      const businessId = demoBusinessResult.rows[0].id;
      
      await client.query(`
        UPDATE feedback_forms 
        SET preview_enabled = true 
        WHERE business_id = $1 AND preview_enabled IS NULL;
      `, [businessId]);
      
      console.log('✅ Updated demo business forms to enable preview');
    }
    
    // Verify the schema
    console.log('📋 Verifying database schema...');
    
    const feedbackFormsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'feedback_forms' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 feedback_forms table columns:');
    feedbackFormsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    const businessesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'businesses' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 businesses table columns:');
    businessesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    console.log('🎉 Database schema migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };
