"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { FormBuilderField } from "../types/dashboard"

export function useFormManagement() {
  const [formFields, setFormFields] = useState<FormBuilderField[]>([])
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [isEditingForm, setIsEditingForm] = useState(false)
  const [isSavingForm, setIsSavingForm] = useState(false)
  const [previewEnabled, setPreviewEnabled] = useState(false)
  const [showFieldEditor, setShowFieldEditor] = useState(false)
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [currentField, setCurrentField] = useState<FormBuilderField | null>(null)
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0)
  const router = useRouter()

  const handleSaveForm = async (
    formData: { title: string; description: string; fields: FormBuilderField[] },
    businessId: number
  ) => {
    if (!businessId) {
      toast.error('Business ID not found', {
        description: 'Please refresh the page and try again'
      })
      return
    }

    setIsSavingForm(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Authentication required', {
          description: 'Please log in again'
        })
        router.push('/login')
        return
      }

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          business_id: businessId,
          title: formData.title.trim() || 'Feedback Form',
          description: formData.description.trim(),
          fields: formData.fields,
          preview_enabled: previewEnabled
        })
      })

      const responseData = await response.json()

      if (response.ok) {
        toast.success('Form saved successfully', {
          description: 'Your feedback form has been updated'
        })
        setFormTitle(formData.title)
        setFormDescription(formData.description)
        setFormFields(formData.fields)
        setIsEditingForm(false)
        setPreviewRefreshKey((k) => k + 1)
        return true
      } else {
        toast.error('Failed to save form', {
          description: responseData.error || 'Please try again'
        })
        return false
      }
    } catch (error) {
      toast.error('Error saving form', {
        description: 'Please check your connection and try again'
      })
      return false
    } finally {
      setIsSavingForm(false)
    }
  }

  const handlePreviewToggle = async (enabled: boolean, businessId: number) => {
    setPreviewEnabled(enabled)

    if (businessId) {
      try {
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            business_id: businessId,
            title: (formTitle || 'Feedback Form').trim(),
            description: (formDescription || '').trim(),
            fields: formFields,
            preview_enabled: enabled
          })
        })

        if (response.ok) {
          setPreviewRefreshKey((k) => k + 1)
          toast.success(`Live preview ${enabled ? 'enabled' : 'disabled'}`, {
            description: 'Setting saved automatically'
          })
        } else {
          toast.error('Failed to save preview setting', {
            description: 'Please try again'
          })
        }
      } catch (error) {
        toast.error('Error saving preview setting', {
          description: 'Please check your connection and try again'
        })
      }
    }
  }

  const handleEditField = (index: number) => {
    setEditingFieldIndex(index)
    setCurrentField({ ...formFields[index] })
    setShowFieldEditor(true)
  }

  const handleSaveField = () => {
    if (editingFieldIndex !== null && currentField) {
      const newFields = [...formFields]
      const cleanedField = { ...currentField }

      // Clean up field-specific properties based on type
      if (cleanedField.type !== 'select' && cleanedField.type !== 'checkbox') {
        delete cleanedField.options
      }

      if (cleanedField.type === 'checkbox') {
        cleanedField.options = cleanedField.options?.filter(opt => opt.trim()) || []
        if (cleanedField.options.length === 0) {
          cleanedField.options = ['Option 1']
        }
        delete cleanedField.placeholder
      }

      if (cleanedField.type === 'select') {
        cleanedField.options = cleanedField.options?.filter(opt => opt.trim()) || []
        if (cleanedField.options.length === 0) {
          cleanedField.options = ['Option 1']
        }
      }

      newFields[editingFieldIndex] = cleanedField
      setFormFields(newFields)
      setShowFieldEditor(false)
      setEditingFieldIndex(null)
      setCurrentField(null)
    }
  }

  const handleAddField = () => {
    const newField: FormBuilderField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      placeholder: ''
    }
    setCurrentField(newField)
    setEditingFieldIndex(null)
    setShowFieldEditor(true)
  }

  const handleAddNewField = () => {
    if (currentField) {
      const fieldToAdd = { ...currentField }

      if (fieldToAdd.type === 'checkbox') {
        fieldToAdd.options = fieldToAdd.options?.filter(opt => opt.trim()) || []
        if (fieldToAdd.options.length === 0) {
          fieldToAdd.options = ['Option 1', 'Option 2']
        }
        delete fieldToAdd.placeholder
      }

      if (fieldToAdd.type === 'select') {
        fieldToAdd.options = fieldToAdd.options?.filter(opt => opt.trim()) || []
        if (fieldToAdd.options.length === 0) {
          fieldToAdd.options = ['Option 1', 'Option 2']
        }
      }

      setFormFields([...formFields, fieldToAdd])
      setShowFieldEditor(false)
      setCurrentField(null)
    }
  }

  const handleFieldTypeChange = (newType: "text" | "email" | "textarea" | "rating" | "select" | "checkbox") => {
    if (currentField) {
      const updatedField: FormBuilderField = {
        ...currentField,
        type: newType,
        options: (newType === 'select' || newType === 'checkbox') ? currentField.options || [] : undefined,
        placeholder: (newType !== 'checkbox' && newType !== 'select') ? currentField.placeholder : undefined
      }
      setCurrentField(updatedField)
    }
  }

  return {
    formFields,
    setFormFields,
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    isEditingForm,
    setIsEditingForm,
    isSavingForm,
    previewEnabled,
    setPreviewEnabled,
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
  }
}
