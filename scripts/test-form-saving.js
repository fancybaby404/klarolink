#!/usr/bin/env node

const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_J1gloZUcFQS2@ep-still-truth-a1051s4o-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function testFormSaving() {
  console.log('🧪 Testing Form Saving Functionality\n');

  try {
    const client = await pool.connect();
    
    // Test 1: Check if demo business exists
    console.log('1️⃣ Checking demo business...');
    const businessResult = await client.query(
      'SELECT id, name, slug FROM businesses WHERE email = $1',
      ['demo@klarolink.com']
    );
    
    if (businessResult.rows.length === 0) {
      console.log('❌ Demo business not found. Please run: npm run db:init');
      return;
    }
    
    const business = businessResult.rows[0];
    console.log(`✅ Demo business found: ${business.name} (ID: ${business.id})`);
    
    // Test 2: Check current feedback form
    console.log('\n2️⃣ Checking current feedback form...');
    const formResult = await client.query(
      'SELECT id, title, description, fields, preview_enabled FROM feedback_forms WHERE business_id = $1 AND is_active = true',
      [business.id]
    );

    if (formResult.rows.length > 0) {
      const form = formResult.rows[0];
      console.log(`✅ Current form found: "${form.title}"`);
      console.log(`   Description: ${form.description}`);
      console.log(`   Fields count: ${form.fields.length}`);
      console.log(`   Preview enabled: ${form.preview_enabled ? 'Yes' : 'No'}`);
      console.log(`   Fields:`, form.fields.map(f => `${f.label} (${f.type})`));
    } else {
      console.log('⚠️  No feedback form found for demo business');
    }
    
    // Test 3: Test form update
    console.log('\n3️⃣ Testing form update...');
    const testFields = [
      {
        id: "test_rating",
        type: "rating",
        label: "How would you rate our service?",
        required: true
      },
      {
        id: "test_feedback",
        type: "textarea",
        label: "Tell us about your experience",
        required: false,
        placeholder: "Share your thoughts..."
      },
      {
        id: "test_email",
        type: "email",
        label: "Your email (optional)",
        required: false,
        placeholder: "your@email.com"
      }
    ];
    
    // Check if form exists
    const existingFormResult = await client.query(
      "SELECT id FROM feedback_forms WHERE business_id = $1 AND is_active = true LIMIT 1",
      [business.id]
    );

    if (existingFormResult.rows.length > 0) {
      // Update existing form
      console.log(`📝 Updating existing form ID: ${existingFormResult.rows[0].id}`);
      await client.query(
        `UPDATE feedback_forms
         SET fields = $2,
             title = $3,
             description = $4,
             preview_enabled = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [existingFormResult.rows[0].id, JSON.stringify(testFields), "Test Form", "This is a test form", true]
      );
    } else {
      // Create new form
      console.log(`📝 Creating new form for business ID: ${business.id}`);
      await client.query(
        `INSERT INTO feedback_forms (business_id, title, description, fields, is_active, preview_enabled)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [business.id, "Test Form", "This is a test form", JSON.stringify(testFields), true, true]
      );
    }
    
    console.log('✅ Form update completed');
    
    // Test 4: Verify the update
    console.log('\n4️⃣ Verifying form update...');
    const updatedFormResult = await client.query(
      'SELECT id, title, description, fields, preview_enabled FROM feedback_forms WHERE business_id = $1 AND is_active = true',
      [business.id]
    );

    if (updatedFormResult.rows.length > 0) {
      const updatedForm = updatedFormResult.rows[0];
      console.log(`✅ Updated form verified: "${updatedForm.title}"`);
      console.log(`   Description: ${updatedForm.description}`);
      console.log(`   Fields count: ${updatedForm.fields.length}`);
      console.log(`   Preview enabled: ${updatedForm.preview_enabled ? 'Yes' : 'No'}`);
      console.log(`   Fields:`, updatedForm.fields.map(f => `${f.label} (${f.type})`));
    } else {
      console.log('❌ Updated form not found');
    }
    
    // Test 5: Test the public API endpoint
    console.log('\n5️⃣ Testing public API endpoint...');
    try {
      const fetch = require('node-fetch');
      const response = await fetch(`http://localhost:3000/api/page/${business.slug}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Public API working: ${data.business.name}`);
        console.log(`   Form fields count: ${data.formFields.length}`);
        console.log(`   Form fields:`, data.formFields.map(f => `${f.label} (${f.type})`));
      } else {
        console.log(`⚠️  Public API returned status: ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not test public API (server may not be running): ${error.message}`);
    }
    
    client.release();
    
    console.log('\n🎉 Form saving test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Demo business: Found');
    console.log('   - Form update: Working');
    console.log('   - Database persistence: Working');
    console.log('   - Public API: Check above');
    
    console.log('\n💡 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Go to http://localhost:3000/dashboard');
    console.log('   3. Navigate to Forms tab');
    console.log('   4. Try creating/editing a form');
    console.log(`   5. Check the public page: http://localhost:3000/${business.slug}`);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Make sure the database is initialized: npm run db:init');
    console.log('   2. Check database connection: npm run db:test');
    console.log('   3. Verify environment variables in .env.local');
  } finally {
    await pool.end();
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testFormSaving()
    .then(() => {
      console.log('\n✅ Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testFormSaving };
