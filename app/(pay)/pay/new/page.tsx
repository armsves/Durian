"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Generate a new payment intent ID and redirect
    const intentId = `intent-${Date.now().toString(36)}`;
    const queryString = searchParams.toString();
    router.replace(`/pay/${intentId}?${queryString}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-durian-gradient">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-sage-700" />
        <p className="text-muted-foreground">Creating payment...</p>
      </div>
    </div>
  );
}
