import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { databaseAdapter } from "@/lib/database-adapter"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    console.log(`📝 User registration attempt for email: ${email}`)

    // Check if user already exists
    try {
      const existingUser = await databaseAdapter.getUserByEmail(email)
      if (existingUser) {
        console.log(`❌ User already exists: ${email}`)
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
      }
    } catch (error) {
      console.log(`🔍 User lookup failed (expected for new users):`, error)
    }

    // Hash password with same settings as login system
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    console.log(`🔐 Password hashed for user: ${email}`)

    // Create user in database using the actual table structure
    try {
      // Based on your table structure: email, username, password, first_name, last_name, role, created_at
      const result = await databaseAdapter.query(`
        INSERT INTO users (email, username, password, first_name, last_name, role, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
        RETURNING id, email, first_name, last_name, created_at
      `, [email, email, passwordHash, firstName, lastName, 'user'])

      if (result.length > 0) {
        const newUser = result[0]
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
      } else {
        throw new Error("Failed to create user - no result returned")
      }
    } catch (dbError: any) {
      console.error("❌ Database error during user creation:", dbError)
      
      // Handle specific database errors
      if (dbError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
      }
      
      if (dbError.code === '42703') { // Column does not exist
        console.log("🔍 Column structure mismatch, trying alternative insert...")
        
        // Try alternative column structure if password_hash is used instead of password
        try {
          const altResult = await databaseAdapter.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role, created_at) 
            VALUES ($1, $2, $3, $4, $5, NOW()) 
            RETURNING id, email, first_name, last_name, created_at
          `, [email, passwordHash, firstName, lastName, 'user'])
          
          if (altResult.length > 0) {
            const newUser = altResult[0]
            console.log(`✅ User created with alternative structure: ${email}`)
            
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
          }
        } catch (altError) {
          console.error("❌ Alternative insert also failed:", altError)
        }
      }
      
      // Handle other database errors
      if (dbError.code === '42P01') { // Table does not exist
        return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
      }
      
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ User registration route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
