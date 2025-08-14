"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Plus, Package, Trash2 } from "lucide-react"
import { FormTemplates } from "./FormTemplates"
import { FieldEditor } from "./FieldEditor"
import { LivePreview } from "./LivePreview"
import { BusinessHeader } from "./BusinessHeader"
import { AddItemModal } from "./AddItemModal"
import { ProductSelectionModal } from "./ProductSelectionModal"
import { useFormManagement } from "../../hooks/useFormManagement"
import type { DashboardData, FormTemplate } from "../../types/dashboard"
import type { ProductWithPricing } from "@/lib/types"

interface FormBuilderProps {
  data: DashboardData
  onDataUpdate: (newData: DashboardData) => void
}

export function FormBuilder({ data, onDataUpdate }: FormBuilderProps) {
  const [showTemplates, setShowTemplates] = useState(false)
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<ProductWithPricing[]>([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  const {
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formFields,
    setFormFields,
    previewEnabled,
    setPreviewEnabled,
    isSavingForm,
    showFieldEditor,
    setShowFieldEditor,
    editingFieldIndex,
    setEditingFieldIndex,
    currentField,
    setCurrentField,
    previewRefreshKey,
    handleSaveForm,
    handlePreviewToggle,
    handleEditField,
    handleSaveField,
    handleAddField,
    handleAddNewField,
    handleFieldTypeChange
  } = useFormManagement()

  // Initialize form data from props
  React.useEffect(() => {
    if (data.feedbackForm) {
      setFormTitle(data.feedbackForm.title || "")
      setFormDescription(data.feedbackForm.description || "")
      setFormFields(data.feedbackForm.fields || [])
      setPreviewEnabled(data.feedbackForm.preview_enabled || false)
    }
  }, [data.feedbackForm])

  const handleTemplateSelect = (template: FormTemplate) => {
    setFormTitle(template.name)
    setFormDescription(template.description)
    setFormFields(template.fields)
    setShowTemplates(false)
  }

  const handleFormSave = async (formData: { title: string; description: string; fields: any[] }) => {
    const success = await handleSaveForm(formData, data.business.id)
    if (success && data.feedbackForm) {
      const updatedData = {
        ...data,
        feedbackForm: {
          ...data.feedbackForm,
          title: formData.title,
          description: formData.description,
          fields: formData.fields
        }
      }
      onDataUpdate(updatedData)
    }
  }

  const handlePreviewToggleWrapper = async (enabled: boolean) => {
    await handlePreviewToggle(enabled, data.business.id)
    if (data.feedbackForm) {
      const updatedData = {
        ...data,
        feedbackForm: {
          ...data.feedbackForm,
          preview_enabled: enabled
        }
      }
      onDataUpdate(updatedData)
    }
  }

  const handleAddFieldFromModal = () => {
    setShowAddItemModal(false)
    handleAddField()
  }

  const handleAddProduct = () => {
    setShowAddItemModal(false)
    setShowProductModal(true)
  }

  const handleProductSelect = (product: ProductWithPricing) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id)
      if (isSelected) {
        return prev.filter(p => p.id !== product.id)
      } else {
        return [...prev, product]
      }
    })
  }

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
  }

  const handleDeleteField = (index: number) => {
    const newFields = formFields.filter((_, i) => i !== index)
    setFormFields(newFields)
    handleAutoSave()
  }

  // Auto-save functionality
  const handleAutoSave = async () => {
    setIsAutoSaving(true)
    try {
      const formData = {
        title: formTitle,
        description: formDescription,
        fields: formFields
      }
      await handleFormSave(formData)
    } finally {
      setIsAutoSaving(false)
    }
  }

  // Auto-save when title or description changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formTitle || formDescription || formFields.length > 0) {
        handleAutoSave()
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [formTitle, formDescription, formFields])

  // Products state
  const [products, setProducts] = useState<ProductWithPricing[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Fetch products with pricing
  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      console.log('Fetching products for business ID:', data.business.id)
      const response = await fetch(`/api/products/${data.business.id}`)
      console.log('Products API response status:', response.status)

      if (response.ok) {
        const productsData = await response.json()
        console.log('Products data received:', productsData)
        setProducts(productsData)
      } else {
        const errorData = await response.json()
        console.error('Products API error:', errorData)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Fetch products on component mount
  React.useEffect(() => {
    fetchProducts()
  }, [data.business.id])

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Business Header */}
        <BusinessHeader business={data.business} socialLinks={data.socialLinks} />

      {/* Add Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowAddItemModal(true)}
          className="w-full max-w-md h-12 text-white font-medium rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add
        </Button>
      </div>

      {/* Action Buttons Row */}
      <div className="flex justify-start items-center">
        <Button
          variant="ghost"
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Package className="w-4 h-4" />
          Templates
        </Button>
      </div>

      {/* Templates Section */}
      {showTemplates && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <FormTemplates onTemplateSelect={handleTemplateSelect} />
        </div>
      )}

      {/* Form Editor Section */}
      <div className="bg-white rounded-lg">
        {/* Auto-save indicator */}
        {isAutoSaving && (
          <div className="flex justify-end p-4 pb-0">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              Saving...
            </span>
          </div>
        )}

        {/* Form Title Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Edit className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Form Title</span>
          </div>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Add form title"
            className="w-full text-lg font-medium text-gray-900 bg-transparent border-none outline-none placeholder-gray-400"
          />
        </div>

        {/* Form Description */}
        <div className="p-4">
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Add a new field or drag and drop an existing field into this form."
            className="w-full text-sm text-gray-600 bg-transparent border-none outline-none resize-none placeholder-gray-400"
            rows={2}
          />
        </div>

        {/* Form Fields */}
        <div className="p-4 space-y-3">
          {formFields.map((field: any, index: number) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => handleEditField(index)}
              >
                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                  <Edit className="w-3 h-3 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{field.label}</div>
                  <div className="text-xs text-gray-500">
                    {field.type} {field.required && '• Required'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteField(index)
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="w-2 h-2 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}

          {/* Add Field Prompt */}
          {formFields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Plus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No fields added yet</p>
              <p className="text-sm">Click the Add button to create your first field</p>
            </div>
          )}
        </div>

        {/* Products Section - Only show if products are selected */}
        {selectedProducts.length > 0 && (
          <div className="border-t border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Products</h3>
                <Badge variant="secondary">{selectedProducts.length}</Badge>
              </div>
              <div className="space-y-2">
                {selectedProducts.map((product) => {
                  const activePricing = product.pricing?.find(p => p.is_active)
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {product.product_image ? (
                          <img
                            src={product.product_image}
                            alt={product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-700">{product.name}</span>
                          {activePricing && (
                            <div className="text-xs text-gray-500">
                              {activePricing.currency} {activePricing.price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      </div>

      {/* Live Preview - Always Visible */}
      <div className="w-80 flex-shrink-0">
        <LivePreview
          businessSlug={data.business.slug}
          previewEnabled={true}
          previewRefreshKey={previewRefreshKey}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          onEnablePreview={() => {}}
        />
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onAddField={handleAddFieldFromModal}
        onAddProduct={handleAddProduct}
      />

      <ProductSelectionModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        products={products}
        selectedProducts={selectedProducts}
        onProductSelect={handleProductSelect}
        loading={loadingProducts}
      />

      {/* Field Editor Modal */}
      <FieldEditor
        isOpen={showFieldEditor}
        onClose={() => setShowFieldEditor(false)}
        field={currentField}
        isEditing={editingFieldIndex !== null}
        onFieldChange={setCurrentField}
        onSave={editingFieldIndex !== null ? handleSaveField : handleAddNewField}
        onFieldTypeChange={handleFieldTypeChange}
      />

    </div>
  )
}
