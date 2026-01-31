-- ================================
-- Set Admin User
-- Run this in Supabase SQL Editor
-- ================================

-- Insert or update admin user profile
INSERT INTO user_profiles (email, role)
VALUES ('armsves@gmail.com', 'admin')
ON CONFLICT (privy_id) DO UPDATE SET role = 'admin';

-- Or if the user already exists with a different privy_id, update by email:
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'armsves@gmail.com';

-- Verify admin was set
SELECT * FROM user_profiles WHERE email = 'armsves@gmail.com';
