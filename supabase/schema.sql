-- ================================
-- DURIAN DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- TABLES
-- ================================

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  
  -- Media
  image_url TEXT,
  logo_url TEXT,
  
  -- Location
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Business details
  price_range INTEGER DEFAULT 2 CHECK (price_range >= 1 AND price_range <= 4),
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Crypto
  wallet_address VARCHAR(42),
  accepts_usdc BOOLEAN DEFAULT true,
  accepts_revolut BOOLEAN DEFAULT true,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Owner
  owner_id UUID
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_thb DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false
);

-- Payment intents table
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  business_id UUID REFERENCES businesses(id),
  
  amount_thb DECIMAL(10, 2) NOT NULL,
  amount_usdc DECIMAL(18, 6),
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('usdc', 'revolut')),
  
  reference VARCHAR(50) UNIQUE,
  
  -- Payer info
  payer_wallet VARCHAR(42),
  payer_email VARCHAR(255),
  
  -- Transaction details
  tx_hash VARCHAR(66),
  revolut_link TEXT,
  primus_proof TEXT,
  
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Transactions table (completed payments)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  payment_intent_id UUID REFERENCES payment_intents(id),
  business_id UUID REFERENCES businesses(id),
  
  amount_thb DECIMAL(10, 2) NOT NULL,
  amount_usdc DECIMAL(18, 6) NOT NULL,
  
  payment_method VARCHAR(20) NOT NULL,
  tx_hash VARCHAR(66),
  
  status VARCHAR(20) DEFAULT 'completed'
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  privy_id VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  
  role VARCHAR(20) DEFAULT 'tourist' CHECK (role IN ('tourist', 'business', 'admin')),
  
  -- Tourist info
  wallet_address VARCHAR(42),
  
  -- Business info (if role is business)
  business_id UUID REFERENCES businesses(id)
);

-- ================================
-- INDEXES
-- ================================

CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_menu_items_business ON menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_business ON payment_intents(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_transactions_business ON transactions(business_id);

-- ================================
-- ROW LEVEL SECURITY
-- ================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for businesses and menu items
CREATE POLICY "Businesses are viewable by everyone" ON businesses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Menu items are viewable by everyone" ON menu_items
  FOR SELECT USING (true);

-- Allow inserts for authenticated users (for onboarding)
CREATE POLICY "Users can create businesses" ON businesses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own businesses" ON businesses
  FOR UPDATE USING (true);

CREATE POLICY "Users can create menu items" ON menu_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update menu items" ON menu_items
  FOR UPDATE USING (true);

CREATE POLICY "Payment intents are viewable by involved parties" ON payment_intents
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create payment intents" ON payment_intents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Payment intents can be updated" ON payment_intents
  FOR UPDATE USING (true);

CREATE POLICY "Transactions are viewable by involved parties" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "User profiles are viewable" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update profiles" ON user_profiles
  FOR UPDATE USING (true);

-- ================================
-- SEED DATA - BUSINESSES
-- ================================

INSERT INTO businesses (id, name, slug, description, category, image_url, address, latitude, longitude, price_range, rating, review_count, wallet_address, is_verified, is_featured, is_active) VALUES
(
  'b1000001-0000-0000-0000-000000000001',
  'Nimman Café & Roasters',
  'nimman-cafe',
  'Specialty coffee roasters in the heart of Nimman. We source beans directly from Northern Thai farmers and roast them fresh daily. Cozy atmosphere with fast WiFi.',
  'cafe',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  '23/4 Nimmanhaemin Road, Soi 9, Suthep, Muang',
  18.7963,
  98.9683,
  2,
  4.8,
  234,
  '0x1234567890abcdef1234567890abcdef12345678',
  true,
  true,
  true
),
(
  'b1000001-0000-0000-0000-000000000002',
  'Thai Street Kitchen',
  'thai-street-kitchen',
  'Authentic Northern Thai cuisine in a modern setting. Famous for our Khao Soi and Som Tam. Family recipes passed down for generations.',
  'restaurant',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
  '45 Chang Klan Road, Night Bazaar Area',
  18.7853,
  98.9936,
  1,
  4.6,
  189,
  '0x2345678901abcdef2345678901abcdef23456789',
  true,
  true,
  true
),
(
  'b1000001-0000-0000-0000-000000000003',
  'Digital Nomad Hub',
  'digital-nomad-hub',
  'Premium coworking space with 24/7 access. High-speed fiber internet, meeting rooms, podcast studio, and a community of 500+ digital nomads.',
  'coworking',
  'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800',
  '99 Maya Mall, 4th Floor, Rincome Road',
  18.8028,
  98.9674,
  3,
  4.9,
  156,
  '0x3456789012abcdef3456789012abcdef34567890',
  true,
  true,
  true
),
(
  'b1000001-0000-0000-0000-000000000004',
  'Chiang Mai Craft Beer',
  'chiang-mai-craft-beer',
  'Local craft brewery and taproom. 12 rotating taps featuring our own brews and guest beers. Live music on weekends.',
  'bar',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
  '78 Loi Kroh Road',
  18.7872,
  98.9923,
  2,
  4.5,
  98,
  '0x4567890123abcdef4567890123abcdef45678901',
  true,
  false,
  true
),
(
  'b1000001-0000-0000-0000-000000000005',
  'Doi Suthep Wellness Spa',
  'doi-suthep-wellness',
  'Traditional Thai massage and wellness treatments. Our therapists have 10+ years experience. Organic products from local farms.',
  'wellness',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
  '156 Huay Kaew Road, Near Zoo',
  18.8123,
  98.9534,
  3,
  4.7,
  312,
  '0x5678901234abcdef5678901234abcdef56789012',
  true,
  false,
  true
),
(
  'b1000001-0000-0000-0000-000000000006',
  'Old City Boutique',
  'old-city-boutique',
  'Curated selection of local artisan products. Handmade textiles, ceramics, and jewelry from Northern Thai craftspeople.',
  'retail',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
  '12 Ratchadamnoen Road, Inside Tha Phae Gate',
  18.7876,
  98.9932,
  2,
  4.4,
  87,
  '0x6789012345abcdef6789012345abcdef67890123',
  true,
  false,
  true
),
(
  'b1000001-0000-0000-0000-000000000007',
  'Elephant Nature Tours',
  'elephant-nature-tours',
  'Ethical elephant sanctuary visits and nature tours. Full-day experiences with lunch included. Supporting elephant rescue and rehabilitation.',
  'tours',
  'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
  'Mae Taeng District (Pickup from Old City)',
  18.8456,
  98.8234,
  3,
  4.9,
  567,
  '0x7890123456abcdef7890123456abcdef78901234',
  true,
  true,
  true
),
(
  'b1000001-0000-0000-0000-000000000008',
  'Ping River Guesthouse',
  'ping-river-guesthouse',
  'Charming riverside accommodation with traditional Lanna architecture. Breakfast included. Bicycle rental available.',
  'accommodation',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  '234 Charoen Prathet Road, Riverside',
  18.7812,
  99.0012,
  2,
  4.6,
  423,
  '0x8901234567abcdef8901234567abcdef89012345',
  true,
  false,
  true
)
ON CONFLICT (id) DO NOTHING;

-- ================================
-- SEED DATA - MENU ITEMS
-- ================================

-- Nimman Café menu
INSERT INTO menu_items (business_id, name, description, price_thb, category, is_popular) VALUES
('b1000001-0000-0000-0000-000000000001', 'Single Origin Pour Over', 'Hand-brewed using beans from Doi Chang', 120, 'Coffee', true),
('b1000001-0000-0000-0000-000000000001', 'Iced Latte', 'Espresso with fresh local milk', 95, 'Coffee', true),
('b1000001-0000-0000-0000-000000000001', 'Matcha Latte', 'Premium Japanese matcha', 110, 'Tea', false),
('b1000001-0000-0000-0000-000000000001', 'Avocado Toast', 'Sourdough with local avocado', 180, 'Food', true),
('b1000001-0000-0000-0000-000000000001', 'Banana Bread', 'House-made daily', 85, 'Pastry', false);

-- Thai Street Kitchen menu
INSERT INTO menu_items (business_id, name, description, price_thb, category, is_popular) VALUES
('b1000001-0000-0000-0000-000000000002', 'Khao Soi Gai', 'Northern curry noodles with chicken', 89, 'Noodles', true),
('b1000001-0000-0000-0000-000000000002', 'Som Tam Thai', 'Papaya salad with peanuts', 65, 'Salad', true),
('b1000001-0000-0000-0000-000000000002', 'Pad Thai Goong', 'Classic pad thai with prawns', 120, 'Noodles', true),
('b1000001-0000-0000-0000-000000000002', 'Tom Yum Goong', 'Spicy prawn soup', 150, 'Soup', false),
('b1000001-0000-0000-0000-000000000002', 'Mango Sticky Rice', 'Seasonal Thai dessert', 80, 'Dessert', true);

-- Digital Nomad Hub services
INSERT INTO menu_items (business_id, name, description, price_thb, category, is_popular) VALUES
('b1000001-0000-0000-0000-000000000003', 'Day Pass', 'Full access 8am-10pm', 350, 'Membership', true),
('b1000001-0000-0000-0000-000000000003', 'Weekly Pass', '7 consecutive days', 1500, 'Membership', true),
('b1000001-0000-0000-0000-000000000003', 'Monthly Flex', '20 days per month', 4500, 'Membership', true),
('b1000001-0000-0000-0000-000000000003', 'Meeting Room', 'Per hour, up to 8 people', 500, 'Services', false),
('b1000001-0000-0000-0000-000000000003', 'Podcast Studio', 'Per hour, full equipment', 800, 'Services', false);

-- Craft Beer menu
INSERT INTO menu_items (business_id, name, description, price_thb, category, is_popular) VALUES
('b1000001-0000-0000-0000-000000000004', 'Lanna Lager', 'Crisp local lager, 330ml', 150, 'Beer', true),
('b1000001-0000-0000-0000-000000000004', 'Doi IPA', 'Hoppy IPA with Thai citrus', 180, 'Beer', true),
('b1000001-0000-0000-0000-000000000004', 'Flight of 4', 'Sample any 4 beers', 350, 'Beer', true),
('b1000001-0000-0000-0000-000000000004', 'Nachos Grande', 'Loaded nachos for sharing', 280, 'Food', false);

-- Wellness Spa services
INSERT INTO menu_items (business_id, name, description, price_thb, category, is_popular) VALUES
('b1000001-0000-0000-0000-000000000005', 'Thai Massage', 'Traditional 60 min', 500, 'Massage', true),
('b1000001-0000-0000-0000-000000000005', 'Oil Massage', 'Aromatherapy 90 min', 800, 'Massage', true),
('b1000001-0000-0000-0000-000000000005', 'Foot Reflexology', '45 min treatment', 400, 'Massage', false),
('b1000001-0000-0000-0000-000000000005', 'Herbal Steam', 'Traditional herbs 30 min', 350, 'Wellness', false),
('b1000001-0000-0000-0000-000000000005', 'Full Day Package', 'All treatments + lunch', 2500, 'Package', true);

-- Tour packages
INSERT INTO menu_items (business_id, name, description, price_thb, category, is_popular) VALUES
('b1000001-0000-0000-0000-000000000007', 'Half Day Visit', 'Morning elephant experience', 2500, 'Tour', true),
('b1000001-0000-0000-0000-000000000007', 'Full Day Experience', 'All day with lunch', 3500, 'Tour', true),
('b1000001-0000-0000-0000-000000000007', 'Overnight Stay', '2 days / 1 night', 6500, 'Tour', false);

-- Accommodation
INSERT INTO menu_items (business_id, name, description, price_thb, category, is_popular) VALUES
('b1000001-0000-0000-0000-000000000008', 'Standard Room', 'Garden view, breakfast included', 1200, 'Room', true),
('b1000001-0000-0000-0000-000000000008', 'River View Room', 'Ping River view, breakfast', 1800, 'Room', true),
('b1000001-0000-0000-0000-000000000008', 'Suite', 'Balcony + living area', 2800, 'Room', false),
('b1000001-0000-0000-0000-000000000008', 'Bicycle Rental', 'Per day', 150, 'Services', false);

-- ================================
-- FUNCTIONS
-- ================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for businesses
DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
