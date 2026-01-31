"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn, CHIANG_MAI_BOUNDS, CATEGORY_LABELS } from "@/lib/utils";
import type { MapMarker } from "@/types";

// Set access token
if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

interface MapboxMapProps {
  markers?: MapMarker[];
  onMarkerClick?: (id: string) => void;
  className?: string;
  interactive?: boolean;
  selectedId?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

const categoryColors: Record<string, string> = {
  cafe: "#8B4513",
  restaurant: "#D2691E",
  spa: "#9370DB",
  hotel: "#4169E1",
  shop: "#32CD32",
  tour: "#FF6347",
  coworking: "#20B2AA",
  other: "#708090",
};

export function MapboxMap({
  markers = [],
  onMarkerClick,
  className,
  interactive = true,
  selectedId,
  onLocationSelect,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      console.warn("Mapbox token not configured");
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [CHIANG_MAI_BOUNDS.center.lng, CHIANG_MAI_BOUNDS.center.lat],
      zoom: CHIANG_MAI_BOUNDS.zoom,
      interactive,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setIsLoaded(true);
    });

    if (onLocationSelect) {
      map.current.on("click", (e) => {
        onLocationSelect(e.lngLat.lat, e.lngLat.lng);
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [interactive, onLocationSelect]);

  // Update markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = "marker-pin";
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${categoryColors[marker.category] || categoryColors.other};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      `;
      el.textContent = marker.name[0];

      if (marker.id === selectedId) {
        el.style.transform = "scale(1.3)";
        el.style.zIndex = "10";
      }

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.2)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = marker.id === selectedId ? "scale(1.3)" : "scale(1)";
      });

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div style="padding: 8px;">
          <h4 style="font-weight: 600; margin-bottom: 4px;">${marker.name}</h4>
          <p style="font-size: 12px; color: #666;">${CATEGORY_LABELS[marker.category] || marker.category}</p>
          <p style="font-size: 12px; color: #666;">⭐ ${marker.rating.toFixed(1)}</p>
        </div>
      `);

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("click", () => {
        onMarkerClick?.(marker.id);
      });

      markersRef.current.push(mapboxMarker);
    });
  }, [markers, isLoaded, onMarkerClick, selectedId]);

  // Fly to selected marker
  useEffect(() => {
    if (!map.current || !selectedId || !isLoaded) return;

    const marker = markers.find((m) => m.id === selectedId);
    if (marker) {
      map.current.flyTo({
        center: [marker.lng, marker.lat],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [selectedId, markers, isLoaded]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div
        className={cn(
          "bg-muted rounded-2xl flex items-center justify-center",
          className
        )}
      >
        <p className="text-muted-foreground text-center p-8">
          Map requires Mapbox token.
          <br />
          <span className="text-sm">Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local</span>
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className={cn("w-full h-full min-h-[400px] rounded-2xl", className)}
    />
  );
}

// Location picker for business onboarding
interface LocationPickerProps {
  value?: { lat: number; lng: number };
  onChange: (location: { lat: number; lng: number }) => void;
  className?: string;
}

export function LocationPicker({
  value,
  onChange,
  className,
}: LocationPickerProps) {
  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      onChange({ lat, lng });
    },
    [onChange]
  );

  const markers: MapMarker[] = value
    ? [
        {
          id: "selected",
          lat: value.lat,
          lng: value.lng,
          name: "Selected Location",
          category: "other",
          rating: 0,
        },
      ]
    : [];

  return (
    <div className={cn("relative", className)}>
      <MapboxMap
        markers={markers}
        onLocationSelect={handleLocationSelect}
        className="h-[300px]"
      />
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm text-center">
        {value ? (
          <p>
            Location: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-muted-foreground">Click on the map to select your location</p>
        )}
      </div>
    </div>
  );
}
