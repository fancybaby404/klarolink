import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-adapter'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Database Migration: Adding is_published column to feedback_forms table')

    // Check if we have a real database connection (not mock)
    if (!db.query) {
      console.log('📝 Database Migration: Using mock database - no migration needed')
      return NextResponse.json({
        success: true,
        message: 'Mock database - migration not required'
      })
    }

    // Check if the column already exists
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'feedback_forms'
      AND column_name = 'is_published'
    `

    const columnExists = await db.query(checkColumnQuery)

    if (columnExists.length > 0) {
      console.log('✅ Database Migration: is_published column already exists')
      return NextResponse.json({
        success: true,
        message: 'Column already exists'
      })
    }

    // Add the is_published column
    console.log('📝 Database Migration: Adding is_published column')

    const addColumnQuery = `
      ALTER TABLE feedback_forms
      ADD COLUMN is_published BOOLEAN DEFAULT false
    `

    await db.query(addColumnQuery)

    console.log('✅ Database Migration: is_published column added successfully')

    // Update existing forms to be published by default (optional)
    const updateExistingQuery = `
      UPDATE feedback_forms
      SET is_published = true
      WHERE is_published IS NULL
    `

    await db.query(updateExistingQuery)

    console.log('✅ Database Migration: Existing forms updated to published status')

    return NextResponse.json({
      success: true,
      message: 'is_published column added successfully'
    })

  } catch (error) {
    console.error('❌ Database Migration: Error adding is_published column:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
