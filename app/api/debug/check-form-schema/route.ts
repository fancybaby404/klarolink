import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database-adapter'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const businessId = payload.businessId
    console.log(`🔍 FORM SCHEMA CHECK: Checking for business ID: ${businessId}`)

    // === STEP 1: Check feedback_forms table schema ===
    let tableSchema: any[] = []
    let schemaError = null

    try {
      if (db.query) {
        tableSchema = await db.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'feedback_forms' 
          ORDER BY ordinal_position
        `)
      }
    } catch (error: any) {
      schemaError = error.message
    }

    // === STEP 2: Check current form data ===
    let currentForm: any = null
    let formError = null

    try {
      if (db.query) {
        const formResult = await db.query(`
          SELECT id, business_id, title, description, is_active, preview_enabled, created_at, updated_at
          FROM feedback_forms 
          WHERE business_id = $1 
          ORDER BY id DESC 
          LIMIT 1
        `, [businessId])
        currentForm = formResult[0] || null
      }
    } catch (error: any) {
      formError = error.message
    }

    // === STEP 3: Test the API endpoints ===
    let statusApiTest: any = null
    let publishApiTest: any = null

    try {
      // Test status API
      const statusResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/forms/status/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (statusResponse.ok) {
        statusApiTest = await statusResponse.json()
      } else {
        statusApiTest = { error: `Status ${statusResponse.status}: ${statusResponse.statusText}` }
      }
    } catch (error: any) {
      statusApiTest = { error: error.message }
    }

    try {
      // Test publish API (toggle to current state to test without changing)
      const currentState = currentForm?.preview_enabled || false
      const publishResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/forms/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId,
          isPublished: currentState
        })
      })
      
      if (publishResponse.ok) {
        publishApiTest = await publishResponse.json()
      } else {
        publishApiTest = { error: `Status ${publishResponse.status}: ${publishResponse.statusText}` }
      }
    } catch (error: any) {
      publishApiTest = { error: error.message }
    }

    // === STEP 4: Check database adapter method ===
    let adapterTest: any = null
    let adapterError = null

    try {
      adapterTest = await db.getFeedbackForm(businessId)
    } catch (error: any) {
      adapterError = error.message
    }

    return NextResponse.json({
      businessId,
      
      // Database Schema
      schema: {
        columns: tableSchema,
        error: schemaError,
        hasPreviewEnabled: tableSchema.some(col => col.column_name === 'preview_enabled'),
        hasIsPublished: tableSchema.some(col => col.column_name === 'is_published')
      },
      
      // Current Form Data
      currentForm: {
        data: currentForm,
        error: formError,
        exists: !!currentForm,
        previewEnabled: currentForm?.preview_enabled,
        isActive: currentForm?.is_active
      },
      
      // API Tests
      apiTests: {
        status: statusApiTest,
        publish: publishApiTest
      },
      
      // Database Adapter Test
      adapterTest: {
        result: adapterTest,
        error: adapterError,
        previewEnabled: adapterTest?.preview_enabled
      },
      
      // Analysis
      analysis: {
        schemaCorrect: tableSchema.some(col => col.column_name === 'preview_enabled'),
        formExists: !!currentForm,
        statusApiWorking: !statusApiTest?.error,
        publishApiWorking: !publishApiTest?.error,
        adapterWorking: !adapterError,
        
        issues: [
          !tableSchema.some(col => col.column_name === 'preview_enabled') && "Missing preview_enabled column",
          !currentForm && "No form exists for this business",
          statusApiTest?.error && `Status API error: ${statusApiTest.error}`,
          publishApiTest?.error && `Publish API error: ${publishApiTest.error}`,
          adapterError && `Adapter error: ${adapterError}`
        ].filter(Boolean)
      },
      
      // Recommendations
      recommendations: [
        !currentForm && "Create a form first using the form builder",
        !tableSchema.some(col => col.column_name === 'preview_enabled') && "Run database migration to add preview_enabled column",
        statusApiTest?.error && "Check status API endpoint",
        publishApiTest?.error && "Check publish API endpoint"
      ].filter(Boolean),
      
      success: true
    })

  } catch (error: any) {
    console.error('❌ Form schema check error:', error)
    return NextResponse.json(
      { 
        error: 'Schema check failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
