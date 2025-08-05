import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { background_type, background_value } = body

    // Validate required fields
    if (!background_type || !background_value) {
      return NextResponse.json({ error: "Background type and value are required" }, { status: 400 })
    }

    // Validate background type
    if (!["color", "image"].includes(background_type)) {
      return NextResponse.json({ error: "Background type must be 'color' or 'image'" }, { status: 400 })
    }

    // Update business background
    const updatedBusiness = await db.updateBusiness(payload.businessId, {
      background_type,
      background_value,
    })

    if (!updatedBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    console.log(`✅ Background updated successfully for business: ${updatedBusiness.name}`)
    
    return NextResponse.json({ 
      success: true, 
      business: updatedBusiness 
    })
  } catch (error) {
    console.error("Background API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
