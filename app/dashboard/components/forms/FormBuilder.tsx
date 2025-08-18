"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import { Edit, Eye, EyeOff, Plus, Package, Trash2, Save, Undo, Redo, X, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FormTemplates } from "./FormTemplates"
import { FieldEditor } from "./FieldEditor"
import { LivePreview } from "./LivePreview"
import { BusinessHeader } from "./BusinessHeader"
import { AddItemModal } from "./AddItemModal"
import { ProductSelectionModal } from "./ProductSelectionModal"
import { useFormManagement } from "../../hooks/useFormManagement"
import type { DashboardData, FormTemplate } from "../../types/dashboard"
import type { ProductWithPricing } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface FormBuilderProps {
  data: DashboardData
  onDataUpdate: (newData: DashboardData) => void
}

export function FormBuilder({ data, onDataUpdate }: FormBuilderProps) {
  const { toast } = useToast()
  const [showTemplates, setShowTemplates] = useState(false)
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<ProductWithPricing[]>([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [tempTitle, setTempTitle] = useState("")
  const [tempDescription, setTempDescription] = useState("")
  const [isFormPublished, setIsFormPublished] = useState(false)

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

  const handleEditHeader = () => {
    setTempTitle(formTitle)
    setTempDescription(formDescription)
    setIsEditingHeader(true)
  }

  const handleSaveHeader = async () => {
    setFormTitle(tempTitle)
    setFormDescription(tempDescription)
    setIsEditingHeader(false)

    // Auto-save the form
    const formData = {
      title: tempTitle,
      description: tempDescription,
      fields: formFields
    }
    await handleFormSave(formData)
  }

  const handleCancelHeader = () => {
    setTempTitle(formTitle)
    setTempDescription(formDescription)
    setIsEditingHeader(false)
  }

  // Handle form publish toggle
  const handleFormPublishToggle = async (checked: boolean) => {
    try {
      // Update the form's published status via API
      const response = await fetch('/api/forms/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          businessId: data.business.id,
          isPublished: checked
        })
      })

      if (response.ok) {
        setIsFormPublished(checked)

        if (checked) {
          toast({
            title: "Form is now public",
            description: "Your form is accessible at http://localhost:3000/skinbloom-2",
            duration: 3000,
          })
        } else {
          toast({
            title: "Form access disabled",
            description: "Your form is now private and not accessible publicly.",
            duration: 3000,
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update form access. Please try again.",
          duration: 3000,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating form publish status:', error)
      toast({
        title: "Error",
        description: "Failed to update form access. Please try again.",
        duration: 3000,
        variant: "destructive"
      })
    }
  }

  // Load current form publish status
  useEffect(() => {
    const loadFormStatus = async () => {
      try {
        const response = await fetch(`/api/forms/status/${data.business.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        })
        if (response.ok) {
          const { isPublished } = await response.json()
          setIsFormPublished(isPublished)
        }
      } catch (error) {
        console.error('Error loading form status:', error)
      }
    }

    if (data?.business?.id) {
      loadFormStatus()
    }
  }, [data?.business?.id])

  // Handle ESC key for closing modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showTemplates) {
          setShowTemplates(false)
        }
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [showTemplates])

  const handleDeleteField = (index: number) => {
    const newFields = formFields.filter((_, i) => i !== index)
    setFormFields(newFields)

    // Auto-save after deletion
    const formData = {
      title: formTitle,
      description: formDescription,
      fields: newFields
    }
    handleFormSave(formData)
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
    <div className="max-w-5xl mx-auto h-screen relative">
      {/* Main Content - Scrollable with right margin for fixed preview */}
      <div className="space-y-6 overflow-y-auto pr-96 mr-6">
        {/* Business Header */}
        <BusinessHeader business={data.business} socialLinks={data.socialLinks} />

        {/* Publish Form Section */}
        <Card className="shadow-sm bg-white border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {isFormPublished ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Publish your form</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {isFormPublished
                      ? "Your form is currently public."
                      : "Your form is currently private."
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Switch
                  checked={isFormPublished}
                  onCheckedChange={handleFormPublishToggle}
                  className="data-[state=checked]:bg-[#c586e9]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms Section Title */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Forms</h2>
        </div>

        {/* Unified Header Card */}
        <Card className="shadow-sm border-2 border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {!isEditingHeader ? (
                  <div>
                    <CardTitle className="text-xl text-gray-900 mb-1">
                      {formTitle || "Form Title"}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600 mt-1 leading-relaxed">
                      {formDescription || "Form Description"}
                    </CardDescription>
                  </div>
                ) : (
                  <div className="space-y-6 w-full">
                    {/* Title and Description Editing */}
                    <div className="space-y-4 max-w-md">
                      <div>
                        <Label htmlFor="title" className="text-xl font-semibold text-gray-900 mb-2 block">
                          Form Title
                        </Label>
                        <Input
                          id="title"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          placeholder="Enter Form title"
                          className="mt-1 text-xl h-14 px-4 w-full border-2 focus:border-[#c586e9]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-xl font-semibold text-gray-900 mb-2 block">
                          Form Description
                        </Label>
                        <Input
                          id="description"
                          value={tempDescription}
                          onChange={(e) => setTempDescription(e.target.value)}
                          placeholder="Enter form description"
                          className="mt-1 text-base font-medium h-12 px-4 w-full border-2 focus:border-[#c586e9]"
                        />
                      </div>
                    </div>

                    {/* Form Edit Toolbar - Positioned directly beneath description */}
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => setShowAddItemModal(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Field
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowTemplates(!showTemplates)}
                          className="flex items-center gap-2"
                        >
                          <Package className="w-4 h-4" />
                          Templates
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled
                        >
                          <Undo className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled
                        >
                          <Redo className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCancelHeader}
                          className="flex items-center gap-2 text-white"
                          style={{ backgroundColor: '#c586e9' }}
                        >
                          <X className="w-4 h-4" />
                          Close
                        </Button>
                        <Button
                          onClick={handleSaveHeader}
                          disabled={isSavingForm}
                          className="flex items-center gap-2 text-white"
                          style={{ backgroundColor: '#c586e9' }}
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                      </div>
                    </div>

                    {/* Form Fields inside edit mode */}
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
                        {isAutoSaving && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                            Saving...
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {formFields.map((field: any, index: number) => (
                          <Card key={field.id} className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div
                                  className="flex items-center gap-3 flex-1 cursor-pointer"
                                  onClick={() => handleEditField(index)}
                                >
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Edit className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{field.label}</div>
                                    <div className="text-sm text-gray-500">
                                      {field.type} {field.required && '• Required'}
                                    </div>
                                  </div>
                                </div>
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
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {/* Add Field Prompt */}
                        {formFields.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="font-medium">No fields added yet</p>
                            <p className="text-sm mt-1">Click the "Add Field" button to create your first field</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!isEditingHeader && (
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={handleEditHeader}
                    className="flex items-center gap-2 text-white"
                    style={{ backgroundColor: '#c586e9' }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Choose a Template</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6">
                <FormTemplates onTemplateSelect={handleTemplateSelect} />
              </div>
            </div>
          </div>
        )}

        {/* Product Section Title */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        </div>

        {/* Product Section */}
        <Card className="shadow-sm border-2 border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Product Section</CardTitle>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
                <Button
                  className="flex items-center gap-2 text-white"
                  style={{ backgroundColor: '#c586e9' }}
                  disabled
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* Product List Header */}
            <div className="border-t-2 border-gray-200 pt-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Product list</CardTitle>
            </div>
          

          </CardHeader>
          <CardContent className="space-y-3">
            {selectedProducts.length > 0 ? (
              selectedProducts.map((product) => {
                const activePricing = product.pricing?.find(p => p.is_active)
                return (
                  <Card key={product.id} className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.product_image ? (
                              <img
                                src={product.product_image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 mt-1">Product description</div>
                            {activePricing && (
                              <div className="text-sm font-medium text-gray-900 mt-1">
                                {activePricing.currency} {activePricing.price.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                            disabled
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                            disabled
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium">No products added yet</p>
                <p className="text-sm mt-1">Products will appear here when you add them to your form</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Live Preview */}
      <LivePreview
        businessSlug={data.business.slug}
        previewEnabled={true}
        previewRefreshKey={previewRefreshKey}
        isCollapsed={false}
        onToggleCollapse={() => {}}
        onEnablePreview={() => {}}
        data={data}
      />

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

      <Toaster />
    </div>
  )
}
