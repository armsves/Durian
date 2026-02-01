import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Get payment by reference
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("ref");

  if (!reference) {
    return NextResponse.json(
      { error: "Reference is required" },
      { status: 400 }
    );
  }

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
      .eq("reference", reference)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }
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

// Create a new payment intent
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { business_id, amount_thb, amount_usdc, reference, payment_method } = body;

    if (!business_id || !amount_thb) {
      return NextResponse.json(
        { error: "business_id and amount_thb are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("payment_intents")
      .insert({
        business_id,
        amount_thb,
        amount_usdc,
        reference,
        payment_method,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating payment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment: data });
  } catch (error) {
    console.error("Error in payment creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
