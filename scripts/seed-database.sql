-- Insert sample business
INSERT INTO businesses (name, email, password_hash, slug, profile_image) VALUES 
('Demo Business', 'demo@klarolink.com', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'demo-business', '/placeholder.svg?height=100&width=100');

-- Insert sample feedback form
INSERT INTO feedback_forms (business_id, title, description, fields) VALUES 
(1, 'Customer Feedback', 'We value your feedback! Please share your experience with us.', '[{"id":"name","type":"text","label":"Your Name","required":true,"placeholder":"Enter your name"},{"id":"email","type":"email","label":"Email Address","required":false,"placeholder":"your@email.com"},{"id":"rating","type":"rating","label":"Overall Rating","required":true},{"id":"feedback","type":"textarea","label":"Your Feedback","required":true,"placeholder":"Tell us about your experience..."}]');

-- Insert sample social links
INSERT INTO social_links (business_id, platform, url, display_order) VALUES 
(1, 'website', 'https://example.com', 1);

INSERT INTO social_links (business_id, platform, url, display_order) VALUES 
(1, 'instagram', 'https://instagram.com/demo', 2);

INSERT INTO social_links (business_id, platform, url, display_order) VALUES 
(1, 'twitter', 'https://twitter.com/demo', 3);
