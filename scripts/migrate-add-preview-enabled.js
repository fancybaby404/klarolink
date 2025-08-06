#!/usr/bin/env node

/**
 * Migration script to add preview_enabled column to feedback_forms table
 * This script handles both PostgreSQL (Neon) and SQLite databases
 */

const { Client } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

async function migratePostgreSQL() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('🔗 Connected to PostgreSQL database');

    // Check if preview_enabled column already exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'feedback_forms' 
      AND column_name = 'preview_enabled'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('📝 Adding preview_enabled column to feedback_forms table...');
      
      // Add the column
      await client.query(`
        ALTER TABLE feedback_forms 
        ADD COLUMN preview_enabled BOOLEAN DEFAULT FALSE
      `);

      console.log('✅ Successfully added preview_enabled column to PostgreSQL database');
    } else {
      console.log('ℹ️  preview_enabled column already exists in PostgreSQL database');
    }

  } catch (error) {
    console.error('❌ PostgreSQL migration error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function migrateSQLite() {
  const dbPath = path.join(process.cwd(), 'klarolink.db');
  
  try {
    const db = new Database(dbPath);
    console.log('🔗 Connected to SQLite database');

    // Check if preview_enabled column already exists
    const tableInfo = db.prepare("PRAGMA table_info(feedback_forms)").all();
    const hasPreviewEnabled = tableInfo.some(col => col.name === 'preview_enabled');

    if (!hasPreviewEnabled) {
      console.log('📝 Adding preview_enabled column to feedback_forms table...');
      
      // Add the column
      db.prepare(`
        ALTER TABLE feedback_forms 
        ADD COLUMN preview_enabled BOOLEAN DEFAULT 0
      `).run();

      console.log('✅ Successfully added preview_enabled column to SQLite database');
    } else {
      console.log('ℹ️  preview_enabled column already exists in SQLite database');
    }

    db.close();
  } catch (error) {
    console.error('❌ SQLite migration error:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database migration: Add preview_enabled column');
  
  try {
    // Try PostgreSQL first (production/staging)
    if (process.env.DATABASE_URL) {
      console.log('🐘 Migrating PostgreSQL database...');
      await migratePostgreSQL();
    }

    // Always try SQLite (local development)
    console.log('🗃️  Migrating SQLite database...');
    await migrateSQLite();

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migratePostgreSQL, migrateSQLite };
