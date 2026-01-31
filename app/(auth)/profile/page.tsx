"use client";

import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { User, History, Settings, LogOut, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WalletDisplay } from "@/components/wallet-display";
import { shortenAddress, formatTHB, formatRelativeTime } from "@/lib/utils";

// Sample payment history
const sampleHistory = [
  {
    id: "1",
    business: "Nimman Café",
    amount_thb: 350,
    amount_usdc: 9.8,
    method: "USDC",
    date: new Date(Date.now() - 86400000).toISOString(),
    status: "completed",
  },
  {
    id: "2",
    business: "Lanna Spa",
    amount_thb: 1200,
    amount_usdc: 33.61,
    method: "Revolut",
    date: new Date(Date.now() - 172800000).toISOString(),
    status: "completed",
  },
  {
    id: "3",
    business: "Farm Story Restaurant",
    amount_thb: 450,
    amount_usdc: 12.61,
    method: "USDC",
    date: new Date(Date.now() - 259200000).toISOString(),
    status: "completed",
  },
];

export default function ProfilePage() {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [copied, setCopied] = useState(false);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address || user?.wallet?.address;

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-sage-100 text-sage-700 text-2xl">
                    {user?.email?.address?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-serif font-semibold">
                    {user?.email?.address || "Traveler"}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="sage">Tourist Account</Badge>
                    {walletAddress && (
                      <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-lg">
                        <span className="font-mono text-sm">
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
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Buy USDC on Base
                    </Button>
                    <Button className="w-full" variant="outline">
                      View on Block Explorer
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
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
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Your recent transactions on Durian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sampleHistory.length > 0 ? (
                    <div className="space-y-4">
                      {sampleHistory.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                        >
                          <div>
                            <p className="font-medium">{tx.business}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatRelativeTime(tx.date)} • {tx.method}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatTHB(tx.amount_thb)}</p>
                            <p className="text-sm text-muted-foreground">
                              {tx.amount_usdc.toFixed(2)} USDC
                            </p>
                          </div>
                          <Badge variant="success">{tx.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No transactions yet</p>
                      <p className="text-sm">
                        Your payment history will appear here
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
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email?.address || "Not connected"}
                      </p>
                    </div>
                    <Badge>Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        Privy Embedded Wallet (Base Sepolia)
                      </p>
                    </div>
                    <Badge variant="sage">Active</Badge>
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
