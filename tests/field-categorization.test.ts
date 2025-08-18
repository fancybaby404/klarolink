/**
 * Test suite for field categorization system
 * Tests various custom form configurations to ensure analytics work correctly
 */

import { 
  categorizeField, 
  categorizeFormFields, 
  extractCategorizedData, 
  extractDataWithFallback 
} from '../lib/field-categorization'
import type { FormField } from '../lib/types'

describe('Field Categorization System', () => {
  
  describe('categorizeField', () => {
    test('should categorize rating fields correctly', () => {
      const ratingField: FormField = {
        id: 'overall-rating',
        type: 'rating',
        label: 'How satisfied are you with our service?',
        required: true
      }
      
      const categorization = categorizeField(ratingField)
      expect(categorization.category).toBe('rating')
      expect(categorization.priority).toBe(10)
      expect(categorization.confidence).toBeGreaterThan(0.8)
    })

    test('should categorize feedback text fields correctly', () => {
      const feedbackField: FormField = {
        id: 'experience-feedback',
        type: 'textarea',
        label: 'Tell us about your experience',
        required: false
      }
      
      const categorization = categorizeField(feedbackField)
      expect(categorization.category).toBe('feedback_text')
      expect(categorization.priority).toBe(9)
      expect(categorization.confidence).toBeGreaterThan(0.7)
    })

    test('should categorize contact fields correctly', () => {
      const emailField: FormField = {
        id: 'contact-email',
        type: 'email',
        label: 'Your email address',
        required: false
      }
      
      const categorization = categorizeField(emailField)
      expect(categorization.category).toBe('contact')
      expect(categorization.confidence).toBeGreaterThan(0.6)
    })

    test('should categorize recommendation fields correctly', () => {
      const recommendField: FormField = {
        id: 'recommend-service',
        type: 'select',
        label: 'Would you recommend our service?',
        required: true,
        options: ['Yes', 'No', 'Maybe']
      }
      
      const categorization = categorizeField(recommendField)
      expect(categorization.category).toBe('recommendation')
      expect(categorization.confidence).toBeGreaterThan(0.5)
    })

    test('should handle custom fields with fallback', () => {
      const customField: FormField = {
        id: 'custom-field-xyz',
        type: 'text',
        label: 'Some custom field',
        required: false
      }
      
      const categorization = categorizeField(customField)
      expect(categorization.category).toBe('custom')
      expect(categorization.priority).toBe(1)
    })
  })

  describe('extractCategorizedData', () => {
    test('should extract data from customer satisfaction form', () => {
      const fields: FormField[] = [
        {
          id: 'overall-rating',
          type: 'rating',
          label: 'How satisfied are you?',
          required: true
        },
        {
          id: 'experience-feedback',
          type: 'textarea',
          label: 'Tell us about your experience',
          required: false
        },
        {
          id: 'contact-email',
          type: 'email',
          label: 'Your email',
          required: false
        }
      ]

      const categorizations = categorizeFormFields(fields)
      const submissionData = {
        'overall-rating': 5,
        'experience-feedback': 'Great service, very satisfied!',
        'contact-email': 'customer@example.com'
      }

      const result = extractCategorizedData(submissionData, categorizations)
      
      expect(result.rating).toBe(5)
      expect(result.feedbackText).toBe('Great service, very satisfied!')
      expect(result.contactInfo['contact-email']).toBe('customer@example.com')
    })

    test('should extract data from product feedback form', () => {
      const fields: FormField[] = [
        {
          id: 'product-rating',
          type: 'rating',
          label: 'Rate this product',
          required: true
        },
        {
          id: 'favorite-features',
          type: 'textarea',
          label: 'What features do you like?',
          required: false
        },
        {
          id: 'missing-features',
          type: 'textarea',
          label: 'What features are missing?',
          required: false
        }
      ]

      const categorizations = categorizeFormFields(fields)
      const submissionData = {
        'product-rating': 4,
        'favorite-features': 'Love the user interface and speed',
        'missing-features': 'Would like better mobile support'
      }

      const result = extractCategorizedData(submissionData, categorizations)
      
      expect(result.rating).toBe(4)
      // Should pick the highest priority feedback field
      expect(result.feedbackText).toBeTruthy()
      expect(['Love the user interface and speed', 'Would like better mobile support'])
        .toContain(result.feedbackText)
    })

    test('should handle custom field names correctly', () => {
      const fields: FormField[] = [
        {
          id: 'satisfaction-score',
          type: 'rating',
          label: 'Satisfaction Score',
          required: true
        },
        {
          id: 'detailed-comments',
          type: 'textarea',
          label: 'Additional Comments',
          required: false
        }
      ]

      const categorizations = categorizeFormFields(fields)
      const submissionData = {
        'satisfaction-score': 3,
        'detailed-comments': 'Service was okay, could be better'
      }

      const result = extractCategorizedData(submissionData, categorizations)
      
      expect(result.rating).toBe(3)
      expect(result.feedbackText).toBe('Service was okay, could be better')
    })
  })

  describe('extractDataWithFallback', () => {
    test('should use fallback for legacy field names', () => {
      const submissionData = {
        'rating': 5,
        'feedback': 'Excellent service!',
        'email': 'test@example.com'
      }

      const result = extractDataWithFallback(submissionData)
      
      expect(result.rating).toBe(5)
      expect(result.feedbackText).toBe('Excellent service!')
    })

    test('should handle alternative field names', () => {
      const submissionData = {
        'Rating': 4, // Capital R
        'message': 'Good experience overall',
        'comment': 'This should be ignored since message comes first'
      }

      const result = extractDataWithFallback(submissionData)
      
      expect(result.rating).toBe(4)
      expect(result.feedbackText).toBe('Good experience overall')
    })

    test('should handle missing data gracefully', () => {
      const submissionData = {
        'some-other-field': 'irrelevant data'
      }

      const result = extractDataWithFallback(submissionData)
      
      expect(result.rating).toBeNull()
      expect(result.feedbackText).toBeNull()
    })

    test('should validate rating ranges', () => {
      const submissionData = {
        'rating': 15, // Invalid rating
        'feedback': 'Test feedback'
      }

      const result = extractDataWithFallback(submissionData)
      
      expect(result.rating).toBeNull() // Should reject invalid rating
      expect(result.feedbackText).toBe('Test feedback')
    })

    test('should handle empty strings', () => {
      const submissionData = {
        'rating': 5,
        'feedback': '', // Empty string
        'message': 'This should be used instead'
      }

      const result = extractDataWithFallback(submissionData)
      
      expect(result.rating).toBe(5)
      expect(result.feedbackText).toBe('This should be used instead')
    })
  })

  describe('Real-world scenarios', () => {
    test('should handle complex custom form', () => {
      const fields: FormField[] = [
        {
          id: 'service-quality-rating',
          type: 'rating',
          label: 'How would you rate our service quality?',
          required: true
        },
        {
          id: 'staff-friendliness',
          type: 'rating',
          label: 'How friendly was our staff?',
          required: true
        },
        {
          id: 'general-comments',
          type: 'textarea',
          label: 'Any additional comments?',
          required: false
        },
        {
          id: 'improvement-suggestions',
          type: 'textarea',
          label: 'How can we improve?',
          required: false
        },
        {
          id: 'customer-name',
          type: 'text',
          label: 'Your name',
          required: false
        }
      ]

      const categorizations = categorizeFormFields(fields)
      const submissionData = {
        'service-quality-rating': 4,
        'staff-friendliness': 5,
        'general-comments': 'Overall good experience',
        'improvement-suggestions': 'Faster response times would be great',
        'customer-name': 'John Doe'
      }

      const result = extractCategorizedData(submissionData, categorizations)
      
      // Should pick the highest priority rating (both are rating fields, but first one should win by priority)
      expect(result.rating).toBe(4)
      
      // Should pick one of the feedback texts
      expect(result.feedbackText).toBeTruthy()
      expect(['Overall good experience', 'Faster response times would be great'])
        .toContain(result.feedbackText)
      
      // Should categorize personal info
      expect(result.personalInfo['customer-name']).toBe('John Doe')
    })
  })
})

// Helper function to run tests in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    categorizeField,
    categorizeFormFields,
    extractCategorizedData,
    extractDataWithFallback
  }
}
