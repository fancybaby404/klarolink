"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Package } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  product_image?: string
  category?: string
  is_active: boolean
  display_order: number
  price?: number
  currency?: string
}

interface ProductManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onProductAdded: (product: Product) => void
  businessId: number
}

export function ProductManagementModal({
  isOpen,
  onClose,
  onProductAdded,
  businessId
}: ProductManagementModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    product_image: '',
    category: '',
    price: '',
    currency: 'USD'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          businessId,
          ...formData,
          price: formData.price ? parseFloat(formData.price) : undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        onProductAdded(result.product)
        setFormData({
          name: '',
          description: '',
          product_image: '',
          category: '',
          price: '',
          currency: 'USD'
        })
        onClose()
      } else {
        console.error('Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="e.g., Skincare, Makeup"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="product_image" className="text-sm font-medium">
                    Image URL
                  </Label>
                  <Input
                    id="product_image"
                    value={formData.product_image}
                    onChange={(e) => handleInputChange('product_image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your product..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">
                      Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-sm font-medium">
                      Currency
                    </Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      placeholder="USD"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            {formData.name && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
                <Card className="border-2 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {formData.product_image ? (
                          <img
                            src={formData.product_image}
                            alt={formData.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{formData.name}</div>
                        {formData.description && (
                          <div className="text-sm text-gray-500 mt-1">{formData.description}</div>
                        )}
                        {formData.price && (
                          <div className="text-sm font-medium text-gray-900 mt-1">
                            {formData.currency} {parseFloat(formData.price).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1"
                style={{ backgroundColor: '#c586e9' }}
              >
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
