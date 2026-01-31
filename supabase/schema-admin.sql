-- ================================
-- ADMIN FEATURES SCHEMA ADDITIONS
-- Run this in Supabase SQL Editor after schema.sql
-- ================================

-- Add is_disabled to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;

-- Offramp requests table (businesses requesting to withdraw crypto to fiat)
CREATE TABLE IF NOT EXISTS offramp_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Amount details
  amount_usdc DECIMAL(18, 6) NOT NULL,
  amount_thb DECIMAL(10, 2), -- Calculated at fulfillment
  
  -- Bank details
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_account_name VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'fulfilled', 'rejected')),
  
  -- Admin notes
  admin_notes TEXT,
  fulfilled_by VARCHAR(255),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  
  -- Transaction reference
  tx_hash VARCHAR(66),
  bank_transfer_ref VARCHAR(100)
);

-- Index for offramp requests
CREATE INDEX IF NOT EXISTS idx_offramp_requests_status ON offramp_requests(status);
CREATE INDEX IF NOT EXISTS idx_offramp_requests_business ON offramp_requests(business_id);

-- RLS for offramp_requests
ALTER TABLE offramp_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Offramp requests viewable by all" ON offramp_requests
  FOR SELECT USING (true);

CREATE POLICY "Businesses can create offramp requests" ON offramp_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Offramp requests can be updated" ON offramp_requests
  FOR UPDATE USING (true);

-- Trigger for updated_at on offramp_requests
DROP TRIGGER IF EXISTS update_offramp_requests_updated_at ON offramp_requests;
CREATE TRIGGER update_offramp_requests_updated_at
  BEFORE UPDATE ON offramp_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update the businesses policy to allow admin to see all (even inactive)
DROP POLICY IF EXISTS "Businesses are viewable by everyone" ON businesses;
CREATE POLICY "Businesses are viewable by everyone" ON businesses
  FOR SELECT USING (true);

-- Sample offramp requests for testing
INSERT INTO offramp_requests (business_id, amount_usdc, bank_name, bank_account_number, bank_account_name, status) VALUES
('b1000001-0000-0000-0000-000000000001', 500.00, 'Bangkok Bank', '1234567890', 'Nimman Cafe Co Ltd', 'pending'),
('b1000001-0000-0000-0000-000000000002', 250.50, 'Kasikorn Bank', '0987654321', 'Thai Street Kitchen Ltd', 'pending'),
('b1000001-0000-0000-0000-000000000003', 1200.00, 'SCB', '5555666677', 'Digital Hub Co Ltd', 'processing')
ON CONFLICT DO NOTHING;
