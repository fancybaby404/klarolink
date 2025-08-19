/**
 * Field Categorization System for Analytics
 * 
 * This system automatically categorizes form fields and extracts data
 * from submissions regardless of custom field names.
 */

import type { FormField } from './types'

// Field categories for analytics
export type FieldCategory = 
  | 'rating'           // Rating/score fields (1-5 stars, 1-10 scale, etc.)
  | 'feedback_text'    // Main feedback/comment text fields
  | 'personal_info'    // Name, email, contact information
  | 'contact'          // Email, phone, address fields
  | 'demographic'      // Age, location, job title, etc.
  | 'satisfaction'     // Satisfaction-related select/checkbox fields
  | 'recommendation'   // Would you recommend fields
  | 'custom'           // Other custom fields

// Field type mappings for automatic categorization
export interface FieldCategorization {
  category: FieldCategory
  priority: number // Higher priority = preferred for analytics (1-10)
  confidence: number // How confident we are in this categorization (0-1)
}

// Keywords and patterns for automatic field categorization
const FIELD_CATEGORIZATION_RULES = {
  rating: {
    // Field IDs that indicate rating fields
    idPatterns: [
      /^rating$/i,
      /^overall[-_]?rating$/i,
      /^product[-_]?rating$/i,
      /^service[-_]?rating$/i,
      /^satisfaction[-_]?rating$/i,
      /^score$/i,
      /^overall[-_]?score$/i,
      /rating$/i,
      /score$/i
    ],
    // Field labels that indicate rating fields
    labelPatterns: [
      /rate/i,
      /rating/i,
      /score/i,
      /stars?/i,
      /satisfaction/i,
      /how.*satisfied/i,
      /overall.*experience/i
    ],
    // Field types that are typically ratings
    fieldTypes: ['rating'],
    priority: 10
  },
  
  feedback_text: {
    idPatterns: [
      /^feedback$/i,
      /^comment$/i,
      /^comments$/i,
      /^message$/i,
      /^review$/i,
      /^experience$/i,
      /^thoughts$/i,
      /^opinion$/i,
      /feedback$/i,
      /comment$/i,
      /experience$/i,
      /thoughts$/i,
      /review$/i,
      /message$/i,
      /description$/i,
      /details$/i,
      /additional/i,
      /other/i,
      /anything/i,
      /else/i
    ],
    labelPatterns: [
      /feedback/i,
      /comment/i,
      /message/i,
      /review/i,
      /experience/i,
      /thoughts/i,
      /opinion/i,
      /tell us/i,
      /describe/i,
      /explain/i,
      /additional/i,
      /anything else/i,
      /other/i,
      /suggestions?/i,
      /improvements?/i
    ],
    fieldTypes: ['textarea'],
    priority: 9
  },

  personal_info: {
    idPatterns: [
      /^name$/i,
      /^full[-_]?name$/i,
      /^first[-_]?name$/i,
      /^last[-_]?name$/i,
      /^customer[-_]?name$/i,
      /^user[-_]?name$/i
    ],
    labelPatterns: [
      /^name$/i,
      /your name/i,
      /full name/i,
      /customer name/i
    ],
    fieldTypes: ['text'],
    priority: 5
  },

  contact: {
    idPatterns: [
      /^email$/i,
      /^contact[-_]?email$/i,
      /^customer[-_]?email$/i,
      /^phone$/i,
      /^contact[-_]?phone$/i,
      /^mobile$/i
    ],
    labelPatterns: [
      /email/i,
      /phone/i,
      /contact/i,
      /mobile/i
    ],
    fieldTypes: ['email'],
    priority: 4
  },

  recommendation: {
    idPatterns: [
      /recommend/i,
      /referral/i,
      /refer/i,
      /nps/i,
      /net[-_]?promoter/i
    ],
    labelPatterns: [
      /recommend/i,
      /refer/i,
      /friends/i,
      /colleagues/i,
      /others/i,
      /likely.*recommend/i
    ],
    fieldTypes: ['select', 'rating'],
    priority: 7
  },

  satisfaction: {
    idPatterns: [
      /satisfaction/i,
      /quality/i,
      /service/i,
      /product/i,
      /happy/i,
      /pleased/i
    ],
    labelPatterns: [
      /satisfied/i,
      /quality/i,
      /service/i,
      /product/i,
      /happy/i,
      /pleased/i,
      /experience/i
    ],
    fieldTypes: ['select', 'rating'],
    priority: 6
  }
}

/**
 * Automatically categorize a form field based on its properties
 */
