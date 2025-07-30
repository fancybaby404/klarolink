import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-adapter"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing database connection...")
    
    // Test if DATABASE_URL is set
    const hasDbUrl = !!process.env.DATABASE_URL
    console.log("DATABASE_URL present:", hasDbUrl)
    
    if (hasDbUrl) {
      console.log("DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50) + "...")
    }
    
    // Try to get all businesses
    console.log("📊 Attempting to fetch all businesses...")
    
    // Since we don't have a getAllBusinesses method, let's try to get the demo business
    const demoBusiness = await db.getBusinessByEmail("demo@klarolink.com")
    
    return NextResponse.json({
      success: true,
      databaseUrl: hasDbUrl,
      demoBusiness: demoBusiness ? {
        id: demoBusiness.id,
        name: demoBusiness.name,
        email: demoBusiness.email,
        slug: demoBusiness.slug
      } : null,
      message: "Database connection test completed"
    })
  } catch (error) {
    console.error("❌ Database test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Database connection test failed"
    }, { status: 500 })
  }
}
