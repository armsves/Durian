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
      className={cn(className)}
    >
      {/* Tree trunk */}
      <rect
        x="17"
        y="28"
        width="6"
        height="10"
        rx="1"
        fill="#5C6B5C"
      />
      {/* Tree crown - stylized durian shape */}
      <ellipse
        cx="20"
        cy="16"
        rx="14"
        ry="14"
        fill="#2D3A2D"
      />
      {/* Inner highlight */}
      <ellipse
        cx="20"
        cy="14"
        rx="10"
        ry="10"
        fill="#3d473d"
      />
      {/* Spiky texture lines */}
      <path
        d="M20 2 L20 6 M12 5 L14 8 M28 5 L26 8 M6 12 L10 14 M34 12 L30 14 M4 20 L8 20 M36 20 L32 20"
        stroke="#2D3A2D"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