export function categorizeField(field: FormField): FieldCategorization {
  const fieldId = field.id.toLowerCase()
  const fieldLabel = field.label.toLowerCase()
  const fieldType = field.type

  let bestMatch: FieldCategorization = {
    category: 'custom',
    priority: 1,
    confidence: 0
  }

  // Check each category's rules
  for (const [category, rules] of Object.entries(FIELD_CATEGORIZATION_RULES)) {
    let confidence = 0
    let matches = 0
    let totalChecks = 0

    // Check ID patterns
    totalChecks += rules.idPatterns.length
    for (const pattern of rules.idPatterns) {
      if (pattern.test(fieldId)) {
        matches++
        confidence += 0.4 // ID matches are strong indicators
      }
    }

    // Check label patterns
    totalChecks += rules.labelPatterns.length
    for (const pattern of rules.labelPatterns) {
      if (pattern.test(fieldLabel)) {
        matches++
        confidence += 0.3 // Label matches are good indicators
      }
    }

    // Check field type
    totalChecks += 1
    if (rules.fieldTypes.includes(fieldType)) {
      matches++
      confidence += 0.3 // Type matches are good indicators
    }

    // Normalize confidence score
    if (matches > 0) {
      confidence = Math.min(confidence, 1.0)
      
      // Boost confidence if multiple criteria match
      if (matches > 1) {
        confidence = Math.min(confidence * 1.2, 1.0)
      }

      // If this is a better match, use it
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          category: category as FieldCategory,
          priority: rules.priority,
          confidence
        }
      }
    }
  }

  return bestMatch
}

/**
 * Categorize all fields in a form and return categorization map
 * Uses enhanced categorization that considers explicit field_category metadata
 */
export function categorizeFormFields(fields: FormField[]): Map<string, FieldCategorization> {
  const categorizations = new Map<string, FieldCategorization>()

  for (const field of fields) {
    const categorization = categorizeFieldEnhanced(field)
    categorizations.set(field.id, categorization)
  }

  return categorizations
}

/**
 * Extract data from submission based on field categories
 */
export function extractCategorizedData(
  submissionData: Record<string, any>,
  fieldCategorizations: Map<string, FieldCategorization>
): {
  rating: number | null
  feedbackText: string | null
  personalInfo: Record<string, any>
  contactInfo: Record<string, any>
  allCategorizedData: Record<FieldCategory, any[]>
} {
  const result = {
    rating: null as number | null,
    feedbackText: null as string | null,
    personalInfo: {} as Record<string, any>,
    contactInfo: {} as Record<string, any>,
    allCategorizedData: {
      rating: [],
      feedback_text: [],
      personal_info: [],
      contact: [],
      demographic: [],
      satisfaction: [],
      recommendation: [],
      custom: []
    } as Record<FieldCategory, any[]>
  }

  // Group fields by category and priority
  const categorizedFields = new Map<FieldCategory, Array<{fieldId: string, value: any, priority: number, confidence: number}>>()

  for (const [fieldId, value] of Object.entries(submissionData)) {
    if (value === null || value === undefined || value === '') continue

    const categorization = fieldCategorizations.get(fieldId)
    if (!categorization) continue

    const category = categorization.category
    if (!categorizedFields.has(category)) {
      categorizedFields.set(category, [])
    }

    categorizedFields.get(category)!.push({
      fieldId,
      value,
      priority: categorization.priority,
      confidence: categorization.confidence
    })

    // Add to allCategorizedData
    result.allCategorizedData[category].push({
      fieldId,
      value,
      priority: categorization.priority,
      confidence: categorization.confidence
    })
  }

  // Extract primary rating (highest priority + confidence)
  const ratingFields = categorizedFields.get('rating') || []
  if (ratingFields.length > 0) {
    const bestRating = ratingFields.sort((a, b) => 
      (b.priority * b.confidence) - (a.priority * a.confidence)
    )[0]
    
    const ratingValue = Number(bestRating.value)
    if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 10) {
      result.rating = ratingValue
    }
  }

  // Extract primary feedback text (highest priority + confidence)
  const feedbackFields = categorizedFields.get('feedback_text') || []
  if (feedbackFields.length > 0) {
    const bestFeedback = feedbackFields.sort((a, b) => 
      (b.priority * b.confidence) - (a.priority * a.confidence)
    )[0]
    
    if (typeof bestFeedback.value === 'string' && bestFeedback.value.trim()) {
      result.feedbackText = bestFeedback.value.trim()
    }
  }

  // Extract personal info
  const personalFields = categorizedFields.get('personal_info') || []
  for (const field of personalFields) {
    result.personalInfo[field.fieldId] = field.value
  }

  // Extract contact info
  const contactFields = categorizedFields.get('contact') || []
  for (const field of contactFields) {
    result.contactInfo[field.fieldId] = field.value
  }

  return result
}

/**
 * Legacy fallback extraction for backwards compatibility
 * This handles cases where field categorization might miss something
 */
