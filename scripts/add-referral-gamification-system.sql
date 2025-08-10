-- KlaroLink Referral & Gamification System Migration
-- This migration adds comprehensive referral tracking and gamification features

-- 1. User Points and Rewards System
CREATE TABLE IF NOT EXISTS user_points (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_points_redeemed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, business_id)
);

-- 2. Point Transactions Log
CREATE TABLE IF NOT EXISTS point_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'earned', 'redeemed', 'bonus'
    points INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL, -- 'feedback_submission', 'referral_success', 'welcome_bonus', etc.
    reference_id INTEGER, -- ID of related feedback, referral, etc.
    reference_type VARCHAR(50), -- 'feedback_submission', 'referral', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Badges and Achievements
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    badge_type VARCHAR(100) NOT NULL, -- 'first_feedback', 'feedback_champion', 'super_referrer', etc.
    badge_name VARCHAR(255) NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(50), -- emoji or icon identifier
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, business_id, badge_type)
);

-- 4. Referral System
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    referred_email VARCHAR(255) NOT NULL,
    referred_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'expired'
    referrer_reward_points INTEGER DEFAULT 0,
    referred_reward_points INTEGER DEFAULT 0,
    referrer_rewarded BOOLEAN DEFAULT FALSE,
    referred_rewarded BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Referral Tracking (for analytics)
CREATE TABLE IF NOT EXISTS referral_clicks (
    id SERIAL PRIMARY KEY,
    referral_id INTEGER NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    converted BOOLEAN DEFAULT FALSE
);

-- 6. Gamification Settings per Business
CREATE TABLE IF NOT EXISTS gamification_settings (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    points_per_feedback INTEGER DEFAULT 10,
    points_per_referral INTEGER DEFAULT 50,
    welcome_bonus_points INTEGER DEFAULT 25,
    referral_expiry_days INTEGER DEFAULT 30,
    min_points_for_reward INTEGER DEFAULT 100,
    gamification_enabled BOOLEAN DEFAULT TRUE,
    referral_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id)
);

-- 7. Reward Redemptions
CREATE TABLE IF NOT EXISTS reward_redemptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    points_redeemed INTEGER NOT NULL,
    reward_type VARCHAR(100) NOT NULL, -- 'discount', 'freebie', 'custom'
    reward_description TEXT NOT NULL,
    reward_code VARCHAR(100), -- discount code, etc.
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'redeemed', 'expired'
    redeemed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Social Shares Tracking
