"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Package, Search, Image as ImageIcon, CheckCircle2 } from "lucide-react"
import type { DashboardData } from "../../types/dashboard"
import type { Product } from "@/lib/types"

interface ProductsTabProps {
  data: DashboardData
  onDataUpdate: () => void
  onProductsSelected?: (products: Product[]) => void
}

interface SelectedProduct {
  id: number
  selected: boolean
}

export function ProductsTab({ data, onDataUpdate, onProductsSelected }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('multiple')

  useEffect(() => {
    fetchProducts()
    loadEnabledProducts()
  }, [data.business.id])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/product-management?businessId=${data.business.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        const fetchedProducts = result.products || []
        setProducts(fetchedProducts)
        // Initialize selection state - will be updated by loadEnabledProducts
        setSelectedProducts(fetchedProducts.map((p: Product) => ({ id: p.id, selected: false })))
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadEnabledProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("❌ No token found for loading enabled products")
        return
      }

      console.log("🔄 Loading enabled products...")

      const response = await fetch(`/api/products/enabled`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("📡 Load response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        const enabledProductIds = result.enabledProducts || []

        console.log("📊 API returned enabled products:", enabledProductIds)
        console.log("📊 Current selectedProducts count:", selectedProducts.length)

        // Update selection state based on enabled products
        setSelectedProducts(prev => {
          const updated = prev.map(p => ({
            ...p,
            selected: enabledProductIds.includes(p.id)
          }))

          console.log("📊 Updated selection state:", updated.map(p => ({ id: p.id, name: p.name, selected: p.selected })))
          return updated
        })

        console.log(`✅ Loaded ${enabledProductIds.length} enabled products`)
      } else {
        const errorText = await response.text()
        console.error("❌ Failed to load enabled products:", response.status, errorText)
      }
    } catch (error) {
      console.error("❌ Error loading enabled products:", error)
    }
  }

  const saveEnabledProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("❌ No token found")
        return false
      }

      const enabledProductIds = selectedProducts
        .filter(p => p.selected)
        .map(p => p.id)

      console.log("🔄 Saving enabled products:", enabledProductIds)
      console.log("📊 Total products:", selectedProducts.length)
      console.log("📊 Selected products:", selectedProducts.filter(p => p.selected).length)

      const requestBody = { enabledProductIds }
      console.log("📝 Request body:", JSON.stringify(requestBody))

      const response = await fetch(`/api/products/enabled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      })

      console.log("📡 Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Enabled products saved successfully:", result)

        // Show success feedback
        if (onDataUpdate) {
          onDataUpdate()
        }

        // Reload enabled products to verify the save worked
        setTimeout(() => {
          loadEnabledProducts()
        }, 500)

        return true
      } else {
        const errorText = await response.text()
        console.error("❌ Failed to save enabled products:", response.status, errorText)
        return false
      }
    } catch (error) {
      console.error("❌ Error saving enabled products:", error)
      return false
    }
  }

  // Product selection functions
  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev => {
      if (selectionMode === 'single') {
        // Single selection mode - only one product can be selected
        return prev.map(p => ({ ...p, selected: p.id === productId }))
      } else {
        // Multiple selection mode - toggle selection
        return prev.map(p =>
          p.id === productId ? { ...p, selected: !p.selected } : p
        )
      }
    })
  }

  const handleSelectAll = () => {
    const allSelected = selectedProducts.every(p => p.selected)
    setSelectedProducts(prev =>
      prev.map(p => ({ ...p, selected: !allSelected }))
    )
  }

  const handleClearSelection = () => {
    setSelectedProducts(prev =>
      prev.map(p => ({ ...p, selected: false }))
    )
  }

  const getSelectedProductsData = () => {
    return products.filter(product =>
      selectedProducts.find(sp => sp.id === product.id && sp.selected)
    )
  }

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCount = selectedProducts.filter(p => p.selected).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-header">Product Selection</h2>
          <p className="text-subheader">Select products from your catalog for customer reviews and feedback</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-subheader">
          <CheckCircle2 className="h-4 w-4" />
          {selectedCount} of {products.length} selected
        </div>
      </div>

      {/* Search and Controls */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {selectedProducts.every(p => p.selected) ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={handleClearSelection}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={selectedCount === 0}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Products Selection Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isSelected = selectedProducts.find(sp => sp.id === product.id)?.selected || false
            return (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all duration-200 h-full flex flex-col ${
                  isSelected
                    ? 'ring-2 ring-primary bg-primary/5 shadow-lg border-primary/20'
                    : 'hover:shadow-lg hover:border-gray-300 hover:-translate-y-1'
                }`}
                onClick={() => handleProductSelect(product.id)}
              >
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleProductSelect(product.id)}
                          className="pointer-events-none mt-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg leading-tight line-clamp-2">{product.name}</CardTitle>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {product.category && (
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge variant="default" className="text-xs bg-primary">
                                ✓ Selected
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-shrink-0 mb-3">
                    {product.product_image ? (
                      <img
                        src={product.product_image}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed flex-1">{product.description}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-header mb-2">No products available</h3>
            <p className="text-subheader text-center mb-4">
              No products found in your catalog. Products need to be added to your database before they can be selected here.
            </p>
            <p className="text-sm text-gray-500 text-center">
              Contact your administrator to add products to the system.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selection Summary & Save Button */}
      <Card className={selectedCount > 0 ? "bg-primary/5 border-primary/20" : "bg-gray-50 border-gray-200"}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-header">
                {selectedCount > 0 ? 'Selected Products' : 'Products Configuration'}
              </h4>
              <p className="text-sm text-subheader">
                {selectedCount > 0
                  ? `${selectedCount} product${selectedCount !== 1 ? 's' : ''} selected for customer feedback`
                  : 'No products selected - Products tab will be disabled on feedback page'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const selectedData = getSelectedProductsData()
                  console.log('Selected products:', selectedData)

                  // Save enabled products to database
                  const saved = await saveEnabledProducts()

                  if (saved) {
                    // Call the callback with selected products
                    onProductsSelected?.(selectedData)
                  }
                }}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  selectedCount > 0
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {selectedCount > 0 ? 'Enable for Feedback Page' : 'Disable Products Tab'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
