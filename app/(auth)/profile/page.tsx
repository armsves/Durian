"use client";

import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { User, History, Settings, LogOut, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WalletDisplay } from "@/components/wallet-display";
import { shortenAddress, formatTHB, formatRelativeTime } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface PaymentHistoryItem {
  id: string;
  business_name: string;
  amount_thb: number;
  amount_usdc: number | null;
  payment_method: string | null;
  created_at: string;
  status: string;
}

export default function ProfilePage() {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [copied, setCopied] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address || user?.wallet?.address;

  // Fetch payment history
  useEffect(() => {
    async function fetchPaymentHistory() {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        // Fetch payment intents where this wallet was the payer
        const { data: payments } = await supabase
          .from("payment_intents")
          .select(`
            id,
            amount_thb,
            amount_usdc,
            payment_method,
            created_at,
            status,
            businesses (
              name
            )
          `)
          .eq("payer_wallet", walletAddress)
          .order("created_at", { ascending: false })
          .limit(20);

        if (payments) {
          const formattedHistory: PaymentHistoryItem[] = payments.map((p: any) => ({
            id: p.id,
            business_name: p.businesses?.name || "Unknown Business",
            amount_thb: p.amount_thb,
            amount_usdc: p.amount_usdc,
            payment_method: p.payment_method,
            created_at: p.created_at,
            status: p.status,
          }));
          setPaymentHistory(formattedHistory);
        }
      } catch (error) {
        console.error("Error fetching payment history:", error);
      }

      setLoading(false);
    }

    fetchPaymentHistory();
  }, [walletAddress]);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBF7" }}>
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback style={{ backgroundColor: "rgba(168, 194, 185, 0.3)", color: "#2D3A2D" }} className="text-2xl">
                    {user?.email?.address?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-serif font-semibold" style={{ color: "#000" }}>
                    {user?.email?.address || "Traveler"}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge style={{ backgroundColor: "rgba(168, 194, 185, 0.3)", color: "#2D3A2D" }}>
                      Tourist Account
                    </Badge>
                    {walletAddress && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ backgroundColor: "rgba(168, 194, 185, 0.2)" }}>
                        <span className="font-mono text-sm" style={{ color: "#000" }}>
                          {shortenAddress(walletAddress)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={copyAddress}
                        >
                          {copied ? (
                            <span className="text-xs text-green-600">✓</span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="wallet">
            <TabsList className="mb-6">
              <TabsTrigger value="wallet">
                <User className="w-4 h-4 mr-2" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Wallet Tab */}
            <TabsContent value="wallet">
              <div className="grid md:grid-cols-2 gap-6">
                <WalletDisplay />

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: "#000" }}>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Buy USDC on Base
                    </Button>
                    <Button className="w-full" variant="outline">
                      View on Block Explorer
                    </Button>
                    <p className="text-xs text-center" style={{ color: "#666" }}>
                      Your wallet is powered by Privy. It&apos;s linked to your email
                      and can be used across all Durian services.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: "#000" }}>Payment History</CardTitle>
                  <CardDescription>
                    Your recent transactions on Durian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#2D3A2D" }} />
                      <p style={{ color: "#666" }}>Loading history...</p>
                    </div>
                  ) : paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {paymentHistory.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 rounded-xl"
                          style={{ backgroundColor: "rgba(168, 194, 185, 0.1)" }}
                        >
                          <div>
                            <p className="font-medium" style={{ color: "#000" }}>{tx.business_name}</p>
                            <p className="text-sm" style={{ color: "#666" }}>
                              {formatRelativeTime(tx.created_at)} • {tx.payment_method?.toUpperCase() || "—"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium" style={{ color: "#000" }}>{formatTHB(tx.amount_thb)}</p>
                            {tx.amount_usdc && (
                              <p className="text-sm" style={{ color: "#C5A35E" }}>
                                {tx.amount_usdc.toFixed(2)} USDC
                              </p>
                            )}
                          </div>
                          <Badge 
                            style={{ 
                              backgroundColor: tx.status === "completed" ? "rgba(34, 197, 94, 0.1)" : "rgba(197, 163, 94, 0.2)",
                              color: tx.status === "completed" ? "#16a34a" : "#8a6b3c"
                            }}
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "#666" }} />
                      <p style={{ color: "#666" }}>No transactions yet</p>
                      <p className="text-sm" style={{ color: "#999" }}>
                        Your payment history will appear here after you make a payment
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: "#000" }}>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: "#000" }}>Email</p>
                      <p className="text-sm" style={{ color: "#666" }}>
                        {user?.email?.address || "Not connected"}
                      </p>
                    </div>
                    <Badge style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}>
                      Verified
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: "#000" }}>Wallet</p>
                      <p className="text-sm" style={{ color: "#666" }}>
                        Privy Embedded Wallet (Base Sepolia)
                      </p>
                    </div>
                    <Badge style={{ backgroundColor: "rgba(168, 194, 185, 0.3)", color: "#2D3A2D" }}>
                      Active
                    </Badge>
                  </div>

                  <div className="border-t pt-6">
                    <Button variant="destructive" onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
