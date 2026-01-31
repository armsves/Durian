"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, MapPin, Grid, List, Star, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MapboxMap } from "@/components/mapbox-map";
import { CATEGORY_LABELS } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Business } from "@/types/database";
import Image from "next/image";
import Link from "next/link";

interface DirectoryClientProps {
  businesses: Business[];
}

export function DirectoryClient({ businesses }: DirectoryClientProps) {
  const router = useRouter();
  const { directoryFilters, setDirectoryFilters } = useAppStore();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
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
  }, [businesses, directoryFilters]);

  const markers = filteredBusinesses
    .filter((b) => b.latitude && b.longitude)
    .map((b) => ({
      id: b.id,
      lat: b.latitude!,
      lng: b.longitude!,
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
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBF7" }}>
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif mb-2" style={{ color: "#000" }}>
              Business Directory
            </h1>
            <p style={{ color: "#666" }}>
              Discover crypto-friendly businesses in Chiang Mai
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                style={{ color: "#666" }} 
              />
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

          {/* Results count */}
          <p className="text-sm mb-6" style={{ color: "#666" }}>
            {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? "es" : ""} found
          </p>

          {/* Content */}
          {viewMode === "map" ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2 h-[600px] rounded-xl overflow-hidden">
                <MapboxMap
                  markers={markers}
                  onMarkerClick={handleMarkerClick}
                  selectedId={selectedId}
                />
              </div>

              {/* Side list */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredBusinesses.map((business) => (
                  <BusinessCardCompact
                    key={business.id}
                    business={business}
                    isSelected={selectedId === business.id}
                    onClick={() => {
                      setSelectedId(business.id);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredBusinesses.map((business) => (
                <BusinessCardFull
                  key={business.id}
                  business={business}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: "#A8C2B9" }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: "#000" }}>
                No businesses found
              </h3>
              <p style={{ color: "#666" }}>
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Business card for grid/list view
function BusinessCardFull({
  business,
  viewMode,
}: {
  business: Business;
  viewMode: "grid" | "list";
}) {
  const categoryLabel = CATEGORY_LABELS[business.category as keyof typeof CATEGORY_LABELS] || business.category;

  if (viewMode === "list") {
    return (
      <Link href={`/place/${business.id}`}>
        <div
          className="flex gap-4 p-4 rounded-xl transition-all hover:shadow-lg cursor-pointer"
          style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}
        >
          <div className="relative w-32 h-24 rounded-lg overflow-hidden shrink-0">
            <Image
              src={business.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"}
              alt={business.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate" style={{ color: "#000" }}>
                    {business.name}
                  </h3>
                  {business.is_verified && (
                    <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: "#C5A35E" }} />
                  )}
                </div>
                <p className="text-sm" style={{ color: "#666" }}>
                  {categoryLabel}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 fill-current" style={{ color: "#C5A35E" }} />
                <span className="font-medium" style={{ color: "#000" }}>{business.rating}</span>
                <span className="text-sm" style={{ color: "#666" }}>({business.review_count})</span>
              </div>
            </div>
            <p className="text-sm mt-2 line-clamp-2" style={{ color: "#666" }}>
              {business.description}
            </p>
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#666" }}>
              <MapPin className="w-3 h-3" />
              {business.address}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/place/${business.id}`}>
      <div
        className="rounded-xl overflow-hidden transition-all hover:shadow-lg cursor-pointer h-full"
        style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}
      >
        <div className="relative h-48">
          <Image
            src={business.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"}
            alt={business.name}
            fill
            className="object-cover"
          />
          {business.is_featured && (
            <Badge 
              className="absolute top-3 left-3"
              style={{ backgroundColor: "#C5A35E", color: "white" }}
            >
              Featured
            </Badge>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate" style={{ color: "#000" }}>
                  {business.name}
                </h3>
                {business.is_verified && (
                  <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: "#C5A35E" }} />
                )}
              </div>
              <p className="text-sm" style={{ color: "#666" }}>
                {categoryLabel}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 fill-current" style={{ color: "#C5A35E" }} />
              <span className="font-medium" style={{ color: "#000" }}>{business.rating}</span>
            </div>
          </div>
          <p className="text-sm line-clamp-2 mb-3" style={{ color: "#666" }}>
            {business.description}
          </p>
          <p className="text-xs flex items-center gap-1" style={{ color: "#666" }}>
            <MapPin className="w-3 h-3" />
            {business.address}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Compact card for map sidebar
function BusinessCardCompact({
  business,
  isSelected,
  onClick,
}: {
  business: Business;
  isSelected: boolean;
  onClick: () => void;
}) {
  const categoryLabel = CATEGORY_LABELS[business.category as keyof typeof CATEGORY_LABELS] || business.category;

  return (
    <Link href={`/place/${business.id}`}>
      <div
        className="flex gap-3 p-3 rounded-xl cursor-pointer transition-all"
        style={{
          backgroundColor: isSelected ? "rgba(197, 163, 94, 0.1)" : "white",
          border: isSelected ? "2px solid #C5A35E" : "1px solid rgba(168, 194, 185, 0.3)",
        }}
        onClick={onClick}
      >
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <Image
            src={business.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200"}
            alt={business.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate" style={{ color: "#000" }}>
            {business.name}
          </h4>
          <p className="text-xs" style={{ color: "#666" }}>
            {categoryLabel}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-current" style={{ color: "#C5A35E" }} />
            <span className="text-xs font-medium" style={{ color: "#000" }}>{business.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
