#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

async function checkPreviewEnabledColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('🔗 Connected to PostgreSQL database');

    // Check if preview_enabled column exists
    const columnCheck = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'feedback_forms' 
      ORDER BY ordinal_position
    `);

    console.log('📝 feedback_forms table columns:');
    columnCheck.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default}, nullable: ${col.is_nullable})`);
    });

    const hasPreviewEnabled = columnCheck.rows.some(col => col.column_name === 'preview_enabled');
    
    if (hasPreviewEnabled) {
      console.log('✅ preview_enabled column exists');
      
      // Check some sample data
      const sampleData = await client.query(`
        SELECT id, business_id, title, preview_enabled 
        FROM feedback_forms 
        LIMIT 5
      `);
      
      console.log('\n📊 Sample feedback forms:');
      sampleData.rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Business: ${row.business_id}, Title: "${row.title}", Preview: ${row.preview_enabled}`);
      });
    } else {
      console.log('❌ preview_enabled column does NOT exist');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPreviewEnabledColumn();