export function extractDataWithFallback(
  submissionData: Record<string, any>,
  fieldCategorizations?: Map<string, FieldCategorization>
): {
  rating: number | null
  feedbackText: string | null
} {
  let rating: number | null = null
  let feedbackText: string | null = null

  // Try categorized extraction first
  if (fieldCategorizations) {
    const categorizedData = extractCategorizedData(submissionData, fieldCategorizations)
    rating = categorizedData.rating
    feedbackText = categorizedData.feedbackText
  }

  // Enhanced fallback with intelligent field detection
  if (rating === null) {
    rating = findRatingFieldIntelligent(submissionData)
  }

  if (feedbackText === null) {
    feedbackText = findFeedbackTextIntelligent(submissionData)
  }

  return { rating, feedbackText }
}

/**
 * Get form field categorizations from database or cache
 * This function will be used by analytics components to get field mappings
 */
export async function getFormFieldCategorizations(
  formId: number,
  formFields?: FormField[]
): Promise<Map<string, FieldCategorization>> {
  // If form fields are provided, categorize them directly
  if (formFields) {
    return categorizeFormFields(formFields)
  }

  // TODO: In a real implementation, this would fetch from database/cache
  // For now, return empty map to trigger fallback behavior
  return new Map()
}

/**
 * Enhanced categorization that considers explicit field_category metadata
 */
export function categorizeFieldEnhanced(field: FormField): FieldCategorization {
  // If field has explicit category metadata, use it with high confidence
  if (field.field_category && field.field_category !== 'custom') {
    const categoryMap: Record<string, FieldCategory> = {
      'rating': 'rating',
      'feedback_text': 'feedback_text',
      'personal_info': 'personal_info',
      'contact': 'contact',
      'demographic': 'demographic',
      'satisfaction': 'satisfaction',
      'recommendation': 'recommendation'
    }

    const mappedCategory = categoryMap[field.field_category]
    if (mappedCategory) {
      const rules = FIELD_CATEGORIZATION_RULES[mappedCategory]
      return {
        category: mappedCategory,
        priority: rules?.priority || 8,
        confidence: 0.95 // High confidence for explicit categorization
      }
    }
  }

  // Fall back to pattern-based categorization
  return categorizeField(field)
}

/**
 * Backward compatibility function to add field categories to existing forms
 * This automatically categorizes fields that don't have explicit categories
 */
export function addBackwardCompatibilityCategories(fields: FormField[]): FormField[] {
  return fields.map(field => {
    // If field already has a category, keep it
    if (field.field_category) {
      return field
    }

    // Auto-categorize based on field properties
    const categorization = categorizeField(field)

    // Only add category if we have high confidence
    if (categorization.confidence > 0.7) {
      return {
        ...field,
        field_category: categorization.category
      }
    }

    // Default to custom for low-confidence categorizations
    return {
      ...field,
      field_category: 'custom'
    }
  })
}

/**
 * Utility function to extract analytics data from any submission
 * This is the main function that analytics components should use
 */
export async function extractAnalyticsData(
  submissionData: Record<string, any>,
  formId?: number,
  formFields?: FormField[]
): Promise<{
  rating: number | null
  feedbackText: string | null
  personalInfo: Record<string, any>
  contactInfo: Record<string, any>
}> {
  try {
    // Get field categorizations
    const categorizations = await getFormFieldCategorizations(formId || 0, formFields)

    // Extract categorized data
    const categorizedData = extractCategorizedData(submissionData, categorizations)

    // Use fallback if needed
    const fallbackData = extractDataWithFallback(submissionData, categorizations)

    return {
      rating: categorizedData.rating || fallbackData.rating,
      feedbackText: categorizedData.feedbackText || fallbackData.feedbackText,
      personalInfo: categorizedData.personalInfo,
      contactInfo: categorizedData.contactInfo
    }
  } catch (error) {
    console.warn('Field categorization failed, using fallback:', error)

    // Pure fallback extraction
    const fallbackData = extractDataWithFallback(submissionData)
    return {
      rating: fallbackData.rating,
      feedbackText: fallbackData.feedbackText,
      personalInfo: {},
      contactInfo: {}
    }
  }
}

/**
 * Intelligent rating field detection
 */
