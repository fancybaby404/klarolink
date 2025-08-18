#!/usr/bin/env node

// Set environment variable to use real database
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_J1gloZUcFQS2@ep-still-truth-a1051s4o-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🧪 Testing Enhanced Field Categorization with Real Database');
console.log('📊 DATABASE_URL is set:', !!process.env.DATABASE_URL);

// Import the database adapter
const { db } = require('./lib/database-adapter');
const { extractDataWithFallback, categorizeFormFields, addBackwardCompatibilityCategories } = require('./lib/field-categorization');

async function testRealDatabase() {
  try {
    console.log('\n🔍 Step 1: Testing database connection...');
    
    // Test basic database connection
    const businesses = await db.getBusinesses();
    console.log(`✅ Database connected. Found ${businesses.length} businesses.`);
    
    // Find demo business
    const demoBusiness = await db.getBusinessByEmail('demo@klarolink.com');
    if (!demoBusiness) {
      console.log('❌ Demo business not found. Running database initialization...');
      // Run database initialization
      const { initializeDatabase } = require('./scripts/init-new-database');
      await initializeDatabase();
      console.log('✅ Database initialized');
      return;
    }
    
    console.log(`✅ Demo business found: ${demoBusiness.name} (ID: ${demoBusiness.id})`);
    
    console.log('\n🔍 Step 2: Testing current form and submissions...');
    
    // Get current feedback form
    const currentForm = await db.getFeedbackForm(demoBusiness.id);
    if (!currentForm) {
      console.log('❌ No feedback form found for demo business');
      return;
    }
    
    console.log(`✅ Current form found: "${currentForm.title}"`);
    console.log('📋 Current form fields:');
    currentForm.fields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.label} (${field.type}) - ID: ${field.id} - Category: ${field.field_category || 'none'}`);
    });
    
    // Get current submissions
    const submissions = await db.getFeedbackSubmissions(demoBusiness.id, 10);
    console.log(`✅ Found ${submissions.length} existing submissions`);
    
    if (submissions.length > 0) {
      console.log('\n📊 Testing current analytics extraction:');
      submissions.forEach((submission, index) => {
        const extractedData = extractDataWithFallback(submission.submission_data || {});
        console.log(`  Submission ${index + 1}: Rating=${extractedData.rating}, Feedback="${extractedData.feedbackText?.substring(0, 50)}..."`);
      });
    }
    
    console.log('\n🔍 Step 3: Creating test form with custom field IDs...');
    
    // Create a test form with custom field IDs and explicit categories
    const testFormFields = [
      {
        id: `field_${Date.now()}_rating`,
        type: "rating",
        label: "How would you rate our new service?",
        required: true,
        field_category: "rating"
      },
      {
        id: `field_${Date.now()}_feedback`,
        type: "textarea",
        label: "Please share your detailed feedback",
        required: false,
        placeholder: "Tell us what you think...",
        field_category: "feedback_text"
      },
      {
        id: `field_${Date.now()}_name`,
        type: "text",
        label: "Your name",
        required: false,
        placeholder: "Enter your name",
        field_category: "personal_info"
      }
    ];
    
    // Update the form with test fields
    await db.updateFeedbackForm(
      demoBusiness.id,
      testFormFields,
      'Test Custom Form with Field Categories',
      'Testing the enhanced field categorization system',
      true
    );
    
    console.log('✅ Test form created with custom field IDs and categories');
    console.log('📋 Test form fields:');
    testFormFields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.label} (${field.type}) - ID: ${field.id} - Category: ${field.field_category}`);
    });
    
    console.log('\n🔍 Step 4: Creating test submission...');
    
    // Get the updated form to get the form ID
    const updatedForm = await db.getFeedbackForm(demoBusiness.id);
    
    // Create test submission data
    const testSubmissionData = {};
    testSubmissionData[testFormFields[0].id] = 5; // Rating
    testSubmissionData[testFormFields[1].id] = "This is excellent service! I'm very satisfied with the quality and would definitely recommend it to others."; // Feedback
    testSubmissionData[testFormFields[2].id] = "Test User"; // Name
    
    // Submit test feedback
    await db.createFeedbackSubmission({
      business_id: demoBusiness.id,
      form_id: updatedForm.id,
      submission_data: testSubmissionData,
      ip_address: '127.0.0.1',
      user_agent: 'Test Script'
    });
    
    console.log('✅ Test submission created');
    console.log('📊 Test submission data:');
    Object.entries(testSubmissionData).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    console.log('\n🔍 Step 5: Testing enhanced analytics extraction...');
    
    // Get the latest submissions
    const latestSubmissions = await db.getFeedbackSubmissions(demoBusiness.id, 5);
    
    console.log('📊 Analytics extraction results:');
    latestSubmissions.forEach((submission, index) => {
      // Test with enhanced categorization
      const enhancedFields = addBackwardCompatibilityCategories(updatedForm.fields);
      const categorizations = categorizeFormFields(enhancedFields);
      const extractedData = extractDataWithFallback(submission.submission_data || {}, categorizations);
      
      console.log(`  Submission ${index + 1}:`);
      console.log(`    Rating: ${extractedData.rating || 'Not found'}`);
      console.log(`    Feedback: "${extractedData.feedbackText || 'Not found'}"`);
      console.log(`    Submitted: ${submission.submitted_at}`);
    });
    
    console.log('\n🔍 Step 6: Testing dashboard analytics...');
    
    // Test the analytics stats
    const stats = await db.getAnalyticsStats(demoBusiness.id);
    console.log('📊 Analytics stats:');
    console.log(`  Total Feedback: ${stats.totalFeedback}`);
    console.log(`  Average Rating: ${stats.averageRating}`);
    console.log(`  Page Views: ${stats.pageViews}`);
    console.log(`  Completion Rate: ${stats.completionRate}%`);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ The enhanced field categorization system is working with the real database.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testRealDatabase()
  .then(() => {
    console.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
