"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatTHB } from "@/lib/utils";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
  onSelect?: (item: MenuItem) => void;
  className?: string;
  showAddButton?: boolean;
}

export function MenuItemCard({
  item,
  onSelect,
  className,
  showAddButton = true,
}: MenuItemCardProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden hover:shadow-md transition-all duration-300",
        !item.is_available && "opacity-60",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <Badge variant="secondary" className="text-xs mt-1">
                  {item.category}
                </Badge>
              </div>
              <p className="font-serif font-semibold text-sage-700 whitespace-nowrap">
                {formatTHB(item.price_thb)}
              </p>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {item.description}
              </p>
            )}
            {!item.is_available && (
              <Badge variant="secondary" className="mt-2">
                Currently unavailable
              </Badge>
            )}
          </div>
          {item.image_url && (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
        {showAddButton && item.is_available && onSelect && (
          <div className="px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onSelect(item)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Order
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MenuItemGridProps {
  items: MenuItem[];
  onSelect?: (item: MenuItem) => void;
  showAddButton?: boolean;
}

export function MenuItemGrid({
  items,
  onSelect,
  showAddButton,
}: MenuItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No menu items available
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onSelect={onSelect}
          showAddButton={showAddButton}
        />
      ))}
    </div>
  );
}
