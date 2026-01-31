"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, MapPin, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BusinessCard } from "@/components/business-card";
import { MapboxMap } from "@/components/mapbox-map";
import { CATEGORY_LABELS } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Business, MapMarker, BusinessCategory } from "@/types";

// Sample businesses data for demo
const sampleBusinesses: Business[] = [
  {
    id: "1",
    privy_user_id: "user1",
    name: "Nimman Café & Roasters",
    category: "cafe",
    description: "Specialty coffee roasters in the heart of Nimman. Farm-to-cup beans from Northern Thailand highlands.",
    logo_url: null,
    cover_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
    address: "Nimmanhaemin Rd Soi 9, Chiang Mai",
    lat: 18.7970,
    lng: 98.9677,
    hours: null,
    kyc_status: "approved",
    bank_details: null,
    wallet_address: "0x1234",
    phone: null,
    email: null,
    website: null,
    rating: 4.8,
    review_count: 127,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    privy_user_id: "user2",
    name: "Lanna Thai Wellness Spa",
    category: "spa",
    description: "Traditional Thai massage and wellness treatments in a serene garden setting.",
    logo_url: null,
    cover_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
    address: "Tha Phae Gate, Old City",
    lat: 18.7879,
    lng: 98.9937,
    hours: null,
    kyc_status: "approved",
    bank_details: null,
    wallet_address: "0x2345",
    phone: null,
    email: null,
    website: null,
    rating: 4.9,
    review_count: 89,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    privy_user_id: "user3",
    name: "Farm Story Restaurant",
    category: "restaurant",
    description: "Farm-to-table Northern Thai cuisine. Organic ingredients from local farmers.",
    logo_url: null,
    cover_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    address: "Santitham Road, Chang Phueak",
    lat: 18.8050,
    lng: 98.9850,
    hours: null,
    kyc_status: "approved",
    bank_details: null,
    wallet_address: "0x3456",
    phone: null,
    email: null,
    website: null,
    rating: 4.6,
    review_count: 203,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    privy_user_id: "user4",
    name: "Doi Suthep Tour Co.",
    category: "tour",
    description: "Guided tours to Doi Suthep temple and surrounding mountain trails.",
    logo_url: null,
    cover_url: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800",
    address: "Huay Kaew Road",
    lat: 18.8048,
    lng: 98.9215,
    hours: null,
    kyc_status: "approved",
    bank_details: null,
    wallet_address: "0x4567",
    phone: null,
    email: null,
    website: null,
    rating: 4.7,
    review_count: 156,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    privy_user_id: "user5",
    name: "Maya Lifestyle Shopping",
    category: "shop",
    description: "Premium shopping destination with international and local brands.",
    logo_url: null,
    cover_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    address: "55 Huay Kaew Rd",
    lat: 18.8020,
    lng: 98.9673,
    hours: null,
    kyc_status: "approved",
    bank_details: null,
    wallet_address: "0x5678",
    phone: null,
    email: null,
    website: null,
    rating: 4.4,
    review_count: 312,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function DirectoryPage() {
  const router = useRouter();
  const { directoryFilters, setDirectoryFilters } = useAppStore();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const filteredBusinesses = useMemo(() => {
    return sampleBusinesses.filter((b) => {
      if (
        directoryFilters.category &&
        b.category !== directoryFilters.category
      ) {
        return false;
      }
      if (
        directoryFilters.search &&
        !b.name.toLowerCase().includes(directoryFilters.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [directoryFilters]);

  const markers: MapMarker[] = filteredBusinesses.map((b) => ({
    id: b.id,
    lat: b.lat,
    lng: b.lng,
    name: b.name,
    category: b.category,
    rating: b.rating,
  }));

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    if (viewMode !== "map") {
      router.push(`/place/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif mb-2">Business Directory</h1>
            <p className="text-muted-foreground">
              Discover crypto-friendly businesses in Chiang Mai
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                className="pl-10"
                value={directoryFilters.search}
                onChange={(e) =>
                  setDirectoryFilters({ search: e.target.value })
                }
              />
            </div>

            <Select
              value={directoryFilters.category || "all"}
              onValueChange={(v) =>
                setDirectoryFilters({ category: v === "all" ? null : v })
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as typeof viewMode)}
            >
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapPin className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          {viewMode === "map" ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Business List */}
              <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin">
                {filteredBusinesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    variant="compact"
                  />
                ))}
              </div>
              {/* Map */}
              <div className="lg:col-span-2 h-[600px]">
                <MapboxMap
                  markers={markers}
                  onMarkerClick={handleMarkerClick}
                  selectedId={selectedId}
                  className="h-full"
                />
              </div>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-4">
              {filteredBusinesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBusinesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  variant={business.is_featured ? "featured" : "default"}
                />
              ))}
            </div>
          )}

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No businesses found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
