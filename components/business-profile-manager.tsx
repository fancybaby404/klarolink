"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Save, 
  ExternalLink, 
  AlertCircle, 
  Check,
  Building,
  Users,
  Calendar
} from "lucide-react"
import type { Business } from "@/lib/types"

interface BusinessProfileManagerProps {
  business: Business
  onBusinessUpdate: (updates: Partial<Business>) => void
  className?: string
}

interface ValidationError {
  field: string
  message: string
}

export function BusinessProfileManager({ business, onBusinessUpdate, className }: BusinessProfileManagerProps) {
  const [formData, setFormData] = useState({
    name: business.name || '',
    email: business.email || '',
    website: '',
    phone: '',
    address: '',
    description: '',
    hours: '',
    founded: '',
    employees: '',
    industry: ''
  })
  
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const validateForm = () => {
    const errors: ValidationError[] = []
    
    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: 'Business name is required' })
    }
    
    if (!formData.email.trim()) {
      errors.push({ field: 'email', message: 'Email is required' })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' })
    }
    
    if (formData.website && !formData.website.match(/^https?:\/\/.+\..+/)) {
      errors.push({ field: 'website', message: 'Please enter a valid website URL (include http:// or https://)' })
    }
    
    if (formData.phone && !formData.phone.match(/^[\+]?[0-9\s\-\(\)]+$/)) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number' })
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => error.field !== field))
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      // Update business profile
      await onBusinessUpdate({
        name: formData.name,
        email: formData.email,
        // Add other fields as needed
      })
    } catch (error) {
      console.error('Error saving business profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getValidationError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message
  }

  const profileSections = [
    {
      title: 'Basic Information',
      icon: Building,
      fields: [
        {
          key: 'name',
          label: 'Business Name',
          type: 'text',
          placeholder: 'Enter your business name',
          required: true,
          icon: Building
        },
        {
          key: 'email',
          label: 'Business Email',
          type: 'email',
          placeholder: 'contact@yourbusiness.com',
          required: true,
          icon: Mail
        },
        {
          key: 'website',
          label: 'Website',
          type: 'url',
          placeholder: 'https://yourbusiness.com',
          required: false,
          icon: Globe
        },
        {
          key: 'phone',
          label: 'Phone Number',
          type: 'tel',
          placeholder: '+1 (555) 123-4567',
          required: false,
          icon: Phone
        }
      ]
    },
    {
      title: 'Location & Contact',
      icon: MapPin,
      fields: [
        {
          key: 'address',
          label: 'Business Address',
          type: 'textarea',
          placeholder: 'Enter your business address',
          required: false,
          icon: MapPin
        },
        {
          key: 'hours',
          label: 'Business Hours',
          type: 'text',
          placeholder: 'Mon-Fri 9AM-5PM',
          required: false,
          icon: Clock
        }
      ]
    },
    {
      title: 'About Your Business',
      icon: Users,
      fields: [
        {
          key: 'description',
          label: 'Business Description',
          type: 'textarea',
          placeholder: 'Tell customers about your business...',
          required: false,
          icon: Building
        },
        {
          key: 'founded',
          label: 'Founded',
          type: 'text',
          placeholder: '2020',
          required: false,
          icon: Calendar
        },
        {
          key: 'employees',
          label: 'Number of Employees',
          type: 'text',
          placeholder: '1-10',
          required: false,
          icon: Users
        },
        {
          key: 'industry',
          label: 'Industry',
          type: 'text',
          placeholder: 'Technology, Retail, etc.',
          required: false,
          icon: Building
        }
      ]
    }
  ]

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Profile
            <Badge variant="secondary" className="text-xs">
              Public Information
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {profileSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon
            return (
              <div key={section.title} className="space-y-4">
                <div className="flex items-center gap-2">
                  <SectionIcon className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">{section.title}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => {
                    const FieldIcon = field.icon
                    const error = getValidationError(field.key)
                    
                    return (
                      <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <Label htmlFor={field.key} className="flex items-center gap-2">
                          <FieldIcon className="h-3 w-3" />
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        
                        {field.type === 'textarea' ? (
                          <Textarea
                            id={field.key}
                            value={formData[field.key as keyof typeof formData]}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className={`mt-1 ${error ? 'border-red-300 focus:border-red-500' : ''}`}
                            rows={3}
                          />
                        ) : (
                          <div className="relative mt-1">
                            <Input
                              id={field.key}
                              type={field.type}
                              value={formData[field.key as keyof typeof formData]}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className={error ? 'border-red-300 focus:border-red-500' : ''}
                            />
                            {field.key === 'website' && formData.website && !error && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-6 w-6 p-0"
                                onClick={() => window.open(formData.website, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {error && (
                          <Alert variant="destructive" className="mt-2 py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">{error}</AlertDescription>
                          </Alert>
                        )}
                        
                        {!error && formData[field.key as keyof typeof formData] && field.required && (
                          <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                            <Check className="h-3 w-3" />
                            Valid
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {sectionIndex < profileSections.length - 1 && <Separator />}
              </div>
            )
          })}
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave}
              disabled={isSaving || validationErrors.length > 0}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
