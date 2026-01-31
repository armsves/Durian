// Primus Labs zkTLS SDK integration
// Used to verify payment data from external sources (Revolut, etc.)

interface PrimusVerificationResult {
  valid: boolean;
  data: Record<string, unknown>;
  proof?: string;
  error?: string;
}

interface PaymentVerification {
  amount: number;
  currency: string;
  merchantId: string;
  status: string;
}

// Client-side verification trigger
export async function triggerPrimusVerification(
  paymentLink: string,
  expectedAmount: number
): Promise<PrimusVerificationResult> {
  try {
    // Call our API endpoint which handles the Primus verification
    const response = await fetch("/api/primus/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentLink,
        expectedAmount,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Primus verification error:", error);
    return {
      valid: false,
      data: {},
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

// For demo purposes - simulate verification
export async function mockPrimusVerification(
  paymentLink: string,
  expectedAmount: number
): Promise<PrimusVerificationResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock successful verification
  const mockData: PaymentVerification = {
    amount: expectedAmount,
    currency: "THB",
    merchantId: "demo-merchant",
    status: "completed",
  };

  return {
    valid: true,
    data: mockData,
    proof: `zk-proof-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

// Generate verification badge data
export function generateVerificationBadge(proof: string): string {
  return `✓ Verified by Primus zkTLS | Proof: ${proof.slice(0, 16)}...`;
}
