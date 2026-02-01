import { NextRequest, NextResponse } from "next/server";

// DurianBank API - Create Payment Link
// In production, this would use the actual DurianBank API

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, reference, businessId } = body;

    if (!amount || !currency || !reference) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // In production, call DurianBank API:
    // const response = await fetch(`${DURIANBANK_API_URL}/payments`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${DURIANBANK_SECRET}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     amount: amount * 100, // Convert to minor units
    //     currency,
    //     merchant_ref: reference,
    //   }),
    // });

    // Generate payment link via Primus verification
    const mockOrderId = `db-${Date.now().toString(36)}`;
    const merchantName = encodeURIComponent(businessId || 'Merchant');
    const mockPaymentLink = `https://durian-primus.vercel.app/?amount=${amount}&merchant=${merchantName}&ref=${reference}`;

    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      paymentLink: mockPaymentLink,
      amount,
      currency,
      reference,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    });
  } catch (error) {
    console.error("DurianBank API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create payment link",
      },
      { status: 500 }
    );
  }
}
