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
    const { is_disabled, role } = body;

    const updateData: Record<string, boolean | string> = {};
    
    if (typeof is_disabled === "boolean") {
      updateData.is_disabled = is_disabled;
    }
    if (typeof role === "string" && ["tourist", "business", "admin"].includes(role)) {
      updateData.role = role;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error("Error in admin user update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
