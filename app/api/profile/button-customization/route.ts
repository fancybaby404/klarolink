import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify business token (only businesses can manage button customization)
    const businessPayload = verifyToken(token)
    if (!businessPayload) {
      return NextResponse.json({ error: "Invalid business token" }, { status: 401 })
    }

    const businessId = businessPayload.businessId

    const { submit_button_color, submit_button_text_color, submit_button_hover_color } = await request.json()

    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    
    if (submit_button_color && !hexColorRegex.test(submit_button_color)) {
      return NextResponse.json({ error: "Invalid submit button color format" }, { status: 400 })
    }
    
    if (submit_button_text_color && !hexColorRegex.test(submit_button_text_color)) {
      return NextResponse.json({ error: "Invalid submit button text color format" }, { status: 400 })
    }
    
    if (submit_button_hover_color && !hexColorRegex.test(submit_button_hover_color)) {
      return NextResponse.json({ error: "Invalid submit button hover color format" }, { status: 400 })
    }

    // Update business with button customization
    const updatedBusiness = await db.updateBusiness(businessId, {
      submit_button_color,
      submit_button_text_color,
      submit_button_hover_color,
    })

    if (!updatedBusiness) {
      return NextResponse.json({ error: "Failed to update button customization" }, { status: 500 })
    }

    console.log(`✅ Button customization updated for business: ${updatedBusiness.name}`)

    return NextResponse.json({
      message: "Button customization updated successfully",
      business: {
        id: updatedBusiness.id,
        name: updatedBusiness.name,
        submit_button_color: updatedBusiness.submit_button_color,
        submit_button_text_color: updatedBusiness.submit_button_text_color,
        submit_button_hover_color: updatedBusiness.submit_button_hover_color,
      },
    })
  } catch (error) {
    console.error("Button customization update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
