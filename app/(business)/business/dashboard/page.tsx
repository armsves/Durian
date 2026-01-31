"use client";

import { useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import {
  LayoutDashboard,
  QrCode,
  Menu,
  Wallet,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  Users,
  Copy,
  ExternalLink,
  RefreshCw,
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
import type { MenuItem, PaymentIntent } from "@/types";

// Sample data
const sampleMenuItems: MenuItem[] = [
  {
    id: "m1",
    business_id: "1",
    name: "Signature Pour Over",
    category: "Coffee",
    price_thb: 120,
    image_url: null,
    description: "Single-origin beans from Doi Chang",
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "m2",
    business_id: "1",
    name: "Iced Latte",
    category: "Coffee",
    price_thb: 95,
    image_url: null,
    description: "Espresso with cold milk over ice",
    is_available: true,
    created_at: new Date().toISOString(),
  },
];

const sampleTransactions: PaymentIntent[] = [
  {
    id: "tx1",
    business_id: "1",
    amount_thb: 350,
    amount_usdc: 9.8,
    exchange_rate: 35.7,
    reference: "DUR-ABC123",
    status: "paid",
    payment_method: "usdc",
    revolut_link: null,
    usdc_tx_hash: "0x1234...abcd",
    verified_by_primus: true,
    payer_wallet: "0x9876...efgh",
    payer_email: null,
    notes: null,
    expires_at: new Date().toISOString(),
    paid_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "tx2",
    business_id: "1",
    amount_thb: 215,
    amount_usdc: 6.02,
    exchange_rate: 35.7,
    reference: "DUR-DEF456",
    status: "pending",
    payment_method: null,
    revolut_link: null,
    usdc_tx_hash: null,
    verified_by_primus: false,
    payer_wallet: null,
    payer_email: null,
    notes: null,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    paid_at: null,
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
];

const stats = [
  {
    title: "Total Revenue",
    value: "฿45,230",
    change: "+12.5%",
    icon: DollarSign,
  },
  { title: "Transactions", value: "127", change: "+8", icon: TrendingUp },
  { title: "Customers", value: "89", change: "+5 this week", icon: Users },
];

export default function DashboardPage() {
  const { user, logout } = usePrivy();
  const [activeTab, setActiveTab] = useState("overview");
  const [qrAmount, setQrAmount] = useState("");
  const [qrReference, setQrReference] = useState("");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  const generatePaymentQR = () => {
    const ref = qrReference || generateReference();
    const paymentUrl = `${window.location.origin}/pay/new?business=1&amount=${qrAmount}&ref=${ref}`;
    setGeneratedQR(paymentUrl);
    setQrReference(ref);
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-background">
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-semibold">
                Business Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email?.address || "Business"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success">KYC Approved</Badge>
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
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-serif font-semibold mt-1">
                            {stat.value}
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            {stat.change}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-sage-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Transactions</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sampleTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.status === "paid"
                                ? "bg-green-100 text-green-600"
                                : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {tx.status === "paid" ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : (
                              <RefreshCw className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{tx.reference}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatRelativeTime(tx.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatTHB(tx.amount_thb)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatUSDC(tx.amount_usdc)} USDC
                          </p>
                        </div>
                        <Badge
                          variant={tx.status === "paid" ? "success" : "warning"}
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* QR Generator Tab */}
            <TabsContent value="qr">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Payment QR</CardTitle>
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
                        <p className="text-sm text-muted-foreground mt-1">
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
                      variant="gold"
                    >
                      Generate QR Code
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment QR</CardTitle>
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
                      <div className="text-center text-muted-foreground">
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
                      <CardTitle>Menu Items</CardTitle>
                      <CardDescription>
                        Manage your products and services
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <MenuItemGrid items={sampleMenuItems} showAddButton={false} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet">
              <div className="grid lg:grid-cols-2 gap-8">
                <WalletDisplay />

                <Card>
                  <CardHeader>
                    <CardTitle>Offramp to Thai Baht</CardTitle>
                    <CardDescription>
                      Withdraw your USDC balance to your bank account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-sage-50 dark:bg-sage-900/20 p-4 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        Available for withdrawal
                      </p>
                      <p className="text-2xl font-serif font-semibold">
                        0.00 USDC
                      </p>
                    </div>

                    <div>
                      <Label>Withdraw Amount (USDC)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="mt-1"
                        disabled
                      />
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Exchange Rate</span>
                        <span>1 USDC = ฿35.70</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee</span>
                        <span>0.5%</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium text-foreground">
                        <span>You&apos;ll Receive</span>
                        <span>฿0.00</span>
                      </div>
                    </div>

                    <Button className="w-full" disabled>
                      Request Withdrawal
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Withdrawals are processed via PromptPay within 2 minutes
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
