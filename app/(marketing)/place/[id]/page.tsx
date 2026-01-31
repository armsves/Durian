import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { PlaceClient } from "./place-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlacePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch business
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (businessError || !business) {
    notFound();
  }

  // Fetch menu items
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("business_id", id)
    .eq("is_available", true)
    .order("is_popular", { ascending: false });

  return <PlaceClient business={business} menuItems={menuItems || []} />;
}
