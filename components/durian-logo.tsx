"use client";

import { cn } from "@/lib/utils";

interface DurianLogoProps {
  className?: string;
}

export function DurianLogo({ className }: DurianLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-sage-700", className)}
    >
      {/* Tree trunk */}
      <rect
        x="17"
        y="28"
        width="6"
        height="10"
        rx="1"
        fill="currentColor"
        className="text-durian-700"
      />
      {/* Tree crown - stylized durian shape */}
      <ellipse
        cx="20"
        cy="16"
        rx="14"
        ry="14"
        fill="currentColor"
        className="text-sage-600"
      />
      {/* Inner highlight */}
      <ellipse
        cx="20"
        cy="14"
        rx="10"
        ry="10"
        fill="currentColor"
        className="text-sage-500"
      />
      {/* Spiky texture lines */}
      <path
        d="M20 2 L20 6 M12 5 L14 8 M28 5 L26 8 M6 12 L10 14 M34 12 L30 14 M4 20 L8 20 M36 20 L32 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-sage-700"
      />
    </svg>
  );
}
