import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, generateUserToken, generateToken, getBusinessByEmail } from "@/lib/auth"
import bcrypt from "bcryptjs"

// Hardcoded test users as fallback
const TEST_USERS = [
  {
    id: 1,
    email: "admin@klarolink.com",
    password_hash: "$2b$12$xwA7rylJIw4ytjLLlCzbQeRWYcbr9LyMth.ZWtfzrQ6GnLM52fCzy", // password123
    first_name: "Admin",
    last_name: "User",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    email: "demo@klarolink.com",
    password_hash: "$2b$12$xwA7rylJIw4ytjLLlCzbQeRWYcbr9LyMth.ZWtfzrQ6GnLM52fCzy", // password123
    first_name: "Demo",
    last_name: "User",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    email: "john@example.com",
    password_hash: "$2b$12$xwA7rylJIw4ytjLLlCzbQeRWYcbr9LyMth.ZWtfzrQ6GnLM52fCzy", // password123
    first_name: "John",
    last_name: "Smith",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    email: "harinacookies@gmail.com",
    password_hash: "$2b$12$gvOzA1B4Pm4AfBjLLJzWC.Qu6cU7mCBIJiHJ5CJNPZ2b05q/OmBmK", // Original hash provided
    first_name: "Harina",
    last_name: "Cookies",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Try to find user via database first
    let user = await getUserByEmail(email)

    // If database lookup fails, use hardcoded test users as fallback
    if (!user) {
      user = TEST_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
    }

    // If user found, handle user login
    if (user) {
      // Note: We don't check is_active here because it refers to business preview status, not user account status

      // Check if password hash exists (could be password_hash or password field)
      const passwordHash = user.password_hash || (user as any).password
      if (!passwordHash) {
        console.log(`❌ No password hash found for user: ${email}`)
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      console.log(`🔍 Password hash from DB: ${passwordHash.substring(0, 20)}...`)
      console.log(`🔍 Input password: ${password}`)
      console.log(`🔍 Hash starts with $2b$: ${passwordHash.startsWith('$2b$')}`)

      // Verify password
      const isValidPassword = await bcrypt.compare(password, passwordHash)
      console.log(`🔍 Password comparison result: ${isValidPassword}`)

      if (!isValidPassword) {
        console.log(`❌ Invalid password for user: ${email}`)
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      // Generate JWT token for user
      const token = generateUserToken(user.id)

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
    }

    // If no user found, try to find business
    const business = await getBusinessByEmail(email)
    if (!business) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify business password
    const isValidBusinessPassword = await bcrypt.compare(password, business.password_hash)
    if (!isValidBusinessPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token for business
    const businessToken = generateToken(business.id)

    return NextResponse.json({
      message: "Login successful",
      token: businessToken,
      business: {
        id: business.id,
        email: business.email,
        name: business.name,
        slug: business.slug,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
