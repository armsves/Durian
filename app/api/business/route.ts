import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Create a new business
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const {
      // Basic info
      name,
      category,
      description,
      logo_url,
      image_url,
      // Location
      address,
      latitude,
      longitude,
      // Contact
      phone,
      email,
      website,
      // Owner info
      owner_email,
      owner_wallet,
      // Banking
      bank_name,
      bank_account_name,
      bank_account_number,
      promptpay_id,
      // Crypto
      wallet_address,
      accepts_usdc,
      accepts_durianbank,
      // Menu items
      menu_items,
    } = body;

    // Validate required fields
    if (!name || !category || !owner_email) {
      return NextResponse.json(
        { error: "name, category, and owner_email are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now().toString(36);

    // Create the business
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        name,
        slug,
        category,
        description,
        logo_url,
        image_url: image_url || logo_url, // Use logo as image if no separate image
        address,
        latitude,
        longitude,
        phone,
        email,
        website,
        owner_email,
        owner_wallet,
        wallet_address: wallet_address || owner_wallet, // Use owner wallet if no separate business wallet
        bank_name,
        bank_account_name,
        bank_account_number,
        promptpay_id,
        accepts_usdc: accepts_usdc ?? true,
        accepts_durianbank: accepts_durianbank ?? true,
        is_active: true,
        is_verified: false,
        kyc_status: "pending",
      })
      .select()
      .single();

    if (businessError) {
      console.error("Error creating business:", businessError);
      return NextResponse.json({ error: businessError.message }, { status: 500 });
    }

    // Create menu items if provided
    if (menu_items && Array.isArray(menu_items) && menu_items.length > 0) {
      const validMenuItems = menu_items
        .filter((item: { name: string; price: string | number }) => item.name && item.price)
        .map((item: { name: string; price: string | number; category?: string; description?: string }) => ({
          business_id: business.id,
          name: item.name,
          price_thb: parseFloat(String(item.price)),
          category: item.category || "Other",
          description: item.description || "",
          is_available: true,
          is_popular: false,
        }));

      if (validMenuItems.length > 0) {
        const { error: menuError } = await supabase
          .from("menu_items")
          .insert(validMenuItems);

        if (menuError) {
          console.error("Error creating menu items:", menuError);
          // Don't fail the whole request, business was created
        }
      }
    }

    return NextResponse.json({ business });
  } catch (error) {
    console.error("Error in business creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get business by owner email
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ownerEmail = searchParams.get("owner_email");

  if (!ownerEmail) {
    return NextResponse.json(
      { error: "owner_email is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("businesses")
      .select(`
        *,
        menu_items (*)
      `)
      .eq("owner_email", ownerEmail)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ business: null });
      }
      console.error("Error fetching business:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ business: data });
  } catch (error) {
    console.error("Error in business fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
