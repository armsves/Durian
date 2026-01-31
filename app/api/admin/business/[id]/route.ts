import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = ["armsves@gmail.com"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check if user is admin (skip in dev for now)
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const body = await request.json();
    const { is_active, is_verified, is_featured } = body;

    const updateData: Record<string, boolean> = {};
    
    if (typeof is_active === "boolean") {
      updateData.is_active = is_active;
    }
    if (typeof is_verified === "boolean") {
      updateData.is_verified = is_verified;
    }
    if (typeof is_featured === "boolean") {
      updateData.is_featured = is_featured;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("businesses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating business:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ business: data });
  } catch (error) {
    console.error("Error in admin business update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
