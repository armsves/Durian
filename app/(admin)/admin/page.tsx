import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./admin-dashboard";

// Admin email whitelist
const ADMIN_EMAILS = ["armsves@gmail.com"];

export default async function AdminPage() {
  const supabase = await createClient();

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is admin (for now just check email in whitelist)
  // In production, you'd check the user_profiles table for role = 'admin'
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  // For development, allow access without auth check
  // Remove this in production
  const devMode = process.env.NODE_ENV === "development";

  if (!devMode && !isAdmin) {
    redirect("/");
  }

  // Fetch all businesses
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all user profiles
  const { data: users } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch all payment intents
  const { data: paymentIntents } = await supabase
    .from("payment_intents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch all offramp requests with business details
  const { data: offrampRequests } = await supabase
    .from("offramp_requests")
    .select(`
      *,
      businesses (
        id,
        name,
        wallet_address
      )
    `)
    .order("created_at", { ascending: false });

  // Calculate stats
  const stats = {
    totalBusinesses: businesses?.length || 0,
    verifiedBusinesses: businesses?.filter(b => b.is_verified).length || 0,
    activeBusinesses: businesses?.filter(b => b.is_active).length || 0,
    totalUsers: users?.length || 0,
    disabledUsers: users?.filter(u => u.is_disabled).length || 0,
    totalTransactions: transactions?.length || 0,
    totalPaymentIntents: paymentIntents?.length || 0,
    pendingPayments: paymentIntents?.filter(p => p.status === "pending").length || 0,
    pendingOfframps: offrampRequests?.filter(o => o.status === "pending").length || 0,
  };

  return (
    <AdminDashboard
      businesses={businesses || []}
      users={users || []}
      transactions={transactions || []}
      paymentIntents={paymentIntents || []}
      offrampRequests={offrampRequests || []}
      stats={stats}
    />
  );
}
