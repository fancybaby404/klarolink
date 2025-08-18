/**
 * Migration script to add field categorization to existing forms
 * This script safely migrates existing forms without breaking functionality
 */

const { Pool } = require('pg')

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
})

// Field categorization rules (simplified version of the TypeScript rules)
const CATEGORIZATION_RULES = {
  rating: {
    idPatterns: [
      /^rating$/i,
      /^overall[-_]?rating$/i,
      /^product[-_]?rating$/i,
      /^service[-_]?rating$/i,
      /^satisfaction[-_]?rating$/i,
      /^score$/i,
      /rating$/i,
      /score$/i
    ],
    labelPatterns: [
      /rate/i,
      /rating/i,
      /score/i,
      /stars?/i,
      /satisfaction/i,
      /satisfied/i
    ],
    fieldTypes: ['rating'],
    priority: 10
  },
  
  feedback_text: {
    idPatterns: [
      /^feedback$/i,
      /^comment$/i,
      /^message$/i,
      /^review$/i,
      /^experience$/i,
      /feedback$/i,
      /comment$/i,
      /experience$/i,
      /thoughts$/i,
      /message$/i
    ],
    labelPatterns: [
      /feedback/i,
      /comment/i,
      /message/i,
      /review/i,
      /experience/i,
      /thoughts/i,
      /tell us/i,
      /describe/i
    ],
    fieldTypes: ['textarea'],
    priority: 9
  },

  contact: {
    idPatterns: [
      /^email$/i,
      /^contact[-_]?email$/i,
      /^phone$/i
    ],
    labelPatterns: [
      /email/i,
      /phone/i,
      /contact/i
    ],
    fieldTypes: ['email'],
    priority: 4
  },

  personal_info: {
    idPatterns: [
      /^name$/i,
      /^full[-_]?name$/i,
      /^customer[-_]?name$/i
    ],
    labelPatterns: [
      /name/i,
      /your name/i
    ],
    fieldTypes: ['text'],
    priority: 5
  }
}

function categorizeField(field) {
  const fieldId = field.id.toLowerCase()
  const fieldLabel = (field.label || '').toLowerCase()
  const fieldType = field.type

  let bestMatch = {
    category: 'custom',
    priority: 1,
    confidence: 0.1
  }

  // Check each category's rules
  for (const [category, rules] of Object.entries(CATEGORIZATION_RULES)) {
    let confidence = 0
    let matches = 0

    // Check ID patterns
    for (const pattern of rules.idPatterns) {
      if (pattern.test(fieldId)) {
        matches++
        confidence += 0.4
      }
    }

    // Check label patterns
    for (const pattern of rules.labelPatterns) {
      if (pattern.test(fieldLabel)) {
        matches++
        confidence += 0.3
      }
    }

    // Check field type
    if (rules.fieldTypes.includes(fieldType)) {
      matches++
      confidence += 0.3
    }

    // Normalize confidence score
    if (matches > 0) {
      confidence = Math.min(confidence, 1.0)
      
      // Boost confidence if multiple criteria match
      if (matches > 1) {
        confidence = Math.min(confidence * 1.2, 1.0)
      }

      // If this is a better match, use it
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          category,
          priority: rules.priority,
          confidence
        }
      }
    }
  }

  return bestMatch
}

async function migrateForms() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Starting field categorization migration...')
    
    // Get all active forms
    const formsResult = await client.query(
      'SELECT id, fields FROM feedback_forms WHERE is_active = true'
    )
    
    console.log(`📋 Found ${formsResult.rows.length} active forms to migrate`)
    
    let migratedCount = 0
    let errorCount = 0
    
    for (const form of formsResult.rows) {
      try {
        console.log(`\n📝 Processing form ID: ${form.id}`)
        
        // Parse form fields
        let fields
        try {
          fields = typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields
        } catch (parseError) {
          console.error(`❌ Failed to parse fields for form ${form.id}:`, parseError.message)
          errorCount++
          continue
        }
        
        if (!Array.isArray(fields)) {
          console.warn(`⚠️ Form ${form.id} has invalid fields structure, skipping`)
          continue
        }
        
        console.log(`   Fields found: ${fields.length}`)
        
        // Clear existing categorizations for this form
        await client.query(
          'DELETE FROM field_categorizations WHERE form_id = $1',
          [form.id]
        )
        
        // Categorize each field
        let categorizedFields = 0
        for (const field of fields) {
          if (!field.id || !field.type) {
            console.warn(`   ⚠️ Skipping invalid field:`, field)
            continue
          }
          
          const categorization = categorizeField(field)
          
          console.log(`   📊 Field "${field.id}" -> ${categorization.category} (confidence: ${categorization.confidence.toFixed(2)})`)
          
          // Insert categorization
          await client.query(`
            INSERT INTO field_categorizations (
              form_id, field_id, field_category, priority, confidence, auto_categorized
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            form.id,
            field.id,
            categorization.category,
            categorization.priority,
            categorization.confidence,
            true
          ])
          
          categorizedFields++
        }
        
        console.log(`   ✅ Categorized ${categorizedFields} fields for form ${form.id}`)
        migratedCount++
        
      } catch (formError) {
        console.error(`❌ Error processing form ${form.id}:`, formError.message)
        errorCount++
      }
    }
    
    console.log(`\n🎉 Migration completed!`)
    console.log(`   ✅ Successfully migrated: ${migratedCount} forms`)
    console.log(`   ❌ Errors encountered: ${errorCount} forms`)
    
    // Verify migration
    const categorizedCount = await client.query(
      'SELECT COUNT(*) as count FROM field_categorizations'
    )
    
    console.log(`   📊 Total field categorizations created: ${categorizedCount.rows[0].count}`)
    
    // Show categorization breakdown
    const breakdown = await client.query(`
      SELECT field_category, COUNT(*) as count 
      FROM field_categorizations 
      GROUP BY field_category 
      ORDER BY count DESC
    `)
    
    console.log('\n📈 Categorization breakdown:')
    for (const row of breakdown.rows) {
      console.log(`   ${row.field_category}: ${row.count} fields`)
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message)
    throw error
  } finally {
    client.release()
  }
}

async function verifyMigration() {
  const client = await pool.connect()
  
  try {
    console.log('\n🔍 Verifying migration...')
    
    // Test extraction on a few submissions
    const testSubmissions = await client.query(`
      SELECT fs.id, fs.form_id, fs.submission_data
      FROM feedback_submissions fs
      JOIN feedback_forms ff ON fs.form_id = ff.id
      WHERE ff.is_active = true
      LIMIT 5
    `)
    
    console.log(`Testing extraction on ${testSubmissions.rows.length} submissions...`)
    
    for (const submission of testSubmissions.rows) {
      try {
        // Test the database function
        const result = await client.query(
          'SELECT get_categorized_submission_data($1, $2) as categorized_data',
          [submission.submission_data, submission.form_id]
        )
        
        const categorizedData = result.rows[0].categorized_data
        console.log(`   Submission ${submission.id}: rating=${categorizedData.rating}, has_feedback=${!!categorizedData.feedback_text}`)
        
      } catch (extractError) {
        console.warn(`   ⚠️ Extraction failed for submission ${submission.id}:`, extractError.message)
      }
    }
    
    console.log('✅ Migration verification completed')
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  } finally {
    client.release()
  }
}

// Main execution
async function main() {
  try {
    await migrateForms()
    await verifyMigration()
    console.log('\n🎊 All done! Field categorization system is ready.')
  } catch (error) {
    console.error('💥 Migration script failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { migrateForms, verifyMigration }
