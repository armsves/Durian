"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  LayoutDashboard,
  QrCode,
  Menu,
  Wallet,
  Settings,
  Plus,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  Users,
  Copy,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { WalletDisplay } from "@/components/wallet-display";
import { QRCode, PaymentQRCode } from "@/components/qr-code";
import { MenuItemGrid } from "@/components/menu-item-card";
import {
  formatTHB,
  formatUSDC,
  thbToUsdc,
  shortenAddress,
  generateReference,
  formatRelativeTime,
} from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { Business, MenuItem, PaymentIntent, Transaction } from "@/types/database";

export default function DashboardPage() {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [activeTab, setActiveTab] = useState("overview");
  const [qrAmount, setQrAmount] = useState("");
  const [qrReference, setQrReference] = useState("");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  
  // Data states
  const [business, setBusiness] = useState<Business | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats calculated from real data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    transactionCount: 0,
    uniqueCustomers: 0,
  });

  // Exchange rate and withdrawal
  const [exchangeRate, setExchangeRate] = useState<{
    thbPerUsdc: number;
    formatted: string;
  } | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawCalc, setWithdrawCalc] = useState<{
    grossThb: number;
    commissionThb: number;
    netThb: number;
  } | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");

  // Fetch live exchange rate
  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch("/api/exchange-rate");
        if (res.ok) {
          const data = await res.json();
          setExchangeRate({
            thbPerUsdc: data.rate.thbPerUsdc,
            formatted: data.rate.formatted,
          });
        }
      } catch (err) {
        console.error("Failed to fetch exchange rate:", err);
      }
    }
    fetchRate();
    // Refresh rate every 5 minutes
    const interval = setInterval(fetchRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate withdrawal amount when input changes
  useEffect(() => {
    async function calculateWithdrawal() {
      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
        setWithdrawCalc(null);
        return;
      }
      try {
        const res = await fetch(`/api/exchange-rate?usdc=${withdrawAmount}`);
        if (res.ok) {
          const data = await res.json();
          setWithdrawCalc({
            grossThb: data.offramp.grossThb,
            commissionThb: data.offramp.commissionThb,
            netThb: data.offramp.netThb,
          });
        }
      } catch (err) {
        console.error("Failed to calculate withdrawal:", err);
      }
    }
    const timeout = setTimeout(calculateWithdrawal, 300); // Debounce
    return () => clearTimeout(timeout);
  }, [withdrawAmount]);

  // Fetch business data
  useEffect(() => {
    async function fetchData() {
      if (!user?.email?.address && !embeddedWallet?.address) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      const supabase = createClient();

      try {
        // First, try to find user profile with business_id
        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("business_id")
          .or(`email.eq.${user?.email?.address},wallet_address.eq.${embeddedWallet?.address}`)
          .single();

        let businessId = userProfile?.business_id;

        // If no business_id in profile, try to find business by wallet
        if (!businessId && embeddedWallet?.address) {
          const { data: businessByWallet } = await supabase
            .from("businesses")
            .select("id")
            .eq("wallet_address", embeddedWallet.address)
            .single();
          
          businessId = businessByWallet?.id;
        }

        if (!businessId) {
          setLoading(false);
          return;
        }

        // Fetch business details
        const { data: businessData } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", businessId)
          .single();

        if (businessData) {
          setBusiness(businessData);

          // Fetch menu items
          const { data: menuData } = await supabase
            .from("menu_items")
            .select("*")
            .eq("business_id", businessId);
          
          setMenuItems(menuData || []);

          // Fetch transactions
          const { data: txData } = await supabase
            .from("transactions")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .limit(20);
          
          setTransactions(txData || []);

          // Fetch payment intents
          const { data: piData } = await supabase
            .from("payment_intents")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .limit(20);
          
          setPaymentIntents(piData || []);

          // Calculate stats from real data
          const totalRevenue = (txData || []).reduce((sum, tx) => sum + tx.amount_thb, 0);
          const uniqueWallets = new Set((txData || []).map(tx => tx.tx_hash).filter(Boolean));
          
          setStats({
            totalRevenue,
            transactionCount: (txData || []).length,
            uniqueCustomers: uniqueWallets.size,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      }
      
      setLoading(false);
    }

    fetchData();
  }, [user?.email?.address, embeddedWallet?.address]);

  const generatePaymentQR = () => {
    if (!business) return;
    const ref = qrReference || generateReference();
    const paymentUrl = `${window.location.origin}/pay/new?business=${business.id}&amount=${qrAmount}&ref=${ref}`;
    setGeneratedQR(paymentUrl);
    setQrReference(ref);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-background">
        <Header />
        <main className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#2D3A2D" }} />
            <p style={{ color: "#666" }}>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto text-center">
              <CardContent className="p-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#C5A35E" }} />
                <h2 className="text-xl font-semibold mb-2" style={{ color: "#000" }}>No Business Found</h2>
                <p className="mb-4" style={{ color: "#666" }}>
                  You haven&apos;t set up a business yet. Complete the onboarding to access your dashboard.
                </p>
                <Button asChild style={{ backgroundColor: "#2D3A2D", color: "white" }}>
                  <Link href="/business/onboarding">Start Onboarding</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-background">
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-semibold" style={{ color: "#000" }}>
                {business.name}
              </h1>
              <p style={{ color: "#666" }}>
                Welcome back, {user?.email?.address || "Business Owner"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {business.is_verified && (
                <Badge style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}>
                  Verified
                </Badge>
              )}
              <Button asChild>
                <Link href="/business/onboarding">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="qr">
                <QrCode className="w-4 h-4 mr-2" />
                QR Generator
              </TabsTrigger>
              <TabsTrigger value="menu">
                <Menu className="w-4 h-4 mr-2" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: "#666" }}>Total Revenue</p>
                        <p className="text-3xl font-serif font-semibold mt-1" style={{ color: "#000" }}>
                          {formatTHB(stats.totalRevenue)}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(168, 194, 185, 0.2)" }}>
                        <DollarSign className="w-6 h-6" style={{ color: "#2D3A2D" }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: "#666" }}>Transactions</p>
                        <p className="text-3xl font-serif font-semibold mt-1" style={{ color: "#000" }}>
                          {stats.transactionCount}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(168, 194, 185, 0.2)" }}>
                        <TrendingUp className="w-6 h-6" style={{ color: "#2D3A2D" }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: "#666" }}>Unique Transactions</p>
                        <p className="text-3xl font-serif font-semibold mt-1" style={{ color: "#000" }}>
                          {stats.uniqueCustomers}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(168, 194, 185, 0.2)" }}>
                        <Users className="w-6 h-6" style={{ color: "#2D3A2D" }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle style={{ color: "#000" }}>Recent Transactions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 && paymentIntents.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "#666" }} />
                      <p style={{ color: "#666" }}>No transactions yet</p>
                      <p className="text-sm mt-1" style={{ color: "#999" }}>
                        Transactions will appear here once customers start paying
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Show payment intents (pending and completed) */}
                      {paymentIntents.map((pi) => (
                        <div
                          key={pi.id}
                          className="flex items-center justify-between p-4 rounded-xl"
                          style={{ backgroundColor: "rgba(168, 194, 185, 0.1)" }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: pi.status === "completed" ? "rgba(34, 197, 94, 0.1)" : "rgba(197, 163, 94, 0.2)",
                                color: pi.status === "completed" ? "#16a34a" : "#8a6b3c"
                              }}
                            >
                              {pi.status === "completed" ? (
                                <ArrowDownLeft className="w-5 h-5" />
                              ) : (
                                <RefreshCw className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: "#000" }}>
                                {pi.reference || shortenAddress(pi.id, 4)}
                              </p>
                              <p className="text-sm" style={{ color: "#666" }}>
                                {formatRelativeTime(pi.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium" style={{ color: "#000" }}>{formatTHB(pi.amount_thb)}</p>
                            {pi.amount_usdc && (
                              <p className="text-sm" style={{ color: "#C5A35E" }}>
                                {pi.amount_usdc} USDC
                              </p>
                            )}
                          </div>
                          <Badge
                            style={{
                              backgroundColor: pi.status === "completed" ? "rgba(34, 197, 94, 0.1)" : "rgba(197, 163, 94, 0.2)",
                              color: pi.status === "completed" ? "#16a34a" : "#8a6b3c"
                            }}
                          >
                            {pi.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* QR Generator Tab */}
            <TabsContent value="qr">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: "#000" }}>Generate Payment QR</CardTitle>
                    <CardDescription>
                      Create a QR code for customers to pay
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount (THB)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={qrAmount}
                        onChange={(e) => setQrAmount(e.target.value)}
                        className="mt-1"
                      />
                      {qrAmount && (
                        <p className="text-sm mt-1" style={{ color: "#666" }}>
                          ≈ {thbToUsdc(parseFloat(qrAmount)).toFixed(2)} USDC
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="reference">Reference (Optional)</Label>
                      <Input
                        id="reference"
                        placeholder="Auto-generated if empty"
                        value={qrReference}
                        onChange={(e) => setQrReference(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={generatePaymentQR}
                      disabled={!qrAmount}
                      className="w-full"
                      style={{ backgroundColor: "#C5A35E", color: "white" }}
                    >
                      Generate QR Code
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: "#000" }}>Payment QR</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                    {generatedQR ? (
                      <div className="text-center">
                        <PaymentQRCode
                          paymentUrl={generatedQR}
                          amount={qrAmount}
                          currency="THB"
                          reference={qrReference}
                        />
                        <div className="mt-4 flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedQR);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(generatedQR, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center" style={{ color: "#666" }}>
                        <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>Enter an amount to generate a QR code</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle style={{ color: "#000" }}>Menu Items</CardTitle>
                      <CardDescription>
                        Manage your products and services
                      </CardDescription>
                    </div>
                    <Button style={{ backgroundColor: "#2D3A2D", color: "white" }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {menuItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Menu className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "#666" }} />
                      <p style={{ color: "#666" }}>No menu items yet</p>
                      <p className="text-sm mt-1" style={{ color: "#999" }}>
                        Add your products and services to start receiving payments
                      </p>
                    </div>
                  ) : (
                    <MenuItemGrid items={menuItems as any} showAddButton={false} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet">
              <div className="grid lg:grid-cols-2 gap-8">
                <WalletDisplay />

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: "#000" }}>Offramp to Thai Baht</CardTitle>
                    <CardDescription>
                      Withdraw your USDC balance to your bank account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(168, 194, 185, 0.2)" }}>
                      <p className="text-sm" style={{ color: "#666" }}>
                        Available for withdrawal
                      </p>
                      <p className="text-2xl font-serif font-semibold" style={{ color: "#000" }}>
                        Check wallet balance above
                      </p>
                    </div>

                    <div>
                      <Label>Withdraw Amount (USDC)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="mt-1"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>

                    <div className="text-sm space-y-2" style={{ color: "#666" }}>
                      <div className="flex justify-between">
                        <span>Exchange Rate</span>
                        <span className="flex items-center gap-1">
                          {exchangeRate ? (
                            <>
                              {exchangeRate.formatted}
                              <Badge 
                                className="text-[10px] px-1 py-0"
                                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}
                              >
                                LIVE
                              </Badge>
                            </>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading...
                            </span>
                          )}
                        </span>
                      </div>
                      {withdrawCalc && (
                        <>
                          <div className="flex justify-between">
                            <span>Gross Amount</span>
                            <span>{formatTHB(withdrawCalc.grossThb)}</span>
                          </div>
                          <div className="flex justify-between" style={{ color: "#dc2626" }}>
                            <span>Platform Fee (0.5%)</span>
                            <span>-{formatTHB(withdrawCalc.commissionThb)}</span>
                          </div>
                        </>
                      )}
                      {!withdrawCalc && (
                        <div className="flex justify-between">
                          <span>Platform Fee</span>
                          <span>0.5%</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium" style={{ color: "#000" }}>
                        <span>You&apos;ll Receive</span>
                        <span style={{ color: "#16a34a" }}>
                          {withdrawCalc ? formatTHB(withdrawCalc.netThb) : "Enter amount"}
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      style={{ backgroundColor: "#C5A35E", color: "white" }}
                      disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || withdrawLoading}
                      onClick={async () => {
                        if (!business || !withdrawCalc) return;
                        setWithdrawLoading(true);
                        try {
                          const supabase = createClient();
                          await supabase.from("offramp_requests").insert({
                            business_id: business.id,
                            amount_usdc: parseFloat(withdrawAmount),
                            amount_thb: withdrawCalc.netThb,
                            status: "pending",
                          });
                          alert("Withdrawal request submitted! Admin will process it within 24 hours.");
                          setWithdrawAmount("");
                          setWithdrawCalc(null);
                        } catch (err) {
                          console.error("Withdrawal request failed:", err);
                          alert("Failed to submit withdrawal request");
                        }
                        setWithdrawLoading(false);
                      }}
                    >
                      {withdrawLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Request Withdrawal
                    </Button>

                    <p className="text-xs text-center" style={{ color: "#666" }}>
                      Withdrawals are processed via PromptPay within 24 hours.
                      <br />
                      Exchange rate updates every 5 minutes from live market data.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
