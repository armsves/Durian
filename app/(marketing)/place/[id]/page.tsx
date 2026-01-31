"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Share2,
  QrCode,
  Wallet,
  CreditCard,
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
import { MenuItemGrid } from "@/components/menu-item-card";
import { MapboxMap } from "@/components/mapbox-map";
import { QRCode } from "@/components/qr-code";
import { CATEGORY_LABELS, formatTHB, thbToUsdc, generateReference } from "@/lib/utils";
import type { Business, MenuItem, MapMarker } from "@/types";

// Sample data (in production, fetch from Supabase)
const sampleBusiness: Business = {
  id: "1",
  privy_user_id: "user1",
  name: "Nimman Café & Roasters",
  category: "cafe",
  description:
    "Specialty coffee roasters in the heart of Nimman. We source our beans directly from Northern Thailand highland farmers, ensuring fair trade and exceptional quality. Our baristas are trained in the art of pour-over and espresso craft.",
  logo_url: null,
  cover_url:
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200",
  address: "Nimmanhaemin Rd Soi 9, Su Thep, Mueang Chiang Mai 50200",
  lat: 18.797,
  lng: 98.9677,
  hours: {
    monday: { open: "07:00", close: "18:00" },
    tuesday: { open: "07:00", close: "18:00" },
    wednesday: { open: "07:00", close: "18:00" },
    thursday: { open: "07:00", close: "18:00" },
    friday: { open: "07:00", close: "20:00" },
    saturday: { open: "08:00", close: "20:00" },
    sunday: { open: "08:00", close: "17:00" },
  },
  kyc_status: "approved",
  bank_details: null,
  wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
  phone: "+66 53 123 456",
  email: "hello@nimmancafe.com",
  website: "https://nimmancafe.com",
  rating: 4.8,
  review_count: 127,
  is_featured: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const sampleMenuItems: MenuItem[] = [
  {
    id: "m1",
    business_id: "1",
    name: "Signature Pour Over",
    category: "Coffee",
    price_thb: 120,
    image_url: null,
    description: "Single-origin beans from Doi Chang, hand-poured to perfection.",
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
    description: "Espresso with cold milk over ice.",
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "m3",
    business_id: "1",
    name: "Matcha Latte",
    category: "Specialty",
    price_thb: 110,
    image_url: null,
    description: "Premium Japanese matcha with steamed milk.",
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "m4",
    business_id: "1",
    name: "Croissant",
    category: "Pastry",
    price_thb: 85,
    image_url: null,
    description: "Freshly baked butter croissant.",
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "m5",
    business_id: "1",
    name: "Banana Bread",
    category: "Pastry",
    price_thb: 75,
    image_url: null,
    description: "Homemade with local bananas and walnuts.",
    is_available: false,
    created_at: new Date().toISOString(),
  },
];

export default function BusinessProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPayDialog, setShowPayDialog] = useState(false);

  // In production, fetch business data based on params.id
  const business = sampleBusiness;
  const menuItems = sampleMenuItems;

  const marker: MapMarker = {
    id: business.id,
    lat: business.lat,
    lng: business.lng,
    name: business.name,
    category: business.category,
    rating: business.rating,
  };

  const handlePay = () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      // Create payment intent and redirect
      const reference = generateReference();
      router.push(
        `/pay/new?business=${business.id}&amount=${amount}&ref=${reference}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-background">
      <Header />

      <main className="pt-16">
        {/* Cover Image */}
        <div className="relative h-64 md:h-80 bg-muted">
          {business.cover_url ? (
            <Image
              src={business.cover_url}
              alt={business.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-durian-gradient" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto">
              <Button
                variant="ghost"
                className="text-white mb-4"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-10 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="sage" className="mb-2">
                        {CATEGORY_LABELS[business.category]}
                      </Badge>
                      <h1 className="text-3xl font-serif font-semibold mb-2">
                        {business.name}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                          <span className="font-medium text-foreground">
                            {business.rating.toFixed(1)}
                          </span>
                          <span>({business.review_count} reviews)</span>
                        </div>
                        <Badge variant="success">Accepts Crypto</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="mt-4 text-muted-foreground">
                    {business.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{business.address}</span>
                    </div>
                    {business.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                    {business.website && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {business.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Open today 07:00 - 18:00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Menu */}
              <Card>
                <CardHeader>
                  <CardTitle>Menu</CardTitle>
                </CardHeader>
                <CardContent>
                  <MenuItemGrid items={menuItems} showAddButton={false} />
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <MapboxMap
                    markers={[marker]}
                    className="h-[300px]"
                    interactive={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Card */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Pay This Business
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (THB)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="mt-1"
                    />
                    {paymentAmount && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ≈ {thbToUsdc(parseFloat(paymentAmount)).toFixed(2)} USDC
                      </p>
                    )}
                  </div>

                  <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        variant="gold"
                        size="lg"
                        disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                      >
                        Pay Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Choose Payment Method</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 mt-4">
                        <Button
                          variant="outline"
                          className="h-auto py-4 justify-start"
                          onClick={handlePay}
                        >
                          <Wallet className="w-5 h-5 mr-3" />
                          <div className="text-left">
                            <p className="font-medium">Pay with USDC</p>
                            <p className="text-xs text-muted-foreground">
                              Send from your wallet
                            </p>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto py-4 justify-start"
                          onClick={handlePay}
                        >
                          <CreditCard className="w-5 h-5 mr-3" />
                          <div className="text-left">
                            <p className="font-medium">Pay with Revolut</p>
                            <p className="text-xs text-muted-foreground">
                              Verified by Primus zkTLS
                            </p>
                          </div>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <p className="text-xs text-muted-foreground text-center">
                    Payments are processed via secure blockchain infrastructure
                  </p>
                </CardContent>
              </Card>

              {/* Wallet Address */}
              {business.wallet_address && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Business Wallet (Base)
                    </p>
                    <p className="font-mono text-xs break-all">
                      {business.wallet_address}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
