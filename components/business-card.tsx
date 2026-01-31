"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, CATEGORY_LABELS } from "@/lib/utils";
import type { Business } from "@/types";

interface BusinessCardProps {
  business: Business;
  className?: string;
  variant?: "default" | "compact" | "featured";
}

export function BusinessCard({
  business,
  className,
  variant = "default",
}: BusinessCardProps) {
  if (variant === "compact") {
    return (
      <Link href={`/place/${business.id}`}>
        <Card
          className={cn(
            "group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden",
            className
          )}
        >
          <CardContent className="p-4 flex gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
              {business.logo_url ? (
                <Image
                  src={business.logo_url}
                  alt={business.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-sage-100 text-sage-600 text-xl font-serif">
                  {business.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                {business.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {CATEGORY_LABELS[business.category] || business.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
                  {business.rating.toFixed(1)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/place/${business.id}`}>
        <Card
          className={cn(
            "group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-gold-200",
            className
          )}
        >
          <div className="relative h-48 bg-muted">
            {business.cover_url ? (
              <Image
                src={business.cover_url}
                alt={business.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-durian-gradient" />
            )}
            <Badge
              variant="gold"
              className="absolute top-3 right-3"
            >
              Featured
            </Badge>
          </div>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl font-semibold truncate group-hover:text-primary transition-colors">
                  {business.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {business.address}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm bg-gold-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                <span className="font-medium">{business.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {business.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/place/${business.id}`}>
      <Card
        className={cn(
          "group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden",
          className
        )}
      >
        <div className="relative h-40 bg-muted">
          {business.cover_url ? (
            <Image
              src={business.cover_url}
              alt={business.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-durian-gradient flex items-center justify-center">
              <span className="text-4xl font-serif text-sage-700">
                {business.name[0]}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                {business.name}
              </h3>
              <Badge variant="secondary" className="text-xs mt-1">
                {CATEGORY_LABELS[business.category] || business.category}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
              <span>{business.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{business.address}</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
