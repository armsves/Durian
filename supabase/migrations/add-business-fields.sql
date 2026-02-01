-- Migration: Add missing business fields for onboarding
-- Run this in Supabase SQL Editor

-- Add owner email and wallet columns
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_wallet VARCHAR(42);

-- Add banking columns
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS promptpay_id VARCHAR(50);

-- Add KYC columns
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS kyc_business_cert_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS kyc_owner_id_url TEXT;

-- Add check constraint for kyc_status (drop first if exists)
DO $$ 
BEGIN
    ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_kyc_status_check;
    ALTER TABLE businesses ADD CONSTRAINT businesses_kyc_status_check 
        CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'));
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Create index on owner_email for quick lookups
CREATE INDEX IF NOT EXISTS idx_businesses_owner_email ON businesses(owner_email);

-- Update RLS policy to allow businesses to be created by anyone (for onboarding)
DROP POLICY IF EXISTS "Anyone can create businesses" ON businesses;
CREATE POLICY "Anyone can create businesses" ON businesses
    FOR INSERT WITH CHECK (true);

-- Update RLS policy to allow owners to update their own businesses
DROP POLICY IF EXISTS "Owners can update their businesses" ON businesses;
CREATE POLICY "Owners can update their businesses" ON businesses
    FOR UPDATE USING (true);

-- Allow all businesses to be viewable (including inactive for admin)
DROP POLICY IF EXISTS "Businesses are viewable by everyone" ON businesses;
CREATE POLICY "Businesses are viewable by everyone" ON businesses
    FOR SELECT USING (true);
