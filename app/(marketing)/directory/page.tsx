import { createClient } from "@/utils/supabase/server";
import { DirectoryClient } from "./directory-client";
import type { Business } from "@/types/database";

export default async function DirectoryPage() {
  const supabase = await createClient();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false });

  if (error) {
    console.error("Error fetching businesses:", error);
  }

  return <DirectoryClient businesses={businesses || []} />;
}
