"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, MessageSquare, Users, FileText } from "lucide-react"
import type { FormTemplate } from "../../types/dashboard"

interface FormTemplatesProps {
  onTemplateSelect: (template: FormTemplate) => void
}

const formTemplates: FormTemplate[] = [
  {
    id: "customer-satisfaction",
    name: "Customer Satisfaction",
    description: "General satisfaction survey",
    category: "satisfaction",
    fields: [
      {
        id: "overall-rating",
        type: "rating",
        label: "How satisfied are you with our service?",
        required: true,
        field_category: "rating"
      },
      {
        id: "experience-feedback",
        type: "textarea",
        label: "Tell us about your experience",
        required: false,
        placeholder: "Share your thoughts...",
        field_category: "feedback_text"
      },
      {
        id: "recommend",
        type: "select",
        label: "Would you recommend us to others?",
        required: true,
        options: ["Yes, definitely", "Yes, probably", "Maybe", "Probably not", "Definitely not"],
        field_category: "recommendation"
      },
      {
        id: "contact-email",
        type: "email",
        label: "Email (optional)",
        required: false,
        placeholder: "your@email.com",
        field_category: "contact"
      }
    ]
  },
  {
    id: "product-feedback",
    name: "Product Feedback",
    description: "Product-specific feedback form",
    category: "product",
    fields: [
      {
        id: "product-rating",
        type: "rating",
        label: "Rate this product",
        required: true,
        field_category: "rating"
      },
      {
        id: "product-quality",
        type: "select",
        label: "How would you rate the quality?",
        required: true,
        options: ["Excellent", "Good", "Average", "Poor", "Very Poor"],
        field_category: "satisfaction"
      },
      {
        id: "favorite-features",
        type: "textarea",
        label: "Which features do you like most?",
        required: false,
        placeholder: "Tell us about your favorite features...",
        field_category: "feedback_text"
      },
      {
        id: "missing-features",
        type: "textarea",
        label: "What features are missing?",
        required: false,
        placeholder: "What would you like to see added...",
        field_category: "feedback_text"
      },
      {
        id: "purchase-again",
        type: "select",
        label: "Would you purchase this product again?",
        required: true,
        options: ["Yes", "Maybe", "No"]
      }
    ]
  },
  {
    id: "service-review",
    name: "Service Review",
    description: "Service quality assessment",
    category: "service",
    fields: [
      {
        id: "service-rating",
        type: "rating",
        label: "Rate our service",
        required: true,
        field_category: "rating"
      },
      {
        id: "staff-rating",
        type: "rating",
        label: "How helpful was our staff?",
        required: true,
        field_category: "rating"
      },
      {
        id: "response-time",
        type: "select",
        label: "How was our response time?",
        required: true,
        options: ["Very fast", "Fast", "Average", "Slow", "Very slow"],
        field_category: "satisfaction"
      },
      {
        id: "service-feedback",
        type: "textarea",
        label: "Tell us about your experience",
        required: false,
        placeholder: "Share your experience with our service...",
        field_category: "feedback_text"
      },
      {
        id: "recommend-service",
        type: "select",
        label: "Would you recommend our service?",
        required: true,
        options: ["Yes, definitely", "Yes, probably", "Maybe", "Probably not", "Definitely not"],
        field_category: "recommendation"
      }
    ]
  },
  {
    id: "custom",
    name: "Custom Form",
    description: "Start from scratch",
    category: "custom",
    fields: [
      {
        id: "rating",
        type: "rating",
        label: "Overall Rating",
        required: true,
        field_category: "rating"
      },
      {
        id: "feedback",
        type: "textarea",
        label: "Your Feedback",
        required: true,
        placeholder: "Tell us what you think...",
        field_category: "feedback_text"
      }
    ]
  }
]

export function FormTemplates({ onTemplateSelect }: FormTemplatesProps) {
  const iconColors = {
    "customer-satisfaction": { bg: "bg-blue-100", text: "text-blue-600", icon: Star },
    "product-feedback": { bg: "bg-green-100", text: "text-green-600", icon: MessageSquare },
    "service-review": { bg: "bg-purple-100", text: "text-purple-600", icon: Users },
    "custom": { bg: "bg-orange-100", text: "text-orange-600", icon: FileText }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Form Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formTemplates.map((template) => {
          const config = iconColors[template.id as keyof typeof iconColors]
          const IconComponent = config.icon

          return (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow hover:border-blue-300"
              onClick={() => onTemplateSelect(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`h-5 w-5 ${config.text}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {template.fields.length} fields included
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