function findRatingFieldIntelligent(submissionData: Record<string, any>): number | null {
  console.log('🔍 Finding rating in submission data:', Object.keys(submissionData))

  // First try exact matches (expanded list)
  const exactMatches = [
    'rating', 'Rating', 'RATING',
    'overall-rating', 'overall_rating', 'overallRating',
    'product-rating', 'product_rating', 'productRating',
    'service-rating', 'service_rating', 'serviceRating',
    'score', 'Score', 'SCORE',
    'overall-score', 'overall_score', 'overallScore',
    'satisfaction', 'Satisfaction',
    'stars', 'Stars', 'star', 'Star'
  ]

  for (const fieldName of exactMatches) {
    const value = submissionData[fieldName]
    if (typeof value === 'number' && value >= 1 && value <= 10) {
      console.log(`✅ Found rating via exact match: ${fieldName} = ${value}`)
      return value
    }
    // Also try string values that can be converted to numbers
    if (typeof value === 'string' && !isNaN(Number(value))) {
      const numValue = Number(value)
      if (numValue >= 1 && numValue <= 10) {
        console.log(`✅ Found rating via exact match (string): ${fieldName} = ${numValue}`)
        return numValue
      }
    }
  }

  // Then try pattern-based detection on field names
  const ratingPatterns = [
    /rating/i,
    /score/i,
    /stars?/i,
    /satisfaction/i,
    /rate/i,
    /review/i
  ]

  for (const [fieldId, value] of Object.entries(submissionData)) {
    let numValue: number | null = null

    if (typeof value === 'number') {
      numValue = value
    } else if (typeof value === 'string' && !isNaN(Number(value))) {
      numValue = Number(value)
    }

    if (numValue !== null && numValue >= 1 && numValue <= 10) {
      for (const pattern of ratingPatterns) {
        if (pattern.test(fieldId)) {
          console.log(`✅ Found rating via pattern match: ${fieldId} = ${numValue}`)
          return numValue
        }
      }
    }
  }

  // Finally, look for any numeric field that could be a rating (1-5 or 1-10 range)
  for (const [fieldId, value] of Object.entries(submissionData)) {
    let numValue: number | null = null

    if (typeof value === 'number') {
      numValue = value
    } else if (typeof value === 'string' && !isNaN(Number(value))) {
      numValue = Number(value)
    }

    if (numValue !== null && numValue >= 1 && numValue <= 10 && Number.isInteger(numValue)) {
      // Skip fields that are clearly not ratings
      if (!/id|count|index|year|month|day|phone|zip|postal/i.test(fieldId)) {
        console.log(`✅ Found rating via fallback: ${fieldId} = ${numValue}`)
        return numValue
      }
    }
  }

  console.log('❌ No rating found in submission data')
  return null
}

/**
 * Intelligent feedback text detection
 */
function findFeedbackTextIntelligent(submissionData: Record<string, any>): string | null {
  console.log('🔍 Finding feedback text in submission data:', Object.keys(submissionData))

  // First try exact matches (expanded list)
  const exactMatches = [
    'feedback', 'Feedback', 'FEEDBACK',
    'comment', 'Comment', 'COMMENT',
    'comments', 'Comments', 'COMMENTS',
    'message', 'Message', 'MESSAGE',
    'review', 'Review', 'REVIEW',
    'experience', 'Experience', 'EXPERIENCE',
    'experience-feedback', 'experience_feedback', 'experienceFeedback',
    'thoughts', 'Thoughts', 'THOUGHTS',
    'opinion', 'Opinion', 'OPINION',
    'description', 'Description', 'DESCRIPTION',
    'details', 'Details', 'DETAILS',
    'text', 'Text', 'TEXT',
    'content', 'Content', 'CONTENT'
  ]

  for (const fieldName of exactMatches) {
    const value = submissionData[fieldName]
    if (typeof value === 'string' && value.trim()) {
      console.log(`✅ Found feedback via exact match: ${fieldName} = "${value.substring(0, 50)}..."`)
      return value.trim()
    }
  }

  // Then try pattern-based detection
  const textPatterns = [
    /feedback/i,
    /comment/i,
    /message/i,
    /review/i,
    /experience/i,
    /thoughts/i,
    /opinion/i,
    /description/i,
    /details/i,
    /tell.*us/i,
    /additional/i,
    /other/i,
    /anything/i,
    /improve/i,
    /suggest/i,
    /like/i,
    /dislike/i
  ]

  for (const [fieldId, value] of Object.entries(submissionData)) {
    if (typeof value === 'string' && value.trim()) {
      for (const pattern of textPatterns) {
        if (pattern.test(fieldId)) {
          console.log(`✅ Found feedback via pattern match: ${fieldId} = "${value.substring(0, 50)}..."`)
          return value.trim()
        }
      }
    }
  }

  // Finally, look for the longest text field as likely feedback
  let longestText = ''
  let longestFieldId = ''

  for (const [fieldId, value] of Object.entries(submissionData)) {
    if (typeof value === 'string' && value.trim().length > longestText.length) {
      // Skip fields that are likely personal info or short values
      if (!/name|email|phone|address|id|url|link/i.test(fieldId) && value.trim().length > 5) {
        longestText = value.trim()
        longestFieldId = fieldId
      }
    }
  }

  if (longestText.length > 10) {
    console.log(`✅ Found feedback via longest text: ${longestFieldId} = "${longestText.substring(0, 50)}..."`)
    return longestText
  }

  console.log('❌ No feedback text found in submission data')
  return null
}
