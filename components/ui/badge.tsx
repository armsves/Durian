import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A35E] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#2D3A2D] text-white hover:bg-[#3d473d]",
        secondary:
          "border-transparent bg-[#A8C2B9] text-[#000] hover:bg-[#A8C2B9]/80",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "border-[#A8C2B9] text-[#000]",
        success:
          "border-transparent bg-green-100 text-green-800",
        warning:
          "border-transparent bg-amber-100 text-amber-800",
        gold: "border-transparent bg-[#C5A35E]/20 text-[#8a6b3c]",
        sage: "border-transparent bg-[#A8C2B9]/30 text-[#2D3A2D]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
