// ================================
// DURIAN - Type Definitions
// ================================

export type BusinessCategory =
  | "cafe"
  | "restaurant"
  | "spa"
  | "hotel"
  | "shop"
  | "tour"
  | "coworking"
  | "other";

export type KYCStatus = "pending" | "approved" | "rejected" | "not_started";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export type UserRole = "business" | "tourist" | "admin";

export interface Business {
  id: string;
  privy_user_id: string;
  name: string;
  category: BusinessCategory;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  address: string;
  lat: number;
  lng: number;
  hours: BusinessHours | null;
  kyc_status: KYCStatus;
  bank_details: BankDetails | null;
  wallet_address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
}

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  promptpay_id?: string;
}

export interface MenuItem {
  id: string;
  business_id: string;
  name: string;
  category: string;
  price_thb: number;
  image_url: string | null;
  description: string | null;
  is_available: boolean;
  created_at: string;
}

export interface PaymentIntent {
  id: string;
  business_id: string;
  amount_thb: number;
  amount_usdc: number;
  exchange_rate: number;
  reference: string;
  status: PaymentStatus;
  payment_method: "usdc" | "revolut" | "promptpay" | null;
  revolut_link: string | null;
  usdc_tx_hash: string | null;
  verified_by_primus: boolean;
  payer_wallet: string | null;
  payer_email: string | null;
  notes: string | null;
  expires_at: string;
  paid_at: string | null;
  created_at: string;
  // Joined data
  business?: Business;
}

export interface UserProfile {
  id: string;
  privy_user_id: string;
  role: UserRole;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  kyc_verified: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  payment_intent_id: string;
  from_address: string;
  to_address: string;
  amount_usdc: number;
  tx_hash: string;
  chain_id: number;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Form types
export interface BusinessOnboardingData {
  step: number;
  basics: {
    name: string;
    category: BusinessCategory;
    description: string;
    logo?: File;
    cover?: File;
  };
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  hours: BusinessHours;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  banking: BankDetails;
}

// Map types
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  category: BusinessCategory;
  rating: number;
}

// Exchange rate
export interface ExchangeRate {
  usd_thb: number;
  usdc_thb: number;
  updated_at: string;
}
