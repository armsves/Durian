import { NextRequest, NextResponse } from "next/server";

// Revolut Merchant API - Create Payment Link
// In production, this would use the actual Revolut API

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

    // In production, call Revolut API:
    // const response = await fetch(`${REVOLUT_API_URL}/orders`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${REVOLUT_SECRET}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     amount: amount * 100, // Convert to minor units
    //     currency,
    //     merchant_order_ext_ref: reference,
    //   }),
    // });

    // Mock response for demo
    const mockOrderId = `rev-${Date.now().toString(36)}`;
    const mockPaymentLink = `https://sandbox-pay.revolut.com/payment-link/${mockOrderId}`;

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
    console.error("Revolut API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create payment link",
      },
      { status: 500 }
    );
  }
}
