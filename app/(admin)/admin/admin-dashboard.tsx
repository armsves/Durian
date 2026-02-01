"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  BadgeCheck,
  Clock,
  Search,
  Filter,
  Eye,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  DollarSign,
  Banknote,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DurianLogo } from "@/components/durian-logo";
import { formatTHB, formatDate, shortenAddress, CATEGORY_LABELS } from "@/lib/utils";
import type { Business, Transaction, PaymentIntent, UserProfile } from "@/types/database";

interface OfframpRequestWithBusiness {
  id: string;
  created_at: string;
  updated_at: string;
  business_id: string;
  amount_usdc: number;
  amount_thb: number | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  status: 'pending' | 'processing' | 'fulfilled' | 'rejected';
  admin_notes: string | null;
  fulfilled_by: string | null;
  fulfilled_at: string | null;
  tx_hash: string | null;
  bank_transfer_ref: string | null;
  businesses: {
    id: string;
    name: string;
    wallet_address: string | null;
  } | null;
}

interface AdminDashboardProps {
  businesses: Business[];
  users: UserProfile[];
  transactions: Transaction[];
  paymentIntents: PaymentIntent[];
  offrampRequests: OfframpRequestWithBusiness[];
  stats: {
    totalBusinesses: number;
    verifiedBusinesses: number;
    activeBusinesses: number;
    totalUsers: number;
    disabledUsers: number;
    totalTransactions: number;
    totalPaymentIntents: number;
    pendingPayments: number;
    pendingOfframps: number;
  };
}