CREATE TABLE IF NOT EXISTS social_shares (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'facebook', 'twitter', 'linkedin', 'whatsapp', 'email'
    shared_url TEXT NOT NULL,
    referral_code VARCHAR(50),
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_business ON user_points(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_business ON social_shares(business_id);

-- Insert default gamification settings for existing businesses
INSERT INTO gamification_settings (business_id, points_per_feedback, points_per_referral, welcome_bonus_points)
SELECT id, 10, 50, 25 FROM businesses
ON CONFLICT (business_id) DO NOTHING;

-- Add referral tracking to feedback submissions table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'feedback_submissions' 
                   AND column_name = 'referral_code') THEN
        ALTER TABLE feedback_submissions ADD COLUMN referral_code VARCHAR(50);
        CREATE INDEX IF NOT EXISTS idx_feedback_referral_code ON feedback_submissions(referral_code);
    END IF;
END $$;

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS VARCHAR(50) AS $$
DECLARE
    code VARCHAR(50);
    exists_check INTEGER;
BEGIN
    LOOP
        code := 'REF' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        SELECT COUNT(*) INTO exists_check FROM referrals WHERE referral_code = code;
        EXIT WHEN exists_check = 0;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to award points to users
CREATE OR REPLACE FUNCTION award_points(
    p_user_id INTEGER,
    p_business_id INTEGER,
    p_points INTEGER,
    p_reason VARCHAR(255),
    p_reference_id INTEGER DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Insert or update user points
    INSERT INTO user_points (user_id, business_id, points_balance, total_points_earned)
    VALUES (p_user_id, p_business_id, p_points, p_points)
    ON CONFLICT (user_id, business_id)
    DO UPDATE SET 
        points_balance = user_points.points_balance + p_points,
        total_points_earned = user_points.total_points_earned + p_points,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Log the transaction
    INSERT INTO point_transactions (user_id, business_id, transaction_type, points, reason, reference_id, reference_type)
    VALUES (p_user_id, p_business_id, 'earned', p_points, p_reason, p_reference_id, p_reference_type);
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id INTEGER, p_business_id INTEGER) RETURNS VOID AS $$
DECLARE
    feedback_count INTEGER;
    referral_count INTEGER;
    total_points INTEGER;
BEGIN
    -- Get user stats
    SELECT COUNT(*) INTO feedback_count 
    FROM feedback_submissions 
    WHERE business_id = p_business_id 
    AND submission_data->>'submitter_email' = (SELECT email FROM users WHERE id = p_user_id);
    
    SELECT COUNT(*) INTO referral_count 
    FROM referrals 
    WHERE referrer_user_id = p_user_id AND business_id = p_business_id AND status = 'completed';
    
    SELECT COALESCE(total_points_earned, 0) INTO total_points 
    FROM user_points 
    WHERE user_id = p_user_id AND business_id = p_business_id;
    
    -- Award badges based on achievements
    
    -- First Feedback Badge
    IF feedback_count >= 1 THEN
        INSERT INTO user_badges (user_id, business_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, p_business_id, 'first_feedback', 'First Feedback', 'Submitted your first feedback', '🎯')
        ON CONFLICT (user_id, business_id, badge_type) DO NOTHING;
    END IF;
    
    -- Feedback Champion Badge (5+ feedback)
    IF feedback_count >= 5 THEN
        INSERT INTO user_badges (user_id, business_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, p_business_id, 'feedback_champion', 'Feedback Champion', 'Submitted 5+ pieces of feedback', '🏆')
        ON CONFLICT (user_id, business_id, badge_type) DO NOTHING;
    END IF;
    
    -- Super Referrer Badge (3+ successful referrals)
    IF referral_count >= 3 THEN
        INSERT INTO user_badges (user_id, business_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, p_business_id, 'super_referrer', 'Super Referrer', 'Successfully referred 3+ people', '🌟')
        ON CONFLICT (user_id, business_id, badge_type) DO NOTHING;
    END IF;
    
    -- Points Collector Badge (100+ points)
    IF total_points >= 100 THEN
        INSERT INTO user_badges (user_id, business_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, p_business_id, 'points_collector', 'Points Collector', 'Earned 100+ points', '💎')
        ON CONFLICT (user_id, business_id, badge_type) DO NOTHING;
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Trigger to award points and badges after feedback submission
CREATE OR REPLACE FUNCTION trigger_award_feedback_points() RETURNS TRIGGER AS $$
DECLARE
    submitter_email VARCHAR(255);
    submitter_user_id INTEGER;
    points_to_award INTEGER;
BEGIN
    -- Extract submitter email from submission_data
    submitter_email := NEW.submission_data->>'submitter_email';
    
    IF submitter_email IS NOT NULL THEN
        -- Find user by email
        SELECT id INTO submitter_user_id FROM users WHERE email = submitter_email;
        
        IF submitter_user_id IS NOT NULL THEN
            -- Get points per feedback from gamification settings
            SELECT points_per_feedback INTO points_to_award 
            FROM gamification_settings 
            WHERE business_id = NEW.business_id;
            
            -- Award points for feedback submission
            PERFORM award_points(
                submitter_user_id, 
                NEW.business_id, 
                COALESCE(points_to_award, 10), 
                'Feedback submission', 
                NEW.id, 
                'feedback_submission'
            );
            
            -- Check and award badges
            PERFORM check_and_award_badges(submitter_user_id, NEW.business_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for feedback submissions
DROP TRIGGER IF EXISTS trigger_feedback_points ON feedback_submissions;
CREATE TRIGGER trigger_feedback_points
    AFTER INSERT ON feedback_submissions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_award_feedback_points();

COMMENT ON TABLE user_points IS 'Tracks user points balance and totals per business';
COMMENT ON TABLE point_transactions IS 'Log of all point earning and redemption transactions';
COMMENT ON TABLE user_badges IS 'User achievements and badges per business';
COMMENT ON TABLE referrals IS 'Referral tracking system';
COMMENT ON TABLE gamification_settings IS 'Gamification configuration per business';
COMMENT ON TABLE reward_redemptions IS 'User reward redemption history';
COMMENT ON TABLE social_shares IS 'Social media sharing tracking';
