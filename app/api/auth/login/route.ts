import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyPassword, generateUserToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log(`🔐 Login attempt for email: ${email}`)

    // Find user by email
    const user = await getUserByEmail(email)
    if (!user) {
      console.log(`❌ User not found for email: ${email}`)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is active
    if (!user.is_active) {
      console.log(`❌ User account deactivated: ${email}`)
      return NextResponse.json({ error: "Account is deactivated" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      console.log(`❌ Invalid password for user: ${email}`)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateUserToken(user.id)

    console.log(`✅ Login successful for user: ${user.email} (ID: ${user.id})`)

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
