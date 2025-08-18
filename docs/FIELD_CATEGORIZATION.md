# Field Categorization System

## Overview

The Field Categorization System automatically identifies and categorizes form fields to enable consistent analytics across custom forms. This solves the problem where analytics components expected hardcoded field names like `rating` and `feedback`, but custom forms could use any field names.

## Problem Solved

**Before**: Analytics failed when custom forms used different field names:
- Custom form with `overall-rating` field → Analytics looked for `rating` → No rating displayed
- Custom form with `experience-feedback` field → Analytics looked for `feedback` → "No feedback text provided"

**After**: Analytics work with any field names:
- Custom form with `overall-rating` → Automatically categorized as `rating` → Analytics display correctly
- Custom form with `experience-feedback` → Automatically categorized as `feedback_text` → Analytics display correctly

## Field Categories

The system recognizes these field categories:

| Category | Description | Examples |
|----------|-------------|----------|
| `rating` | Rating/score fields (1-5 stars, 1-10 scale) | `overall-rating`, `product-rating`, `satisfaction-score` |
| `feedback_text` | Main feedback/comment text fields | `experience-feedback`, `comments`, `review-text` |
| `personal_info` | Name and personal information | `customer-name`, `full-name`, `user-name` |
| `contact` | Email, phone, contact information | `contact-email`, `phone-number`, `customer-email` |
| `demographic` | Age, location, job title, etc. | `age`, `location`, `job-title` |
| `satisfaction` | Satisfaction-related select/checkbox fields | `service-quality`, `product-satisfaction` |
| `recommendation` | Would you recommend fields | `recommend-service`, `nps-score`, `referral-likelihood` |
| `custom` | Other custom fields | Any field that doesn't match above categories |

## How It Works

### 1. Automatic Categorization

Fields are automatically categorized based on:

- **Field ID patterns**: `rating`, `overall-rating`, `product-rating`, etc.
- **Field labels**: "How satisfied are you?", "Rate this product", etc.
- **Field types**: `rating`, `textarea`, `email`, etc.

### 2. Priority and Confidence

Each categorization has:
- **Priority** (1-10): Higher priority fields are preferred for analytics
- **Confidence** (0-1): How confident the system is in the categorization

### 3. Data Extraction

When extracting analytics data, the system:
1. Finds all fields in each category
2. Sorts by priority × confidence
3. Uses the highest-scoring field for analytics

## Usage

### For Analytics Components

```typescript
import { extractAnalyticsData } from '@/lib/field-categorization'

// Extract rating and feedback from any submission
const analyticsData = await extractAnalyticsData(
  submissionData,
  formId,
  formFields // optional
)

console.log(analyticsData.rating)      // 4
console.log(analyticsData.feedbackText) // "Great service!"
```

### For Fallback Compatibility

```typescript
import { extractDataWithFallback } from '@/lib/field-categorization'

// Works with both categorized and legacy field names
const data = extractDataWithFallback(submissionData)

console.log(data.rating)      // Works with 'rating', 'overall-rating', etc.
console.log(data.feedbackText) // Works with 'feedback', 'comment', 'message', etc.
```

### For Form Templates

```typescript
const field: FormField = {
  id: "service-rating",
  type: "rating",
  label: "Rate our service",
  required: true,
  field_category: "rating" // Optional: explicit categorization
}
```

## Database Schema

### Field Categorizations Table

```sql
CREATE TABLE field_categorizations (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES feedback_forms(id),
    field_id VARCHAR(255) NOT NULL,
    field_category VARCHAR(50) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    auto_categorized BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(form_id, field_id)
);
```

### Automatic Triggers

- **Form Creation/Update**: Automatically categorizes fields when forms are saved
- **Submission Processing**: Uses categorized extraction for rating/feedback

## Migration

### For Existing Forms

Run the migration script to categorize existing forms:

```bash
node scripts/migrate-existing-forms.js
```

### Database Migration

Apply the schema changes:

```bash
psql $DATABASE_URL -f scripts/add-field-categorization.sql
```

## Examples

### Customer Satisfaction Form

```typescript
const fields = [
  {
    id: "overall-rating",           // → rating (priority: 10)
    type: "rating",
    label: "How satisfied are you?"
  },
  {
    id: "experience-feedback",      // → feedback_text (priority: 9)
    type: "textarea", 
    label: "Tell us about your experience"
  },
  {
    id: "contact-email",           // → contact (priority: 4)
    type: "email",
    label: "Your email"
  }
]

// Submission data
const submission = {
  "overall-rating": 5,
  "experience-feedback": "Excellent service!",
  "contact-email": "customer@example.com"
}

// Analytics extraction
const analytics = await extractAnalyticsData(submission, formId, fields)
// Result: { rating: 5, feedbackText: "Excellent service!" }
```

### Product Feedback Form

```typescript
const fields = [
  {
    id: "product-rating",          // → rating (priority: 10)
    type: "rating",
    label: "Rate this product"
  },
  {
    id: "favorite-features",       // → feedback_text (priority: 9)
    type: "textarea",
    label: "What features do you like?"
  },
  {
    id: "missing-features",        // → feedback_text (priority: 9)
    type: "textarea", 
    label: "What features are missing?"
  }
]

// The system will pick the highest priority feedback field
// Both textarea fields have same priority, so first one wins
```

## Testing

Run the test suite:

```bash
npm test tests/field-categorization.test.ts
```

Tests cover:
- Field categorization accuracy
- Data extraction from various form configurations
- Fallback behavior for legacy field names
- Edge cases and error handling

## Backwards Compatibility

The system maintains full backwards compatibility:

1. **Legacy field names** (`rating`, `feedback`) still work
2. **Existing forms** continue to function without changes
3. **Gradual migration** - forms are categorized as they're updated
4. **Fallback extraction** - if categorization fails, falls back to hardcoded names

## Performance

- **Database triggers** automatically maintain categorizations
- **Caching** of field categorizations for frequently accessed forms
- **Efficient queries** using indexed lookups
- **Minimal overhead** - categorization happens once per form update

## Troubleshooting

### Analytics Not Showing Data

1. Check if form fields are categorized:
   ```sql
   SELECT * FROM field_categorizations WHERE form_id = YOUR_FORM_ID;
   ```

2. Verify submission data structure:
   ```sql
   SELECT submission_data FROM feedback_submissions WHERE id = YOUR_SUBMISSION_ID;
   ```

3. Test extraction manually:
   ```typescript
   const result = extractDataWithFallback(submissionData)
   console.log(result)
   ```

### Low Confidence Categorizations

If fields are miscategorized, you can:

1. **Update field labels** to be more descriptive
2. **Use explicit categorization** in form templates
3. **Adjust categorization rules** in `field-categorization.ts`

### Custom Field Types

For new field types, update the categorization rules:

```typescript
// Add to FIELD_CATEGORIZATION_RULES
my_custom_category: {
  idPatterns: [/custom-pattern/i],
  labelPatterns: [/custom label/i],
  fieldTypes: ['custom-type'],
  priority: 8
}
```
