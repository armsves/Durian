"use client";

import QRCodeLib from "react-qr-code";
import { cn } from "@/lib/utils";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
  businessName?: string;
}

export function QRCode({
  value,
  size = 200,
  className,
  bgColor = "#ffffff",
  fgColor = "#1a1a1a",
}: QRCodeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-white p-4",
        className
      )}
    >
      <QRCodeLib
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level="H"
      />
    </div>
  );
}

interface PaymentQRCodeProps {
  paymentUrl: string;
  amount?: string;
  currency?: string;
  reference?: string;
}

export function PaymentQRCode({
  paymentUrl,
  amount,
  currency,
  reference,
}: PaymentQRCodeProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <QRCode value={paymentUrl} size={220} className="shadow-lg" />
      {amount && currency && (
        <div className="text-center">
          <p className="text-2xl font-serif font-semibold" style={{ color: "#000" }}>
            {currency} {amount}
          </p>
          {reference && (
            <p className="text-sm mt-1" style={{ color: "#666" }}>
              Ref: {reference}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
