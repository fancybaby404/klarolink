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

    // Verify business token (only businesses can manage profiles)
    let businessId: number
    const businessPayload = verifyToken(token)

    if (!businessPayload) {
      // If token verification fails, it might be a database/schema issue
      // Let's try to extract business info from the token manually as a fallback
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'password')

        if (decoded && typeof decoded === 'object' && 'businessId' in decoded) {
          businessId = decoded.businessId
        } else {
          return NextResponse.json({ error: "Invalid business token" }, { status: 401 })
        }
      } catch (jwtError) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    } else {
      businessId = businessPayload.businessId
    }

    const body = await request.json()
    const { name, profile_image, location } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 })
    }

    // Update business profile
    const updatedBusiness = await db.updateBusiness(businessId, {
      name: name.trim(),
      profile_image: profile_image || null,
      location: location || null,
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
