"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus } from "lucide-react"
import { useState } from "react"
import type { ProductWithPricing } from "@/lib/types"

interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  products: ProductWithPricing[]
  selectedProducts: ProductWithPricing[]
  onProductSelect: (product: ProductWithPricing) => void
  loading?: boolean
}

export function ProductSelectionModal({
  isOpen,
  onClose,
  products,
  selectedProducts,
  onProductSelect,
  loading = false
}: ProductSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : []
  const selectedProductsArray = Array.isArray(selectedProducts) ? selectedProducts : []

  const filteredProducts = productsArray.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isProductSelected = (productId: number) => {
    return selectedProductsArray.some(p => p.id === productId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
          <DialogDescription>
            Choose products that customers can give feedback on
          </DialogDescription>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredProducts.map((product) => {
                const activePricing = product.pricing?.find(p => p.is_active)
                return (
                  <div
                    key={product.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isProductSelected(product.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onProductSelect(product)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          {isProductSelected(product.id) && (
                            <Badge variant="secondary" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>

                        {product.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {product.category && (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {product.category}
                            </span>
                          )}
                          {activePricing && (
                            <span className="font-medium">
                              {activePricing.currency} {activePricing.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {product.product_image && (
                        <img
                          src={product.product_image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Add products to your business to enable product-specific feedback'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedProductsArray.length} product{selectedProductsArray.length !== 1 ? 's' : ''} selected
          </div>
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
