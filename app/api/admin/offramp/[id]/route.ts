import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = ["armsves@gmail.com"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { status, admin_notes, bank_transfer_ref, amount_thb } = body;

    const updateData: Record<string, string | number | null> = {};
    
    if (status && ["pending", "processing", "fulfilled", "rejected"].includes(status)) {
      updateData.status = status;
      
      // If fulfilled, set fulfilled_at timestamp
      if (status === "fulfilled") {
        updateData.fulfilled_at = new Date().toISOString();
        updateData.fulfilled_by = "armsves@gmail.com"; // Would get from session in production
      }
    }
    
    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes;
    }
    
    if (bank_transfer_ref !== undefined) {
      updateData.bank_transfer_ref = bank_transfer_ref;
    }
    
    if (amount_thb !== undefined) {
      updateData.amount_thb = amount_thb;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("offramp_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating offramp request:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ offrampRequest: data });
  } catch (error) {
    console.error("Error in admin offramp update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
