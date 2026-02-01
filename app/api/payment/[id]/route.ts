import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Update payment intent status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { status, tx_hash, payer_wallet } = body;

    const updateData: Record<string, string | null> = {};

    if (status && ["pending", "processing", "completed", "failed", "cancelled"].includes(status)) {
      updateData.status = status;
      
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }
    }

    if (tx_hash) {
      updateData.tx_hash = tx_hash;
    }

    if (payer_wallet) {
      updateData.payer_wallet = payer_wallet;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("payment_intents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating payment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment: data });
  } catch (error) {
    console.error("Error in payment update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get payment intent by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("payment_intents")
      .select(`
        *,
        businesses (
          id,
          name,
          wallet_address
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching payment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment: data });
  } catch (error) {
    console.error("Error in payment fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
