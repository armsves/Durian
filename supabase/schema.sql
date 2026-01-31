-- ================================
-- DURIAN - Supabase Database Schema
-- ================================
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- BUSINESSES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  privy_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cafe', 'restaurant', 'spa', 'hotel', 'shop', 'tour', 'coworking', 'other')),
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  address TEXT NOT NULL,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  hours JSONB,
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'not_started')),
  bank_details JSONB,
  wallet_address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating FLOAT8 NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- MENU ITEMS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_thb NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  description TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- PAYMENT INTENTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount_thb NUMERIC(10, 2) NOT NULL,
  amount_usdc NUMERIC(18, 6) NOT NULL,
  exchange_rate NUMERIC(10, 4) NOT NULL DEFAULT 35.70,
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  payment_method TEXT CHECK (payment_method IN ('usdc', 'revolut', 'promptpay')),
  revolut_link TEXT,
  usdc_tx_hash TEXT,
  verified_by_primus BOOLEAN NOT NULL DEFAULT FALSE,
  payer_wallet TEXT,
  payer_email TEXT,
  notes TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- USER PROFILES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  privy_user_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('business', 'tourist', 'admin')),
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- TRANSACTIONS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_intent_id UUID NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount_usdc NUMERIC(18, 6) NOT NULL,
  tx_hash TEXT NOT NULL,
  chain_id INT NOT NULL DEFAULT 84532,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- INDEXES
-- ================================
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(lat, lng);
CREATE INDEX IF NOT EXISTS idx_businesses_kyc_status ON businesses(kyc_status);
CREATE INDEX IF NOT EXISTS idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_business_id ON payment_intents(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_reference ON payment_intents(reference);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_privy_user_id ON user_profiles(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_intent_id ON transactions(payment_intent_id);

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Public read access for businesses (directory)
CREATE POLICY "Public can view approved businesses"
  ON businesses FOR SELECT
  USING (kyc_status = 'approved');

-- Business owners can manage their own business
CREATE POLICY "Business owners can manage own business"
  ON businesses FOR ALL
  USING (privy_user_id = auth.uid()::text);

-- Public read access for menu items
CREATE POLICY "Public can view menu items"
  ON menu_items FOR SELECT
  USING (true);

-- Business owners can manage their menu
CREATE POLICY "Business owners can manage menu items"
  ON menu_items FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE privy_user_id = auth.uid()::text
    )
  );

-- Public can create payment intents
CREATE POLICY "Anyone can create payment intents"
  ON payment_intents FOR INSERT
  WITH CHECK (true);

-- Public can view payment intents by reference
CREATE POLICY "Anyone can view payment intents"
  ON payment_intents FOR SELECT
  USING (true);

-- Users can manage their own profile
CREATE POLICY "Users can manage own profile"
  ON user_profiles FOR ALL
  USING (privy_user_id = auth.uid()::text);

-- ================================
-- UPDATED_AT TRIGGER
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SAMPLE DATA (for demo)
-- ================================
INSERT INTO businesses (privy_user_id, name, category, description, address, lat, lng, kyc_status, rating, review_count, is_featured, cover_url)
VALUES
  ('demo-user-1', 'Nimman Café & Roasters', 'cafe', 'Specialty coffee roasters in the heart of Nimman. Farm-to-cup beans from Northern Thailand highlands.', 'Nimmanhaemin Rd Soi 9, Chiang Mai', 18.7970, 98.9677, 'approved', 4.8, 127, true, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800'),
  ('demo-user-2', 'Lanna Thai Wellness Spa', 'spa', 'Traditional Thai massage and wellness treatments in a serene garden setting.', 'Tha Phae Gate, Old City', 18.7879, 98.9937, 'approved', 4.9, 89, true, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'),
  ('demo-user-3', 'Farm Story Restaurant', 'restaurant', 'Farm-to-table Northern Thai cuisine. Organic ingredients from local farmers.', 'Santitham Road, Chang Phueak', 18.8050, 98.9850, 'approved', 4.6, 203, false, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'),
  ('demo-user-4', 'Doi Suthep Tour Co.', 'tour', 'Guided tours to Doi Suthep temple and surrounding mountain trails.', 'Huay Kaew Road', 18.8048, 98.9215, 'approved', 4.7, 156, false, 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800'),
  ('demo-user-5', 'Maya Lifestyle Shopping', 'shop', 'Premium shopping destination with international and local brands.', '55 Huay Kaew Rd', 18.8020, 98.9673, 'approved', 4.4, 312, false, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800')
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (business_id, name, category, price_thb, description, is_available)
SELECT 
  b.id,
  item.name,
  item.category,
  item.price_thb,
  item.description,
  true
FROM businesses b
CROSS JOIN (
  VALUES 
    ('Signature Pour Over', 'Coffee', 120, 'Single-origin beans from Doi Chang, hand-poured to perfection.'),
    ('Iced Latte', 'Coffee', 95, 'Espresso with cold milk over ice.'),
    ('Matcha Latte', 'Specialty', 110, 'Premium Japanese matcha with steamed milk.'),
    ('Croissant', 'Pastry', 85, 'Freshly baked butter croissant.')
) AS item(name, category, price_thb, description)
WHERE b.name = 'Nimman Café & Roasters'
ON CONFLICT DO NOTHING;
