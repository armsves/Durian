"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function NewPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Generate a new payment intent ID and redirect
    const intentId = `intent-${Date.now().toString(36)}`;
    const queryString = searchParams.toString();
    router.replace(`/pay/${intentId}?${queryString}`);
  }, [searchParams, router]);

  return (
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#2D3A2D]" />
      <p className="text-[#5C6B5C]">Creating payment...</p>
    </div>
  );
}

export default function NewPaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#A8C2B9] to-[#FDFBF7]">
      <Suspense
        fallback={
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#2D3A2D]" />
            <p className="text-[#5C6B5C]">Loading...</p>
          </div>
        }
      >
        <NewPaymentContent />
      </Suspense>
    </div>
  );
}
