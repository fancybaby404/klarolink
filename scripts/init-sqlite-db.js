#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'klarolink.db');

try {
  // Remove existing database if it exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️  Removed existing database');
  }

  const db = new Database(dbPath);
  console.log('🔗 Created new SQLite database');

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create businesses table
  db.exec(`
    CREATE TABLE businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_image TEXT,
      slug TEXT UNIQUE NOT NULL,
      background_type TEXT DEFAULT 'color',
      background_value TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create feedback_forms table with preview_enabled column
  db.exec(`
    CREATE TABLE feedback_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT 'Feedback Form',
      description TEXT,
      fields TEXT NOT NULL DEFAULT '[]',
      is_active BOOLEAN DEFAULT 1,
      preview_enabled BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
  `);

  // Create social_links table
  db.exec(`
    CREATE TABLE social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
  `);

  // Create feedback_submissions table
  db.exec(`
    CREATE TABLE feedback_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      form_id INTEGER NOT NULL,
      submission_data TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
      FOREIGN KEY (form_id) REFERENCES feedback_forms (id) ON DELETE CASCADE
    );
  `);

  // Create analytics_events table
  db.exec(`
    CREATE TABLE analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Created all tables successfully');

  // Insert demo business
  const insertBusiness = db.prepare(`
    INSERT INTO businesses (name, email, password_hash, slug, background_type, background_value)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const businessId = insertBusiness.run(
    'Demo Business',
    'demo@klarolink.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
    'demo-business',
    'color',
    '#6366f1'
  ).lastInsertRowid;

  console.log(`✅ Created demo business with ID: ${businessId}`);

  // Insert demo feedback form
  const defaultFields = [
    {
      id: "name",
      type: "text",
      label: "Your Name",
      required: true,
      placeholder: "Enter your name"
    },
    {
      id: "email",
      type: "email",
      label: "Email Address",
      required: false,
      placeholder: "your@email.com"
    },
    {
      id: "rating",
      type: "rating",
      label: "Overall Rating",
      required: true
    },
    {
      id: "feedback",
      type: "textarea",
      label: "Your Feedback",
      required: true,
      placeholder: "Tell us about your experience..."
    }
  ];

  const insertForm = db.prepare(`
    INSERT INTO feedback_forms (business_id, title, description, fields, preview_enabled)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertForm.run(
    businessId,
    'Customer Feedback',
    'We value your feedback! Please share your experience with us.',
    JSON.stringify(defaultFields),
    0
  );

  console.log('✅ Created demo feedback form');

  // Insert demo social links
  const insertSocialLink = db.prepare(`
    INSERT INTO social_links (business_id, platform, url, display_order)
    VALUES (?, ?, ?, ?)
  `);

  insertSocialLink.run(businessId, 'website', 'https://demo-business.com', 1);
  insertSocialLink.run(businessId, 'instagram', 'https://instagram.com/demobusiness', 2);
  insertSocialLink.run(businessId, 'twitter', 'https://twitter.com/demobusiness', 3);

  console.log('✅ Created demo social links');

  db.close();
  console.log('🎉 SQLite database initialization completed successfully!');
  console.log('\nDemo login credentials:');
  console.log('Email: demo@klarolink.com');
  console.log('Password: password123');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
