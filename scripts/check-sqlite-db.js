#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'klarolink.db');

try {
  const db = new Database(dbPath);
  console.log('🔗 Connected to SQLite database');

  // List all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📋 Tables in database:', tables.map(t => t.name));

  // Check feedback_forms table structure if it exists
  if (tables.some(t => t.name === 'feedback_forms')) {
    const tableInfo = db.prepare("PRAGMA table_info(feedback_forms)").all();
    console.log('📝 feedback_forms table structure:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} (nullable: ${col.notnull === 0})`);
    });
  } else {
    console.log('❌ feedback_forms table does not exist');
  }

  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}