export function AdminDashboard({
  businesses: initialBusinesses,
  users: initialUsers,
  transactions,
  paymentIntents,
  offrampRequests: initialOfframpRequests,
  stats,
}: AdminDashboardProps) {
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [users, setUsers] = useState(initialUsers);
  const [offrampRequests, setOfframpRequests] = useState(initialOfframpRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState<string | null>(null);
  
  // Dialog states
  const [offrampDialog, setOfframpDialog] = useState<OfframpRequestWithBusiness | null>(null);
  const [dialogAction, setDialogAction] = useState<'fulfill' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [bankTransferRef, setBankTransferRef] = useState("");
  const [amountThb, setAmountThb] = useState("");

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.privy_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle business active status
  const toggleBusinessStatus = async (businessId: string, currentStatus: boolean) => {
    setLoading(businessId);
    try {
      const res = await fetch(`/api/admin/business/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      
      if (res.ok) {
        setBusinesses(prev => 
          prev.map(b => b.id === businessId ? { ...b, is_active: !currentStatus } : b)
        );
      }
    } catch (error) {
      console.error("Error toggling business status:", error);
    }
    setLoading(null);
  };

  // Toggle user disabled status
  const toggleUserStatus = async (userId: string, currentDisabled: boolean) => {
    setLoading(userId);
    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_disabled: !currentDisabled }),
      });
      
      if (res.ok) {
        setUsers(prev => 
          prev.map(u => u.id === userId ? { ...u, is_disabled: !currentDisabled } : u)
        );
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
    setLoading(null);
  };

  // Handle offramp action
  const handleOfframpAction = async () => {
    if (!offrampDialog || !dialogAction) return;
    
    setLoading(offrampDialog.id);
    try {
      const body: Record<string, string | number> = {
        status: dialogAction === 'fulfill' ? 'fulfilled' : 'rejected',
        admin_notes: adminNotes,
      };
      
      if (dialogAction === 'fulfill') {
        body.bank_transfer_ref = bankTransferRef;
        if (amountThb) body.amount_thb = parseFloat(amountThb);
      }
      
      const res = await fetch(`/api/admin/offramp/${offrampDialog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (res.ok) {
        const { offrampRequest } = await res.json();
        setOfframpRequests(prev => 
          prev.map(o => o.id === offrampDialog.id ? { ...o, ...offrampRequest } : o)
        );
        setOfframpDialog(null);
        setDialogAction(null);
        setAdminNotes("");
        setBankTransferRef("");
        setAmountThb("");
      }
    } catch (error) {
      console.error("Error updating offramp:", error);
    }
    setLoading(null);
  };

  // Set offramp to processing
  const setOfframpProcessing = async (offrampId: string) => {
    setLoading(offrampId);
    try {
      const res = await fetch(`/api/admin/offramp/${offrampId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'processing' }),
      });
      
      if (res.ok) {
        setOfframpRequests(prev => 
          prev.map(o => o.id === offrampId ? { ...o, status: 'processing' } : o)
        );
      }
    } catch (error) {
      console.error("Error updating offramp:", error);
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBF7" }}>
      {/* Header */}
      <header 
        className="border-b sticky top-0 z-50"
        style={{ backgroundColor: "#2D3A2D" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <DurianLogo className="w-8 h-8" />
              <span className="font-serif text-xl font-semibold text-white">
                Durian Admin
              </span>
              <Badge style={{ backgroundColor: "#C5A35E", color: "white" }}>
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Businesses"
            value={`${stats.activeBusinesses}/${stats.totalBusinesses}`}
            subtitle="active"
            icon={Building2}
            color="#2D3A2D"
          />
          <StatCard
            title="Verified"
            value={stats.verifiedBusinesses}
            icon={BadgeCheck}
            color="#C5A35E"
          />
          <StatCard
            title="Users"
            value={stats.totalUsers}
            subtitle={stats.disabledUsers > 0 ? `${stats.disabledUsers} disabled` : undefined}
            icon={Users}
            color="#5C6B5C"
          />
          <StatCard
            title="Transactions"
            value={stats.totalTransactions}
            icon={CreditCard}
            color="#2D3A2D"
          />
          <StatCard
            title="Pending Offramps"
            value={stats.pendingOfframps}
            icon={Banknote}
            color="#C5A35E"
            highlight={stats.pendingOfframps > 0}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="businesses" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="businesses">
                <Building2 className="w-4 h-4 mr-2" />
                Businesses
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="offramps">
                <Banknote className="w-4 h-4 mr-2" />
                Offramps
                {stats.pendingOfframps > 0 && (
                  <Badge className="ml-2" style={{ backgroundColor: "#C5A35E", color: "white" }}>
                    {stats.pendingOfframps}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#666" }} />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Businesses Tab */}
          <TabsContent value="businesses">
            <Card style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ color: "#000" }}>All Businesses</CardTitle>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "rgba(168, 194, 185, 0.3)" }}>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Business</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Rating</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Wallet</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBusinesses.map((business) => (
                        <tr 
                          key={business.id} 
                          className="border-b hover:bg-gray-50 transition-colors"
                          style={{ borderColor: "rgba(168, 194, 185, 0.2)" }}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                <Image
                                  src={business.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100"}
                                  alt={business.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium" style={{ color: "#000" }}>{business.name}</p>
                                <p className="text-xs" style={{ color: "#666" }}>{business.address?.slice(0, 30)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">
                              {CATEGORY_LABELS[business.category as keyof typeof CATEGORY_LABELS] || business.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span style={{ color: "#000" }}>⭐ {business.rating}</span>
                            <span className="text-xs ml-1" style={{ color: "#666" }}>({business.review_count})</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {business.is_verified && (
                                <Badge style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}>
                                  Verified
                                </Badge>
                              )}
                              {business.is_featured && (
                                <Badge style={{ backgroundColor: "rgba(197, 163, 94, 0.2)", color: "#8a6b3c" }}>
                                  Featured
                                </Badge>
                              )}
                              {!business.is_active && (
                                <Badge style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}>
                                  Disabled
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="text-xs" style={{ color: "#666" }}>
                              {business.wallet_address ? shortenAddress(business.wallet_address, 4) : "—"}
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Link href={`/place/${business.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBusinessStatus(business.id, business.is_active)}
                                disabled={loading === business.id}
                                style={{ 
                                  color: business.is_active ? "#dc2626" : "#16a34a"
                                }}
                              >
                                {loading === business.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : business.is_active ? (
                                  <Ban className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredBusinesses.length === 0 && (
                  <p className="text-center py-8" style={{ color: "#666" }}>No businesses found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}>
              <CardHeader>
                <CardTitle style={{ color: "#000" }}>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-center py-8" style={{ color: "#666" }}>No users yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor: "rgba(168, 194, 185, 0.3)" }}>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>User</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Role</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Wallet</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Joined</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr 
                            key={user.id}
                            className="border-b hover:bg-gray-50 transition-colors"
                            style={{ borderColor: "rgba(168, 194, 185, 0.2)" }}
                          >
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium" style={{ color: "#000" }}>
                                  {user.email || "No email"}
                                </p>
                                <p className="text-xs" style={{ color: "#666" }}>
                                  {user.privy_id ? shortenAddress(user.privy_id, 6) : "—"}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                style={{ 
                                  backgroundColor: user.role === "admin" 
                                    ? "rgba(197, 163, 94, 0.2)" 
                                    : user.role === "business"
                                    ? "rgba(45, 58, 45, 0.1)"
                                    : "rgba(168, 194, 185, 0.2)",
                                  color: user.role === "admin" ? "#8a6b3c" : "#2D3A2D"
                                }}
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {user.is_disabled ? (
                                <Badge style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}>
                                  Disabled
                                </Badge>
                              ) : (
                                <Badge style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}>
                                  Active
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <code className="text-xs" style={{ color: "#666" }}>
                                {user.wallet_address ? shortenAddress(user.wallet_address, 4) : "—"}
                              </code>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm" style={{ color: "#666" }}>
                                {formatDate(user.created_at)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleUserStatus(user.id, user.is_disabled)}
                                disabled={loading === user.id || user.email === "armsves@gmail.com"}
                                style={{ 
                                  color: user.is_disabled ? "#16a34a" : "#dc2626",
                                  opacity: user.email === "armsves@gmail.com" ? 0.5 : 1
                                }}
                              >
                                {loading === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : user.is_disabled ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offramps Tab */}
          <TabsContent value="offramps">
            <Card style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}>
              <CardHeader>
                <CardTitle style={{ color: "#000" }}>Offramp Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {offrampRequests.length === 0 ? (
                  <p className="text-center py-8" style={{ color: "#666" }}>No offramp requests yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor: "rgba(168, 194, 185, 0.3)" }}>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Business</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Bank Details</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Created</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {offrampRequests.map((offramp) => (
                          <tr 
                            key={offramp.id}
                            className="border-b hover:bg-gray-50 transition-colors"
                            style={{ borderColor: "rgba(168, 194, 185, 0.2)" }}
                          >
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium" style={{ color: "#000" }}>
                                  {offramp.businesses?.name || "Unknown"}
                                </p>
                                <p className="text-xs" style={{ color: "#666" }}>
                                  {offramp.businesses?.wallet_address 
                                    ? shortenAddress(offramp.businesses.wallet_address, 4) 
                                    : "—"}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-bold" style={{ color: "#C5A35E" }}>
                                  {offramp.amount_usdc} USDC
                                </p>
                                {offramp.amount_thb && (
                                  <p className="text-xs" style={{ color: "#666" }}>
                                    → {formatTHB(offramp.amount_thb)}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm" style={{ color: "#000" }}>
                                  {offramp.bank_name || "—"}
                                </p>
                                <p className="text-xs" style={{ color: "#666" }}>
                                  {offramp.bank_account_number || "—"}
                                </p>
                                <p className="text-xs" style={{ color: "#666" }}>
                                  {offramp.bank_account_name || "—"}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                style={{ 
                                  backgroundColor: 
                                    offramp.status === "fulfilled" ? "rgba(34, 197, 94, 0.1)" :
                                    offramp.status === "pending" ? "rgba(197, 163, 94, 0.2)" :
                                    offramp.status === "processing" ? "rgba(59, 130, 246, 0.1)" :
                                    "rgba(239, 68, 68, 0.1)",
                                  color: 
                                    offramp.status === "fulfilled" ? "#16a34a" :
                                    offramp.status === "pending" ? "#8a6b3c" :
                                    offramp.status === "processing" ? "#2563eb" :
                                    "#dc2626"
                                }}
                              >
                                {offramp.status}
                              </Badge>
                              {offramp.bank_transfer_ref && (
                                <p className="text-xs mt-1" style={{ color: "#666" }}>
                                  Ref: {offramp.bank_transfer_ref}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm" style={{ color: "#666" }}>
                                {formatDate(offramp.created_at)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {offramp.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setOfframpProcessing(offramp.id)}
                                    disabled={loading === offramp.id}
                                    style={{ color: "#2563eb" }}
                                  >
                                    {loading === offramp.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Clock className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setOfframpDialog(offramp);
                                      setDialogAction('fulfill');
                                    }}
                                    style={{ color: "#16a34a" }}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setOfframpDialog(offramp);
                                      setDialogAction('reject');
                                    }}
                                    style={{ color: "#dc2626" }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                              {offramp.status === "processing" && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setOfframpDialog(offramp);
                                      setDialogAction('fulfill');
                                    }}
                                    style={{ color: "#16a34a" }}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setOfframpDialog(offramp);
                                      setDialogAction('reject');
                                    }}
                                    style={{ color: "#dc2626" }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                              {(offramp.status === "fulfilled" || offramp.status === "rejected") && (
                                <span className="text-xs" style={{ color: "#666" }}>
                                  {offramp.fulfilled_at ? formatDate(offramp.fulfilled_at) : "—"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}>
              <CardHeader>
                <CardTitle style={{ color: "#000" }}>Payment Intents</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentIntents.length === 0 ? (
                  <p className="text-center py-8" style={{ color: "#666" }}>No payments yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor: "rgba(168, 194, 185, 0.3)" }}>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Reference</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Method</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Created</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#666" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentIntents.map((payment) => (
                          <tr 
                            key={payment.id}
                            className="border-b hover:bg-gray-50 transition-colors"
                            style={{ borderColor: "rgba(168, 194, 185, 0.2)" }}
                          >
                            <td className="py-3 px-4">
                              <code className="text-sm" style={{ color: "#000" }}>
                                {payment.reference || shortenAddress(payment.id, 4)}
                              </code>
                              {payment.tx_hash && (
                                <p className="text-xs mt-1" style={{ color: "#666" }}>
                                  Tx: {shortenAddress(payment.tx_hash, 4)}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium" style={{ color: "#000" }}>
                                  {formatTHB(payment.amount_thb)}
                                </p>
                                {payment.amount_usdc && (
                                  <p className="text-xs" style={{ color: "#C5A35E" }}>
                                    {payment.amount_usdc} USDC
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">
                                {payment.payment_method || "—"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                style={{ 
                                  backgroundColor: 
                                    payment.status === "completed" ? "rgba(34, 197, 94, 0.1)" :
                                    payment.status === "pending" ? "rgba(197, 163, 94, 0.2)" :
                                    payment.status === "failed" ? "rgba(239, 68, 68, 0.1)" :
                                    "rgba(168, 194, 185, 0.2)",
                                  color: 
                                    payment.status === "completed" ? "#16a34a" :
                                    payment.status === "pending" ? "#8a6b3c" :
                                    payment.status === "failed" ? "#dc2626" :
                                    "#666"
                                }}
                              >
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm" style={{ color: "#666" }}>
                                {formatDate(payment.created_at)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {payment.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    setLoading(payment.id);
                                    try {
                                      const res = await fetch(`/api/payment/${payment.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ status: "completed" }),
                                      });
                                      if (res.ok) {
                                        // Refresh the page to show updated data
                                        window.location.reload();
                                      }
                                    } catch (err) {
                                      console.error("Failed to update payment:", err);
                                    }
                                    setLoading(null);
                                  }}
                                  disabled={loading === payment.id}
                                  style={{ color: "#16a34a" }}
                                >
                                  {loading === payment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              {payment.status === "completed" && (
                                <span className="text-xs" style={{ color: "#16a34a" }}>✓</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Offramp Dialog */}
      <Dialog open={!!offrampDialog} onOpenChange={() => {
        setOfframpDialog(null);
        setDialogAction(null);
        setAdminNotes("");
        setBankTransferRef("");
        setAmountThb("");
      }}>
        <DialogContent style={{ backgroundColor: "white" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#000" }}>
              {dialogAction === 'fulfill' ? 'Fulfill Offramp Request' : 'Reject Offramp Request'}
            </DialogTitle>
            <DialogDescription>
              {offrampDialog?.businesses?.name} - {offrampDialog?.amount_usdc} USDC
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {dialogAction === 'fulfill' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amountThb">Amount in THB (optional)</Label>
                  <Input
                    id="amountThb"
                    type="number"
                    placeholder="e.g. 17500"
                    value={amountThb}
                    onChange={(e) => setAmountThb(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankRef">Bank Transfer Reference</Label>
                  <Input
                    id="bankRef"
                    placeholder="e.g. TRF-2024-001234"
                    value={bankTransferRef}
                    onChange={(e) => setBankTransferRef(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOfframpDialog(null);
                setDialogAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOfframpAction}
              disabled={loading === offrampDialog?.id}
              style={{
                backgroundColor: dialogAction === 'fulfill' ? "#16a34a" : "#dc2626",
                color: "white"
              }}
            >
              {loading === offrampDialog?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {dialogAction === 'fulfill' ? 'Mark as Fulfilled' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  highlight,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
}) {
  return (
    <Card style={{ 
      backgroundColor: highlight ? "rgba(197, 163, 94, 0.1)" : "white", 
      border: highlight ? "2px solid #C5A35E" : "1px solid rgba(168, 194, 185, 0.3)" 
    }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "#666" }}>{title}</p>
            <p className="text-2xl font-bold" style={{ color: "#000" }}>{value}</p>
            {subtitle && (
              <p className="text-xs" style={{ color: "#666" }}>{subtitle}</p>
            )}
          </div>
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
