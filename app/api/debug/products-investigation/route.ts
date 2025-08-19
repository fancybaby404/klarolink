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
    console.log(`🔍 PRODUCTS INVESTIGATION: Checking products for business ID: ${businessId}`)

    // === STEP 1: Check if products table exists ===
    let tableExists = false
    let tableError = null
    let tableColumns: any[] = []

    try {
      if (db.query) {
        const tableCheck = await db.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'products'
          )`
        )
        tableExists = tableCheck[0].exists

        if (tableExists) {
          tableColumns = await db.query(
            `SELECT column_name, data_type, is_nullable 
             FROM information_schema.columns 
             WHERE table_name = 'products' 
             ORDER BY ordinal_position`
          )
        }
      }
    } catch (error: any) {
      tableError = error.message
    }

    // === STEP 2: Try direct SQL query to products table ===
    let directQueryResults: any[] = []
    let directQueryError = null

    try {
      if (db.query) {
        // Try to get ALL products regardless of business_id first
        directQueryResults = await db.query(`SELECT * FROM products LIMIT 10`)
        console.log(`📊 Direct query found ${directQueryResults.length} total products`)
      }
    } catch (error: any) {
      directQueryError = error.message
      console.error('❌ Direct products query failed:', error)
    }

    // === STEP 3: Try business-specific query ===
    let businessQueryResults: any[] = []
    let businessQueryError = null

    try {
      if (db.query) {
        businessQueryResults = await db.query(
          `SELECT * FROM products WHERE business_id = $1`,
          [businessId]
        )
        console.log(`📊 Business-specific query found ${businessQueryResults.length} products for business ${businessId}`)
      }
    } catch (error: any) {
      businessQueryError = error.message
      console.error('❌ Business products query failed:', error)
    }

    // === STEP 4: Test the database adapter method ===
    let adapterResults: any[] = []
    let adapterError = null

    try {
      adapterResults = await db.getProducts(businessId)
      console.log(`📊 Database adapter returned ${adapterResults.length} products`)
    } catch (error: any) {
      adapterError = error.message
      console.error('❌ Database adapter getProducts failed:', error)
    }

    // === STEP 5: Check all business IDs in products table ===
    let allBusinessIds: any[] = []
    let businessIdsError = null

    try {
      if (db.query) {
        allBusinessIds = await db.query(
          `SELECT DISTINCT business_id, COUNT(*) as product_count 
           FROM products 
           GROUP BY business_id 
           ORDER BY business_id`
        )
        console.log(`📊 Found products for business IDs:`, allBusinessIds)
      }
    } catch (error: any) {
      businessIdsError = error.message
    }

    // === STEP 6: Test API endpoint directly ===
    let apiTestError = null
    let apiTestResult = null

    try {
      // This simulates what the frontend does
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/product-management?businessId=${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        apiTestResult = await response.json()
      } else {
        apiTestError = `API returned ${response.status}: ${response.statusText}`
      }
    } catch (error: any) {
      apiTestError = error.message
    }

    return NextResponse.json({
      businessId,
      investigation: {
        // Database Table Check
        tableCheck: {
          exists: tableExists,
          error: tableError,
          columns: tableColumns,
          expectedColumns: [
            'product_id (SERIAL PRIMARY KEY)',
            'product_name (VARCHAR(255) NOT NULL)',
            'product_description (TEXT)',
            'product_category (VARCHAR(100))',
            'product_image (TEXT)',
            'business_id (should exist for filtering)'
          ]
        },

        // Direct SQL Queries
        directQuery: {
          totalProducts: directQueryResults.length,
          error: directQueryError,
          sampleProducts: directQueryResults.slice(0, 3).map(p => ({
            product_id: p.product_id,
            product_name: p.product_name,
            business_id: p.business_id,
            product_category: p.product_category
          }))
        },

        businessQuery: {
          productsForBusiness: businessQueryResults.length,
          error: businessQueryError,
          products: businessQueryResults.map(p => ({
            product_id: p.product_id,
            product_name: p.product_name,
            business_id: p.business_id,
            product_category: p.product_category
          }))
        },

        // Database Adapter Test
        adapterTest: {
          productsReturned: adapterResults.length,
          error: adapterError,
          products: adapterResults.slice(0, 3)
        },

        // Business ID Analysis
        businessIdAnalysis: {
          allBusinessIds: allBusinessIds,
          error: businessIdsError,
          yourBusinessIdHasProducts: allBusinessIds.some(b => b.business_id === businessId)
        },

        // API Endpoint Test
        apiTest: {
          error: apiTestError,
          result: apiTestResult
        }
      },

      // Diagnosis
      diagnosis: {
        tableExists: tableExists,
        hasProducts: directQueryResults.length > 0,
        hasProductsForYourBusiness: businessQueryResults.length > 0,
        adapterWorking: adapterResults.length > 0,
        possibleIssues: [
          !tableExists && "Products table does not exist",
          directQueryResults.length === 0 && "No products in database at all",
          businessQueryResults.length === 0 && directQueryResults.length > 0 && `No products for business_id ${businessId} (but products exist for other businesses)`,
          adapterResults.length === 0 && businessQueryResults.length > 0 && "Database adapter getProducts method is failing",
          apiTestError && `API endpoint error: ${apiTestError}`
        ].filter(Boolean)
      },

      // Recommendations
      recommendations: [
        tableExists ? "✅ Products table exists" : "❌ Create products table",
        directQueryResults.length > 0 ? "✅ Products exist in database" : "❌ Add products to database",
        businessQueryResults.length > 0 ? "✅ Products exist for your business" : `❌ Add products for business_id ${businessId}`,
        adapterResults.length > 0 ? "✅ Database adapter working" : "❌ Fix database adapter getProducts method",
        !apiTestError ? "✅ API endpoint working" : "❌ Fix API endpoint issues"
      ],

      success: true
    })

  } catch (error: any) {
    console.error('❌ Products investigation error:', error)
    return NextResponse.json(
      { 
        error: 'Investigation failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
