import { NextRequest, NextResponse } from "next/server"
import { getCustomerByEmail, getBusinessBySlug, verifyPassword, generateCustomerToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessSlug } = await request.json()

    console.log(`🔐 Customer login attempt for email: ${email} in business: ${businessSlug}`)

    // Validate input
    if (!email || !password || !businessSlug) {
      return NextResponse.json({ 
        error: "Email, password, and business are required" 
      }, { status: 400 })
    }

    // Get business by slug to get business_id
    const business = await getBusinessBySlug(businessSlug)
    if (!business) {
      return NextResponse.json({ 
        error: "Business not found" 
      }, { status: 404 })
    }

    // Find customer by email and business
    const customer = await getCustomerByEmail(email, business.id)
    if (!customer) {
      console.log(`❌ Customer not found: ${email} for business: ${business.name}`)
      return NextResponse.json({ 
        error: "Invalid email or password" 
      }, { status: 401 })
    }

    // Check if customer is active
    if (customer.customer_status !== 'active') {
      console.log(`❌ Customer account is inactive: ${email}`)
      return NextResponse.json({ 
        error: "Account is inactive. Please contact support." 
      }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, customer.password)
    if (!isValidPassword) {
      console.log(`❌ Invalid password for customer: ${email}`)
      return NextResponse.json({ 
        error: "Invalid email or password" 
      }, { status: 401 })
    }

    // Generate JWT token for customer
    const token = generateCustomerToken(customer.customer_id)

    console.log(`✅ Customer login successful: ${email} (ID: ${customer.customer_id})`)

    return NextResponse.json({
      message: "Login successful",
      token,
      customer: {
        id: customer.customer_id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        business_id: customer.business_id,
        customer_status: customer.customer_status,
        preferred_contact_method: customer.preferred_contact_method,
      },
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
      }
    })

  } catch (error) {
    console.error("❌ Customer login failed:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Login failed"
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 })
  }
}
