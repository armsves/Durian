"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Globe,
  Share2,
  QrCode,
  Wallet,
  CreditCard,
  BadgeCheck,
  Mail,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MapboxMap } from "@/components/mapbox-map";
import { QRCode } from "@/components/qr-code";
import { CATEGORY_LABELS, formatTHB, thbToUsdc, generateReference, shortenAddress } from "@/lib/utils";
import type { Business, MenuItem } from "@/types/database";

interface PlaceClientProps {
  business: Business;
  menuItems: MenuItem[];
}

export function PlaceClient({ business, menuItems }: PlaceClientProps) {
  const router = useRouter();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"amount" | "qr">("amount");
  const [paymentMethod, setPaymentMethod] = useState<"usdc" | "revolut">("usdc");
  const [copied, setCopied] = useState(false);
  const [reference] = useState(generateReference());
  const [liveRate, setLiveRate] = useState<{ thbPerUsdc: number; formatted: string } | null>(null);

  const categoryLabel = CATEGORY_LABELS[business.category as keyof typeof CATEGORY_LABELS] || business.category;

  // Fetch live exchange rate when dialog opens
  useEffect(() => {
    if (paymentDialogOpen) {
      fetch("/api/exchange-rate")
        .then(res => res.json())
        .then(data => {
          setLiveRate({
            thbPerUsdc: data.rate.thbPerUsdc,
            formatted: data.rate.formatted,
          });
        })
        .catch(err => console.error("Failed to fetch rate:", err));
    }
  }, [paymentDialogOpen]);

  const markers = business.latitude && business.longitude
    ? [
        {
          id: business.id,
          lat: business.latitude,
          lng: business.longitude,
          name: business.name,
          category: business.category,
          rating: business.rating,
        },
      ]
    : [];

  // Calculate USDC amount using live rate if available, otherwise fallback
  const thbAmount = parseFloat(paymentAmount) || 0;
  const usdcAmount = liveRate 
    ? Number((thbAmount / liveRate.thbPerUsdc).toFixed(6))
    : thbToUsdc(thbAmount);
  
  // Base Sepolia USDC contract
  const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const BASE_SEPOLIA_CHAIN_ID = 84532;
  const USDC_DECIMALS = 6;

  // Generate payment URL for QR code using MetaMask deep link format
  const getPaymentQRValue = () => {
    if (paymentMethod === "usdc" && business.wallet_address) {
      // MetaMask deep link format for ERC-20 token transfer:
      // https://metamask.app.link/send/pay-<token>@<chain>/transfer?address=<recipient>&uint256=<amount>
      const amountScientific = `${usdcAmount}e${USDC_DECIMALS}`;
      return `https://metamask.app.link/send/pay-${USDC_CONTRACT}@${BASE_SEPOLIA_CHAIN_ID}/transfer?address=${business.wallet_address}&uint256=${amountScientific}`;
    } else {
      // Revolut payment link (mock)
      return `https://revolut.me/pay/${business.slug || business.id}?amount=${paymentAmount}&currency=THB&ref=${reference}`;
    }
  };

  const handleCopyAddress = () => {
    if (business.wallet_address) {
      navigator.clipboard.writeText(business.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetPaymentDialog = () => {
    setPaymentStep("amount");
    setPaymentAmount("");
  };

  const handleDialogChange = (open: boolean) => {
    setPaymentDialogOpen(open);
    if (!open) {
      resetPaymentDialog();
    }
  };

  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBF7" }}>
      <Header />

      <main className="pt-16">
        {/* Hero Image */}
        <div className="relative h-[300px] md:h-[400px]">
          <Image
            src={business.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200"}
            alt={business.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Back button */}
          <div className="absolute top-20 left-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#000" }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Business info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="container mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Badge style={{ backgroundColor: "#C5A35E", color: "white" }}>
                  {categoryLabel}
                </Badge>
                {business.is_verified && (
                  <Badge variant="outline" className="border-white/50 text-white">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {business.is_featured && (
                  <Badge variant="outline" className="border-white/50 text-white">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                {business.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-current" style={{ color: "#C5A35E" }} />
                  <span className="font-semibold">{business.rating}</span>
                  <span className="opacity-80">({business.review_count} reviews)</span>
                </div>
                {business.address && (
                  <div className="flex items-center gap-1 opacity-80">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{business.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <Card style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}>
                <CardHeader>
                  <CardTitle style={{ color: "#000" }}>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ color: "#444" }}>
                    {business.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              {/* Menu */}
              {menuItems.length > 0 && (
                <Card style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}>
                  <CardHeader>
                    <CardTitle style={{ color: "#000" }}>Menu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue={Object.keys(menuByCategory)[0]} className="w-full">
                      <TabsList className="mb-4 flex-wrap h-auto gap-2">
                        {Object.keys(menuByCategory).map((category) => (
                          <TabsTrigger key={category} value={category}>
                            {category}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {Object.entries(menuByCategory).map(([category, items]) => (
                        <TabsContent key={category} value={category}>
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-start p-3 rounded-lg"
                                style={{ backgroundColor: "rgba(168, 194, 185, 0.1)" }}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium" style={{ color: "#000" }}>
                                      {item.name}
                                    </h4>
                                    {item.is_popular && (
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs"
                                        style={{ backgroundColor: "#C5A35E", color: "white" }}
                                      >
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-sm mt-1" style={{ color: "#666" }}>
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-semibold" style={{ color: "#000" }}>
                                    {formatTHB(item.price_thb)}
                                  </p>
                                  <p className="text-xs" style={{ color: "#C5A35E" }}>
                                    ~{thbToUsdc(item.price_thb).toFixed(2)} USDC
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              {business.latitude && business.longitude && (
                <Card style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}>
                  <CardHeader>
                    <CardTitle style={{ color: "#000" }}>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] rounded-xl overflow-hidden mb-4">
                      <MapboxMap markers={markers} selectedId={business.id} />
                    </div>
                    {business.address && (
                      <p className="flex items-center gap-2" style={{ color: "#666" }}>
                        <MapPin className="w-4 h-4" />
                        {business.address}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Card */}
              <Card style={{ backgroundColor: "#2D3A2D", color: "white" }}>
                <CardHeader>
                  <CardTitle className="text-white">Pay with Crypto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm opacity-80">
                    Pay instantly with USDC or verify your Revolut payment.
                  </p>

                  <div className="flex gap-2">
                    {business.accepts_usdc && (
                      <Badge 
                        variant="outline" 
                        className="border-white/30 text-white"
                      >
                        <Wallet className="w-3 h-3 mr-1" />
                        USDC
                      </Badge>
                    )}
                    {business.accepts_revolut && (
                      <Badge 
                        variant="outline" 
                        className="border-white/30 text-white"
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
                        Revolut
                      </Badge>
                    )}
                  </div>

                  <Dialog open={paymentDialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full"
                        style={{ backgroundColor: "#C5A35E", color: "white" }}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Create Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle style={{ color: "#000" }}>
                          {paymentStep === "amount" ? "Enter Amount" : "Scan to Pay"}
                        </DialogTitle>
                      </DialogHeader>

                      {paymentStep === "amount" ? (
                        <div className="space-y-6 pt-4">
                          <div>
                            <Label style={{ color: "#000" }}>Amount (THB)</Label>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="mt-2 text-lg h-12"
                              style={{ fontSize: "18px" }}
                            />
                            {paymentAmount && parseFloat(paymentAmount) > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <p className="text-sm" style={{ color: "#C5A35E" }}>
                                  ≈ {usdcAmount.toFixed(2)} USDC
                                </p>
                                {liveRate && (
                                  <Badge 
                                    className="text-[10px] px-1.5 py-0"
                                    style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}
                                  >
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                            )}
                            {liveRate && (
                              <p className="text-xs mt-1" style={{ color: "#999" }}>
                                Rate: {liveRate.formatted}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label style={{ color: "#000" }}>Payment Method</Label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              <button
                                onClick={() => setPaymentMethod("usdc")}
                                className="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                                style={{
                                  borderColor: paymentMethod === "usdc" ? "#C5A35E" : "rgba(168, 194, 185, 0.3)",
                                  backgroundColor: paymentMethod === "usdc" ? "rgba(197, 163, 94, 0.1)" : "white",
                                }}
                              >
                                <Wallet className="w-6 h-6" style={{ color: paymentMethod === "usdc" ? "#C5A35E" : "#666" }} />
                                <span className="font-medium" style={{ color: "#000" }}>USDC</span>
                                <span className="text-xs" style={{ color: "#666" }}>Base Network</span>
                              </button>
                              <button
                                onClick={() => setPaymentMethod("revolut")}
                                className="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                                style={{
                                  borderColor: paymentMethod === "revolut" ? "#C5A35E" : "rgba(168, 194, 185, 0.3)",
                                  backgroundColor: paymentMethod === "revolut" ? "rgba(197, 163, 94, 0.1)" : "white",
                                }}
                              >
                                <CreditCard className="w-6 h-6" style={{ color: paymentMethod === "revolut" ? "#C5A35E" : "#666" }} />
                                <span className="font-medium" style={{ color: "#000" }}>Revolut</span>
                                <span className="text-xs" style={{ color: "#666" }}>Bank Transfer</span>
                              </button>
                            </div>
                          </div>

                          <Button
                            className="w-full h-12"
                            style={{ backgroundColor: "#C5A35E", color: "white" }}
                            onClick={() => setPaymentStep("qr")}
                            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                          >
                            Generate QR Code
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6 pt-4">
                          {/* QR Code */}
                          <div className="flex justify-center">
                            <QRCode 
                              value={getPaymentQRValue()} 
                              size={200}
                              className="shadow-lg"
                            />
                          </div>

                          {/* Payment Details */}
                          <div 
                            className="p-4 rounded-xl text-center"
                            style={{ backgroundColor: "rgba(168, 194, 185, 0.1)" }}
                          >
                            <p className="text-sm" style={{ color: "#666" }}>Amount to Pay</p>
                            <p className="text-3xl font-serif font-bold mt-1" style={{ color: "#000" }}>
                              {paymentMethod === "usdc" 
                                ? `${usdcAmount.toFixed(2)} USDC`
                                : formatTHB(parseFloat(paymentAmount))
                              }
                            </p>
                            {paymentMethod === "usdc" && (
                              <p className="text-sm mt-1" style={{ color: "#666" }}>
                                ({formatTHB(parseFloat(paymentAmount))})
                              </p>
                            )}
                            <p className="text-xs mt-2" style={{ color: "#666" }}>
                              Ref: {reference}
                            </p>
                          </div>

                          {/* Payment Method Info */}
                          {paymentMethod === "usdc" && business.wallet_address && (
                            <div className="space-y-3">
                              <div 
                                className="p-3 rounded-lg text-center"
                                style={{ backgroundColor: "rgba(197, 163, 94, 0.1)" }}
                              >
                                <p className="text-xs font-medium" style={{ color: "#C5A35E" }}>
                                  USDC on Base Sepolia
                                </p>
                                <p className="text-xs mt-1" style={{ color: "#666" }}>
                                  Scan with any Web3 wallet
                                </p>
                              </div>
                              <div>
                                <p className="text-sm mb-2" style={{ color: "#666" }}>
                                  Recipient Address:
                                </p>
                                <div 
                                  className="flex items-center justify-between p-3 rounded-lg"
                                  style={{ backgroundColor: "rgba(168, 194, 185, 0.1)" }}
                                >
                                  <code className="text-xs" style={{ color: "#000" }}>
                                    {shortenAddress(business.wallet_address, 6)}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyAddress}
                                    style={{ color: "#C5A35E" }}
                                  >
                                    {copied ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-center" style={{ color: "#666" }}>
                                Token: {shortenAddress(USDC_CONTRACT, 4)}
                              </p>
                            </div>
                          )}

                          {paymentMethod === "revolut" && (
                            <div 
                              className="p-3 rounded-lg text-center"
                              style={{ backgroundColor: "rgba(197, 163, 94, 0.1)" }}
                            >
                              <p className="text-sm" style={{ color: "#666" }}>
                                Scan QR with Revolut app or click below
                              </p>
                              <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() => window.open(getPaymentQRValue(), "_blank")}
                              >
                                Open Revolut Link
                              </Button>
                            </div>
                          )}

                          {/* Back button */}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setPaymentStep("amount")}
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Change Amount
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}>
                <CardHeader>
                  <CardTitle style={{ color: "#000" }}>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                      style={{ color: "#000" }}
                    >
                      <Phone className="w-4 h-4" style={{ color: "#5C6B5C" }} />
                      {business.phone}
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                      style={{ color: "#000" }}
                    >
                      <Mail className="w-4 h-4" style={{ color: "#5C6B5C" }} />
                      {business.email}
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                      style={{ color: "#000" }}
                    >
                      <Globe className="w-4 h-4" style={{ color: "#5C6B5C" }} />
                      Website
                    </a>
                  )}
                  <Button variant="outline" className="w-full mt-2">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
