import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// API Key for backend authentication (set in environment variables)
const API_SECRET = process.env.PAYMENT_API_SECRET;

/**
 * POST /api/payment/complete
 * 
 * Mark a payment as completed. Called by backend services or webhooks
 * when a blockchain transaction is confirmed.
 * 
 * Headers:
 *   Authorization: Bearer <PAYMENT_API_SECRET>
 *   Content-Type: application/json
 * 
 * Body:
 *   {
 *     "reference": "DUR-ABC123",     // Payment reference (required if no payment_id)
 *     "payment_id": "uuid-here",     // Payment intent ID (required if no reference)
 *     "tx_hash": "0x123...",         // Blockchain transaction hash (optional)
 *     "payer_wallet": "0xabc..."     // Payer's wallet address (optional)
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "payment": { ...payment_intent_data }
 *   }
 * 
 * Example curl:
 *   curl -X POST https://your-domain.com/api/payment/complete \
 *     -H "Authorization: Bearer your-api-secret" \
 *     -H "Content-Type: application/json" \
 *     -d '{"reference": "DUR-ABC123", "tx_hash": "0x123..."}'
 */
export async function POST(request: Request) {
  // Verify API key authentication
  const authHeader = request.headers.get("Authorization");
  
  if (API_SECRET) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing authorization header" },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    if (token !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }
  }

  const supabase = await createClient();

  try {
    const body = await request.json();
    const { reference, payment_id, tx_hash, payer_wallet } = body;

    // Require either reference or payment_id
    if (!reference && !payment_id) {
      return NextResponse.json(
        { success: false, error: "Either 'reference' or 'payment_id' is required" },
        { status: 400 }
      );
    }

    // Build the query to find the payment
    let query = supabase
      .from("payment_intents")
      .select("*");

    if (payment_id) {
      query = query.eq("id", payment_id);
    } else {
      query = query.eq("reference", reference);
    }

    const { data: existingPayment, error: fetchError } = await query.single();

    if (fetchError || !existingPayment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if already completed
    if (existingPayment.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Payment already completed",
        payment: existingPayment,
      });
    }

    // Update the payment to completed
    const updateData: Record<string, string> = {
      status: "completed",
      completed_at: new Date().toISOString(),
    };

    if (tx_hash) {
      updateData.tx_hash = tx_hash;
    }

    if (payer_wallet) {
      updateData.payer_wallet = payer_wallet;
    }

    const { data: updatedPayment, error: updateError } = await supabase
      .from("payment_intents")
      .update(updateData)
      .eq("id", existingPayment.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating payment:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update payment" },
        { status: 500 }
      );
    }

    console.log(`[Payment Complete] Payment ${existingPayment.reference} marked as completed`);

    return NextResponse.json({
      success: true,
      message: "Payment marked as completed",
      payment: updatedPayment,
    });

  } catch (error) {
    console.error("Error in payment complete:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
