import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A35E] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#2D3A2D] text-white hover:bg-[#3d473d] shadow-lg shadow-[#2D3A2D]/25",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-[#A8C2B9] bg-transparent text-[#000] hover:bg-[#A8C2B9]/10",
        secondary:
          "bg-[#A8C2B9] text-[#000] hover:bg-[#A8C2B9]/80",
        ghost: "text-[#000] hover:bg-[#A8C2B9]/20",
        link: "text-[#2D3A2D] underline-offset-4 hover:underline",
        gold: "bg-[#C5A35E] text-white hover:bg-[#a8864a] shadow-lg shadow-[#C5A35E]/25",
        sage: "bg-[#5C6B5C] text-white hover:bg-[#495649]",
        glass: "bg-white/20 backdrop-blur-lg border border-white/30 text-white hover:bg-white/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
