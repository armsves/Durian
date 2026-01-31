import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Exchange rate functions - use sync versions for client-side
// For live rates, use the exchange-rate.ts module directly
import { 
  thbToUsdcSync, 
  usdcToThbSync, 
  getExchangeRate,
  calculateOfframpAmountSync,
  formatExchangeRate,
  getOfframpCommission,
} from "./exchange-rate";

// Re-export for convenience
export { 
  getExchangeRate, 
  calculateOfframpAmountSync, 
  formatExchangeRate,
  getOfframpCommission,
};

// Sync versions for client-side use (uses cached rate)
export function thbToUsdc(thb: number): number {
  return thbToUsdcSync(thb);
}

export function usdcToThb(usdc: number): number {
  return usdcToThbSync(usdc);
}

// Shorten wallet address
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Generate unique reference
export function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `DUR-${timestamp}-${random}`.toUpperCase();
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(date);
}

// Validate Thai phone number
export function isValidThaiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^(0[689]\d{8}|66[689]\d{8})$/.test(cleaned);
}

// Category labels
export const CATEGORY_LABELS: Record<string, string> = {
  cafe: "Cafe",
  restaurant: "Restaurant",
  wellness: "Spa & Wellness",
  accommodation: "Accommodation",
  retail: "Shop & Retail",
  tours: "Tours & Activities",
  coworking: "Coworking",
  bar: "Bar & Nightlife",
  other: "Other",
};

// Category icons (Lucide icon names)
export const CATEGORY_ICONS: Record<string, string> = {
  cafe: "Coffee",
  restaurant: "UtensilsCrossed",
  wellness: "Sparkles",
  accommodation: "Building2",
  retail: "ShoppingBag",
  tours: "MapPin",
  coworking: "Laptop",
  bar: "Wine",
  other: "Store",
};

// Chiang Mai bounds for map
export const CHIANG_MAI_BOUNDS = {
  center: { lat: 18.7883, lng: 98.9853 },
  zoom: 13,
  bounds: {
    sw: { lat: 18.7, lng: 98.9 },
    ne: { lat: 18.9, lng: 99.1 },
  },
};

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
