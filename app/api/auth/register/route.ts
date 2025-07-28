import { type NextRequest, NextResponse } from "next/server"
import { hashPassword, createBusiness, getBusinessByEmail } from "@/lib/auth"
import { generateSlug } from "@/lib/utils"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, profileImage } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if business already exists
    const existingBusiness = await getBusinessByEmail(email)
    if (existingBusiness) {
      return NextResponse.json({ error: "A business with this email already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate unique slug
    const slug = generateSlug(name)
    let finalSlug = slug
    let counter = 1

    // Ensure slug is unique
    while (true) {
      try {
        const business = await createBusiness({
          name,
          email,
          password_hash: passwordHash,
          slug: finalSlug,
          profile_image: profileImage,
        })

        // Generate JWT token
        const token = generateToken(business.id)

        return NextResponse.json({
          message: "Business registered successfully",
          token,
          business: {
            id: business.id,
            name: business.name,
            email: business.email,
            slug: business.slug,
          },
        })
      } catch (error) {
        // If slug already exists, try with counter
        counter++
        finalSlug = `${slug}-${counter}`
        if (counter > 100) {
          throw new Error("Unable to generate unique slug")
        }
      }
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
