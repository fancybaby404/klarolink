import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data to test the new products selection interface
    const mockProducts = [
      {
        id: 1,
        business_id: 9,
        name: "Premium Face Cream",
        description: "Luxurious anti-aging face cream with natural ingredients. Perfect for daily skincare routine.",
        product_image: "/placeholder.svg?height=200&width=200",
        category: "Skincare",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        business_id: 9,
        name: "Vitamin C Serum",
        description: "Brightening serum with 20% Vitamin C. Helps reduce dark spots and improve skin texture.",
        product_image: "/placeholder.svg?height=200&width=200",
        category: "Skincare",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        business_id: 9,
        name: "Hydrating Cleanser",
        description: "Gentle cleanser for all skin types. Removes makeup and impurities without stripping natural oils.",
        product_image: "/placeholder.svg?height=200&width=200",
        category: "Skincare",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 4,
        business_id: 9,
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
        product_image: "/placeholder.svg?height=200&width=200",
        category: "Electronics",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 5,
        business_id: 9,
        name: "Organic Coffee Beans",
        description: "Premium organic coffee beans sourced from sustainable farms. Rich, full-bodied flavor.",
        product_image: "/placeholder.svg?height=200&width=200",
        category: "Food & Beverage",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 6,
        business_id: 9,
        name: "Yoga Mat",
        description: "Non-slip yoga mat made from eco-friendly materials. Perfect for home or studio practice.",
        product_image: "/placeholder.svg?height=200&width=200",
        category: "Fitness",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]

    return NextResponse.json({
      products: mockProducts,
      success: true,
      message: 'Mock products for testing the new selection interface',
      interface_features: {
        selection_mode: 'multiple',
        search_enabled: true,
        bulk_actions: ['select_all', 'clear_selection'],
        visual_feedback: 'highlighted_cards_with_checkboxes',
        action_button: 'use_selected_products'
      },
      test_scenarios: [
        'Search for "cream" should show Face Cream',
        'Search for "Skincare" should show 3 products',
        'Select multiple products and use "Select All"',
        'Test "Clear Selection" functionality',
        'Click "Use Selected Products" to trigger callback'
      ]
    })
  } catch (error: any) {
    console.error('❌ Test products selection error:', error)
    return NextResponse.json(
      { 
        error: 'Test endpoint failed', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
