#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_J1gloZUcFQS2@ep-still-truth-a1051s4o-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database initialization...');
    
    // Create core tables (from the database_queries_v1.txt)
    console.log('📋 Creating core tables...');
    
    // Businesses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        profile_image TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        background_type VARCHAR(50) DEFAULT 'color',
        background_value VARCHAR(50) DEFAULT '#6366f1',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);`);
    
    // Feedback forms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback_forms (
        id SERIAL PRIMARY KEY,
        business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        title TEXT NOT NULL DEFAULT 'Feedback Form',
        description TEXT,
        fields JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feedback_forms_business_id ON feedback_forms(business_id);`);
    
    // Social links table
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        platform VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_social_links_business_id ON social_links(business_id);`);
    
    // Feedback submissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback_submissions (
        id SERIAL PRIMARY KEY,
        business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        form_id INT NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
        submission_data JSONB NOT NULL,
        submitted_at TIMESTAMP DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT
      );
    `);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feedback_submissions_business_id ON feedback_submissions(business_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feedback_submissions_form_id ON feedback_submissions(form_id);`);
    
    // Analytics events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT
      );
    `);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_analytics_events_business_id ON analytics_events(business_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);`);
    
    console.log('✅ Core tables created successfully');
    
    // Insert demo data
    console.log('📝 Inserting demo data...');
    
    // Create demo business
    const passwordHash = await bcrypt.hash('password123', 12);
    
    const businessResult = await client.query(`
      INSERT INTO businesses (name, email, password_hash, slug, background_type, background_value)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        updated_at = NOW()
      RETURNING id;
    `, ['Demo Business', 'demo@klarolink.com', passwordHash, 'demo-business', 'color', '#6366f1']);
    
    const businessId = businessResult.rows[0].id;
    console.log(`✅ Demo business created with ID: ${businessId}`);
    
    // Create default feedback form
    const defaultFields = [
      {
        id: "rating",
        type: "rating",
        label: "How would you rate your overall experience?",
        required: true
      },
      {
        id: "feedback",
        type: "textarea",
        label: "Tell us about your experience",
        required: false,
        placeholder: "Share your thoughts..."
      },
      {
        id: "name",
        type: "text",
        label: "Your Name (Optional)",
        required: false,
        placeholder: "Enter your name"
      },
      {
        id: "email",
        type: "email",
        label: "Email (Optional)",
        required: false,
        placeholder: "your@email.com"
      }
    ];
    
    // Check if feedback form already exists
    const existingForm = await client.query(`
      SELECT id FROM feedback_forms WHERE business_id = $1 LIMIT 1;
    `, [businessId]);

    if (existingForm.rows.length === 0) {
      await client.query(`
        INSERT INTO feedback_forms (business_id, title, description, fields, preview_enabled)
        VALUES ($1, $2, $3, $4, $5);
      `, [
        businessId,
        'Customer Feedback Form',
        'We value your feedback! Please share your experience with us.',
        JSON.stringify(defaultFields),
        true
      ]);
    }
    
    console.log('✅ Default feedback form created');
    
    // Create demo social links
    const socialLinks = [
      { platform: 'website', url: 'https://demo-business.com', display_order: 1 },
      { platform: 'instagram', url: 'https://instagram.com/demobusiness', display_order: 2 },
      { platform: 'twitter', url: 'https://twitter.com/demobusiness', display_order: 3 }
    ];
    
    for (const link of socialLinks) {
      await client.query(`
        INSERT INTO social_links (business_id, platform, url, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING;
      `, [businessId, link.platform, link.url, link.display_order, true]);
    }
    
    console.log('✅ Demo social links created');
    
    // Create some sample feedback submissions
    const sampleSubmissions = [
      {
        rating: 5,
        feedback: "Excellent service! Very satisfied with the experience.",
        name: "John Doe",
        email: "john@example.com"
      },
      {
        rating: 4,
        feedback: "Good overall experience, could improve response time.",
        name: "Jane Smith"
      },
      {
        rating: 5,
        feedback: "Outstanding quality and customer service!",
        name: "Mike Johnson",
        email: "mike@example.com"
      }
    ];
    
    const formResult = await client.query(`
      SELECT id FROM feedback_forms WHERE business_id = $1 LIMIT 1;
    `, [businessId]);
    
    if (formResult.rows.length > 0) {
      const formId = formResult.rows[0].id;
      
      for (const submission of sampleSubmissions) {
        await client.query(`
          INSERT INTO feedback_submissions (business_id, form_id, submission_data)
          VALUES ($1, $2, $3);
        `, [businessId, formId, JSON.stringify(submission)]);
      }
      
      console.log('✅ Sample feedback submissions created');
    }
    
    // Create analytics events
    const analyticsEvents = [
      { event_type: 'page_view', event_data: { page: 'feedback_form' } },
      { event_type: 'form_start', event_data: { form_id: formResult.rows[0]?.id } },
      { event_type: 'form_submit', event_data: { form_id: formResult.rows[0]?.id } },
      { event_type: 'page_view', event_data: { page: 'feedback_form' } },
      { event_type: 'page_view', event_data: { page: 'feedback_form' } }
    ];
    
    for (const event of analyticsEvents) {
      await client.query(`
        INSERT INTO analytics_events (business_id, event_type, event_data)
        VALUES ($1, $2, $3);
      `, [businessId, event.event_type, JSON.stringify(event.event_data)]);
    }
    
    console.log('✅ Sample analytics events created');
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('Demo login credentials:');
    console.log('Email: demo@klarolink.com');
    console.log('Password: password123');
    console.log('');
    console.log('You can now start the application and login with these credentials.');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
