import { NextRequest, NextResponse } from "next/server"
import { createCustomer, getBusinessBySlug } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phoneNumber, businessSlug, preferredContactMethod, address, dateOfBirth, gender } = await request.json()

    console.log(`📝 Customer registration attempt for email: ${email} in business: ${businessSlug}`)

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !businessSlug) {
      return NextResponse.json({ 
        error: "Email, password, first name, last name, and business are required" 
      }, { status: 400 })
    }

    // Get business by slug to get business_id
    const business = await getBusinessBySlug(businessSlug)
    if (!business) {
      return NextResponse.json({ 
        error: "Business not found" 
      }, { status: 404 })
    }

    // Create customer using the auth library function
    const newCustomer = await createCustomer({
      business_id: business.id,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      preferred_contact_method: preferredContactMethod || 'email',
      address,
      date_of_birth: dateOfBirth,
      gender
    })

    console.log(`✅ Customer created successfully: ${email} with ID: ${newCustomer.customer_id} for business: ${business.name}`)

    return NextResponse.json({
      message: "Customer registered successfully",
      customer: {
        id: newCustomer.customer_id,
        email: newCustomer.email,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        business_id: newCustomer.business_id,
        customer_status: newCustomer.customer_status,
        preferred_contact_method: newCustomer.preferred_contact_method,
        created_at: newCustomer.created_at,
        registration_date: newCustomer.registration_date,
      },
    })

  } catch (error) {
    console.error("❌ Customer registration failed:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Registration failed"
    
    // Handle specific error cases
    if (errorMessage.includes("already exists")) {
      return NextResponse.json({ 
        error: "A customer with this email already exists for this business" 
      }, { status: 409 })
    }
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 })
  }
}
