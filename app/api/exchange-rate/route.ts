import { NextResponse } from "next/server";
import { 
  fetchLiveExchangeRate, 
  calculateOfframpAmount, 
  getOfframpCommission,
  formatExchangeRate 
} from "@/lib/exchange-rate";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usdc = searchParams.get("usdc");

  try {
    const rate = await fetchLiveExchangeRate();
    const thbPerUsdc = 1 / rate;

    // If USDC amount provided, calculate offramp
    if (usdc) {
      const amount = parseFloat(usdc);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "Invalid USDC amount" },
          { status: 400 }
        );
      }

      const offramp = await calculateOfframpAmount(amount);
      
      return NextResponse.json({
        rate: {
          thbPerUsdc: Number(thbPerUsdc.toFixed(4)),
          usdPerThb: Number(rate.toFixed(6)),
          formatted: formatExchangeRate(rate),
        },
        offramp: {
          amountUsdc: amount,
          grossThb: offramp.grossThb,
          commissionPercent: offramp.commissionPercent,
          commissionUsdc: offramp.commission,
          commissionThb: offramp.commissionThb,
          netThb: offramp.netThb,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Return just the rate
    return NextResponse.json({
      rate: {
        thbPerUsdc: Number(thbPerUsdc.toFixed(4)),
        usdPerThb: Number(rate.toFixed(6)),
        formatted: formatExchangeRate(rate),
      },
      commission: {
        offrampPercent: getOfframpCommission(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rate" },
      { status: 500 }
    );
  }
}
