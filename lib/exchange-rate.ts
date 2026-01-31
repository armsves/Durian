// Exchange rate service with live rates and caching
// Uses free exchange rate APIs

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache
const OFFRAMP_COMMISSION = 0.005; // 0.5% commission for offramp

interface ExchangeRateCache {
  rate: number;
  timestamp: number;
}

let rateCache: ExchangeRateCache | null = null;

// Fallback rate if API fails (approximate)
const FALLBACK_RATE = 0.028; // ~35.7 THB = 1 USD

/**
 * Fetch live THB/USD exchange rate from public API
 * Uses multiple fallback sources
 */
export async function fetchLiveExchangeRate(): Promise<number> {
  // Check cache first
  if (rateCache && Date.now() - rateCache.timestamp < CACHE_DURATION_MS) {
    return rateCache.rate;
  }

  try {
    // Primary: Exchange Rate API (free tier)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/THB",
      { next: { revalidate: 300 } } // Cache for 5 minutes in Next.js
    );

    if (response.ok) {
      const data = await response.json();
      const rate = data.rates?.USD;
      
      if (rate && typeof rate === "number") {
        rateCache = { rate, timestamp: Date.now() };
        console.log(`[Exchange Rate] Live rate fetched: 1 THB = ${rate} USD`);
        return rate;
      }
    }
  } catch (error) {
    console.error("[Exchange Rate] Primary API failed:", error);
  }

  try {
    // Fallback: Open Exchange Rates (approximation via reverse lookup)
    const response = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { next: { revalidate: 300 } }
    );

    if (response.ok) {
      const data = await response.json();
      const thbPerUsd = data.rates?.THB;
      
      if (thbPerUsd && typeof thbPerUsd === "number") {
        const rate = 1 / thbPerUsd;
        rateCache = { rate, timestamp: Date.now() };
        console.log(`[Exchange Rate] Fallback rate fetched: 1 THB = ${rate} USD`);
        return rate;
      }
    }
  } catch (error) {
    console.error("[Exchange Rate] Fallback API failed:", error);
  }

  // Use fallback rate if all APIs fail
  console.warn("[Exchange Rate] Using fallback rate");
  return FALLBACK_RATE;
}

/**
 * Get the current exchange rate (sync version using cache or fallback)
 */
export function getExchangeRate(): number {
  if (rateCache && Date.now() - rateCache.timestamp < CACHE_DURATION_MS) {
    return rateCache.rate;
  }
  return FALLBACK_RATE;
}

/**
 * Convert THB to USDC for payments (tourist paying business)
 * No commission on payments
 */
export async function thbToUsdcLive(thb: number): Promise<number> {
  const rate = await fetchLiveExchangeRate();
  return Number((thb * rate).toFixed(6));
}

/**
 * Convert THB to USDC (sync version using cached rate)
 */
export function thbToUsdcSync(thb: number): number {
  const rate = getExchangeRate();
  return Number((thb * rate).toFixed(6));
}

/**
 * Convert USDC to THB for display purposes
 */
export async function usdcToThbLive(usdc: number): Promise<number> {
  const rate = await fetchLiveExchangeRate();
  return Number((usdc / rate).toFixed(2));
}

/**
 * Convert USDC to THB (sync version)
 */
export function usdcToThbSync(usdc: number): number {
  const rate = getExchangeRate();
  return Number((usdc / rate).toFixed(2));
}

/**
 * Calculate offramp amount with 0.5% commission
 * Business withdrawing USDC to THB
 * Returns the THB amount after deducting commission
 */
export async function calculateOfframpAmount(usdc: number): Promise<{
  grossThb: number;
  commission: number;
  commissionThb: number;
  netThb: number;
  rate: number;
  commissionPercent: number;
}> {
  const rate = await fetchLiveExchangeRate();
  const thbPerUsdc = 1 / rate;
  
  const grossThb = usdc * thbPerUsdc;
  const commissionUsdc = usdc * OFFRAMP_COMMISSION;
  const commissionThb = commissionUsdc * thbPerUsdc;
  const netThb = grossThb - commissionThb;
  
  return {
    grossThb: Number(grossThb.toFixed(2)),
    commission: Number(commissionUsdc.toFixed(6)),
    commissionThb: Number(commissionThb.toFixed(2)),
    netThb: Number(netThb.toFixed(2)),
    rate: thbPerUsdc,
    commissionPercent: OFFRAMP_COMMISSION * 100,
  };
}

/**
 * Calculate offramp amount (sync version)
 */
export function calculateOfframpAmountSync(usdc: number): {
  grossThb: number;
  commission: number;
  commissionThb: number;
  netThb: number;
  rate: number;
  commissionPercent: number;
} {
  const rate = getExchangeRate();
  const thbPerUsdc = 1 / rate;
  
  const grossThb = usdc * thbPerUsdc;
  const commissionUsdc = usdc * OFFRAMP_COMMISSION;
  const commissionThb = commissionUsdc * thbPerUsdc;
  const netThb = grossThb - commissionThb;
  
  return {
    grossThb: Number(grossThb.toFixed(2)),
    commission: Number(commissionUsdc.toFixed(6)),
    commissionThb: Number(commissionThb.toFixed(2)),
    netThb: Number(netThb.toFixed(2)),
    rate: thbPerUsdc,
    commissionPercent: OFFRAMP_COMMISSION * 100,
  };
}

/**
 * Format exchange rate for display
 */
export function formatExchangeRate(rate?: number): string {
  const r = rate || getExchangeRate();
  const thbPerUsdc = 1 / r;
  return `1 USDC = ฿${thbPerUsdc.toFixed(2)}`;
}

/**
 * Get offramp commission percentage
 */
export function getOfframpCommission(): number {
  return OFFRAMP_COMMISSION * 100; // Returns 0.5
}
