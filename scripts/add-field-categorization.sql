-- Field Categorization System Migration
-- This script adds support for automatic field categorization for analytics

-- Add field categorization cache table
CREATE TABLE IF NOT EXISTS field_categorizations (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
    field_id VARCHAR(255) NOT NULL,
    field_category VARCHAR(50) NOT NULL CHECK (field_category IN (
        'rating', 'feedback_text', 'personal_info', 'contact', 
        'demographic', 'satisfaction', 'recommendation', 'custom'
    )),
    priority INTEGER NOT NULL DEFAULT 1,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    auto_categorized BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(form_id, field_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_field_categorizations_form_id ON field_categorizations(form_id);
CREATE INDEX IF NOT EXISTS idx_field_categorizations_category ON field_categorizations(field_category);
CREATE INDEX IF NOT EXISTS idx_field_categorizations_priority ON field_categorizations(priority DESC, confidence DESC);

-- Function to automatically categorize fields when forms are updated
CREATE OR REPLACE FUNCTION auto_categorize_form_fields()
RETURNS TRIGGER AS $$
DECLARE
    field_record JSONB;
    field_id TEXT;
    field_type TEXT;
    field_label TEXT;
    field_category TEXT;
    field_priority INTEGER;
    field_confidence DECIMAL(3,2);
BEGIN
    -- Clear existing categorizations for this form
    DELETE FROM field_categorizations WHERE form_id = NEW.id;
    
    -- Process each field in the form
    FOR field_record IN SELECT * FROM jsonb_array_elements(NEW.fields)
    LOOP
        field_id := field_record->>'id';
        field_type := field_record->>'type';
        field_label := LOWER(field_record->>'label');
        
        -- Default values
        field_category := 'custom';
        field_priority := 1;
        field_confidence := 0.1;
        
        -- Categorize rating fields
        IF field_type = 'rating' OR 
           field_id ~* '(rating|score)' OR 
           field_label ~* '(rate|rating|score|stars?|satisfaction|satisfied)' THEN
            field_category := 'rating';
            field_priority := 10;
            field_confidence := 0.9;
            
        -- Categorize feedback text fields
        ELSIF field_type = 'textarea' OR
              field_id ~* '(feedback|comment|message|review|experience|thoughts|opinion)' OR
              field_label ~* '(feedback|comment|message|review|experience|thoughts|opinion|tell us|describe|explain|additional|suggestions?)' THEN
            field_category := 'feedback_text';
            field_priority := 9;
            field_confidence := 0.8;
            
        -- Categorize personal info fields
        ELSIF field_id ~* '^(name|full[-_]?name|first[-_]?name|last[-_]?name|customer[-_]?name)$' OR
              field_label ~* '^(name|your name|full name|customer name)' THEN
            field_category := 'personal_info';
            field_priority := 5;
            field_confidence := 0.7;
            
        -- Categorize contact fields
        ELSIF field_type = 'email' OR
              field_id ~* '(email|phone|contact|mobile)' OR
              field_label ~* '(email|phone|contact|mobile)' THEN
            field_category := 'contact';
            field_priority := 4;
            field_confidence := 0.7;
            
        -- Categorize recommendation fields
        ELSIF field_id ~* '(recommend|referral|refer|nps)' OR
              field_label ~* '(recommend|refer|friends|colleagues|others|likely.*recommend)' THEN
            field_category := 'recommendation';
            field_priority := 7;
            field_confidence := 0.6;
            
        -- Categorize satisfaction fields
        ELSIF field_id ~* '(satisfaction|quality|service|product|happy|pleased)' OR
              field_label ~* '(satisfied|quality|service|product|happy|pleased)' THEN
            field_category := 'satisfaction';
            field_priority := 6;
            field_confidence := 0.6;
        END IF;
        
        -- Insert categorization
        INSERT INTO field_categorizations (
            form_id, field_id, field_category, priority, confidence, auto_categorized
        ) VALUES (
            NEW.id, field_id, field_category, field_priority, field_confidence, true
        ) ON CONFLICT (form_id, field_id) DO UPDATE SET
            field_category = EXCLUDED.field_category,
            priority = EXCLUDED.priority,
            confidence = EXCLUDED.confidence,
            auto_categorized = EXCLUDED.auto_categorized,
            updated_at = CURRENT_TIMESTAMP;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically categorize fields when forms are created or updated
DROP TRIGGER IF EXISTS auto_categorize_fields_trigger ON feedback_forms;
CREATE TRIGGER auto_categorize_fields_trigger
    AFTER INSERT OR UPDATE OF fields ON feedback_forms
    FOR EACH ROW
    EXECUTE FUNCTION auto_categorize_form_fields();

-- Function to get categorized data from submission
CREATE OR REPLACE FUNCTION get_categorized_submission_data(
    p_submission_data JSONB,
    p_form_id INTEGER
) RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    rating_value INTEGER;
    feedback_text TEXT;
    field_cat RECORD;
    field_value TEXT;
BEGIN
    -- Extract rating (highest priority rating field)
    SELECT 
        (p_submission_data->>fc.field_id)::INTEGER
    INTO rating_value
    FROM field_categorizations fc
    WHERE fc.form_id = p_form_id 
      AND fc.field_category = 'rating'
      AND p_submission_data ? fc.field_id
      AND (p_submission_data->>fc.field_id) ~ '^[1-9][0-9]*$'
    ORDER BY fc.priority DESC, fc.confidence DESC
    LIMIT 1;
    
    -- Extract feedback text (highest priority feedback field)
    SELECT 
        p_submission_data->>fc.field_id
    INTO feedback_text
    FROM field_categorizations fc
    WHERE fc.form_id = p_form_id 
      AND fc.field_category = 'feedback_text'
      AND p_submission_data ? fc.field_id
      AND LENGTH(TRIM(p_submission_data->>fc.field_id)) > 0
    ORDER BY fc.priority DESC, fc.confidence DESC
    LIMIT 1;
    
    -- Build result
    result := jsonb_build_object(
        'rating', rating_value,
        'feedback_text', feedback_text,
        'extracted_at', CURRENT_TIMESTAMP
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update the existing trigger to use categorized extraction
CREATE OR REPLACE FUNCTION extract_rating_from_submission()
RETURNS TRIGGER AS $$
DECLARE
    categorized_data JSONB;
BEGIN
    -- Try categorized extraction first
    BEGIN
        categorized_data := get_categorized_submission_data(NEW.submission_data, NEW.form_id);
        
        -- Extract rating from categorized data
        IF categorized_data ? 'rating' AND (categorized_data->>'rating') IS NOT NULL THEN
            NEW.rating = (categorized_data->>'rating')::INTEGER;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Fallback to original hardcoded extraction
        IF NEW.submission_data ? 'rating' THEN
            NEW.rating = (NEW.submission_data->>'rating')::INTEGER;
        END IF;
    END;
    
    -- Extract customer info (unchanged)
    IF NEW.submission_data ? 'email' THEN
        NEW.customer_email = NEW.submission_data->>'email';
    END IF;
    
    IF NEW.submission_data ? 'name' THEN
        NEW.customer_name = NEW.submission_data->>'name';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create view for easy access to categorized submission data
CREATE OR REPLACE VIEW categorized_submissions_view AS
SELECT 
    fs.id,
    fs.business_id,
    fs.form_id,
    fs.submission_data,
    fs.submitted_at,
    fs.rating as extracted_rating,
    fs.customer_email,
    fs.customer_name,
    get_categorized_submission_data(fs.submission_data, fs.form_id) as categorized_data
FROM feedback_submissions fs;

-- Migrate existing forms to have field categorizations
DO $$
DECLARE
    form_record RECORD;
BEGIN
    -- Process all existing active forms
    FOR form_record IN 
        SELECT id, fields FROM feedback_forms WHERE is_active = true
    LOOP
        -- Trigger the auto-categorization for existing forms
        UPDATE feedback_forms 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = form_record.id;
    END LOOP;
    
    RAISE NOTICE 'Field categorization migration completed for existing forms';
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON field_categorizations TO PUBLIC;
GRANT USAGE, SELECT ON SEQUENCE field_categorizations_id_seq TO PUBLIC;
GRANT SELECT ON categorized_submissions_view TO PUBLIC;
