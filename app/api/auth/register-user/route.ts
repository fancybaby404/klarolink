import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    console.log(`📝 User registration attempt for email: ${email}`)

    // Create user using the auth library function
    const newUser = await createUser({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    })

    console.log(`✅ User created successfully: ${email} with ID: ${newUser.id}`)

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        created_at: newUser.created_at,
      },
    })
  } catch (error: any) {
    console.error("❌ User registration error:", error)

    // Handle specific error messages from the auth library
    if (error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    if (error.message.includes("required") || error.message.includes("Invalid") || error.message.includes("must be")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
  }
}
