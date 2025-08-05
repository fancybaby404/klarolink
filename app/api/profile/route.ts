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
    const { name, profile_image } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 })
    }

    // Update business profile
    const updatedBusiness = await db.updateBusiness(payload.businessId, {
      name: name.trim(),
      profile_image: profile_image || null,
    })

    if (!updatedBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    console.log(`✅ Profile updated successfully for business: ${updatedBusiness.name}`)
    
    return NextResponse.json({ 
      success: true, 
      business: updatedBusiness 
    })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
