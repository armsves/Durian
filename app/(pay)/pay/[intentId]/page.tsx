"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  Lock,
  Wallet,
  CreditCard,
  CheckCircle2,
  Loader2,
  Shield,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DurianLogo } from "@/components/durian-logo";
import { formatTHB, thbToUsdc, shortenAddress } from "@/lib/utils";
import { USDC_ADDRESS, ERC20_ABI, USDC_DECIMALS } from "@/lib/privy-config";
import { parseUnits, encodeFunctionData } from "viem";
import { createClient } from "@/utils/supabase/client";

interface PaymentDetails {
  businessId: string;
  businessName: string;
  amountThb: number;
  amountUsdc: number;
  reference: string;
  walletAddress: string;
}

function PaymentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"usdc" | "revolut">("usdc");
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "pending" | "verifying" | "processing" | "success" | "error">("loading");
  const [verificationProof, setVerificationProof] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");

  // Load payment details from URL and fetch business from database
  useEffect(() => {
    async function fetchBusinessDetails() {
      const businessId = searchParams.get("business");
      const amount = parseFloat(searchParams.get("amount") || "0");
      const reference = searchParams.get("ref") || `DUR-${Date.now().toString(36).toUpperCase()}`;

      if (!businessId || amount <= 0) {
        setError("Invalid payment parameters");
        setPaymentStatus("error");
        return;
      }

      const supabase = createClient();

      try {
        const { data: business, error: fetchError } = await supabase
          .from("businesses")
          .select("id, name, wallet_address")
          .eq("id", businessId)
          .single();

        if (fetchError || !business) {
          setError("Business not found");
          setPaymentStatus("error");
          return;
        }

        if (!business.wallet_address) {
          setError("Business has no wallet configured");
          setPaymentStatus("error");
          return;
        }

        setPaymentDetails({
          businessId: business.id,
          businessName: business.name,
          amountThb: amount,
          amountUsdc: thbToUsdc(amount),
          reference,
          walletAddress: business.wallet_address,
        });
        setPaymentStatus("pending");
      } catch (err) {
        console.error("Error fetching business:", err);
        setError("Failed to load payment details");
        setPaymentStatus("error");
      }
    }

    fetchBusinessDetails();
  }, [searchParams]);

  // Handle USDC payment
  const handleUSDCPayment = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!embeddedWallet || !paymentDetails) {
      setError("Wallet not available");
      return;
    }

    setPaymentStatus("processing");
    setError(null);

    try {
      // Get the wallet provider
      const provider = await embeddedWallet.getEthereumProvider();

      // Prepare the transfer data
      const amountInUnits = parseUnits(
        paymentDetails.amountUsdc.toFixed(6),
        USDC_DECIMALS
      );

      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [paymentDetails.walletAddress as `0x${string}`, amountInUnits],
      });

      // Send transaction
      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: embeddedWallet.address,
            to: USDC_ADDRESS,
            data,
          },
        ],
      });

      setTxHash(hash as string);

      // Save payment to database
      const supabase = createClient();
      await supabase.from("payment_intents").insert({
        business_id: paymentDetails.businessId,
        amount_thb: paymentDetails.amountThb,
        amount_usdc: paymentDetails.amountUsdc,
        reference: paymentDetails.reference,
        status: "completed",
        payment_method: "usdc",
        payer_wallet: embeddedWallet.address,
        tx_hash: hash as string,
        completed_at: new Date().toISOString(),
      });

      setPaymentStatus("success");
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
      setPaymentStatus("error");
    }
  };

  // Handle Revolut payment with Primus verification
  const handleRevolutPayment = async () => {
    if (!paymentDetails) return;

    setPaymentStatus("verifying");
    setError(null);

    try {
      // In production, this would call the Primus zkTLS API
      // For now, show that Revolut integration requires API setup
      setError("Revolut integration requires API configuration. Please use USDC payment.");
      setPaymentStatus("pending");
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Verification failed");
      setPaymentStatus("error");
    }
  };

  if (paymentStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FDFBF7" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#2D3A2D" }} />
      </div>
    );
  }

  if (paymentStatus === "error" && !paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FDFBF7" }}>
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#dc2626" }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: "#000" }}>Payment Error</h2>
            <p className="mb-4" style={{ color: "#666" }}>{error}</p>
            <Button asChild>
              <Link href="/directory">Back to Directory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#2D3A2D" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom right, #A8C2B9, #FDFBF7)" }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: "rgba(253, 251, 247, 0.8)", backdropFilter: "blur(12px)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <DurianLogo className="w-8 h-8" />
              <span className="font-serif text-xl font-semibold" style={{ color: "#1A1C1A" }}>Durian</span>
            </Link>
            <div className="flex items-center gap-2 text-sm" style={{ color: "#5C6B5C" }}>
              <Lock className="w-4 h-4" />
              SECURE CHECKOUT
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Summary */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#5C6B5C" }}>
                PAYMENT SUMMARY
              </p>
              <h1 className="text-4xl font-serif mb-2" style={{ color: "#1A1C1A" }}>
                Review your{" "}
                <span 
                  className="italic"
                  style={{
                    background: "linear-gradient(135deg, #C5A35E 0%, #8a6b3c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  acquisition.
                </span>
              </h1>

              <Card className="mt-6" style={{ backgroundColor: "white", border: "1px solid rgba(168, 194, 185, 0.3)" }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(168, 194, 185, 0.2)" }}>
                        <Wallet className="w-5 h-5" style={{ color: "#2D3A2D" }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "#1A1C1A" }}>Payment to</p>
                        <p className="text-sm" style={{ color: "#5C6B5C" }}>
                          {paymentDetails.businessName}
                        </p>
                      </div>
                    </div>
                    <p className="font-serif text-xl" style={{ color: "#1A1C1A" }}>
                      USDC {paymentDetails.amountUsdc.toFixed(2)}
                    </p>
                  </div>

                  <Separator style={{ backgroundColor: "rgba(168, 194, 185, 0.3)" }} className="my-4" />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: "#5C6B5C" }}>Recipient Wallet</span>
                      <span style={{ color: "#1A1C1A" }}>{shortenAddress(paymentDetails.walletAddress)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#5C6B5C" }}>Platform Fee</span>
                      <span style={{ color: "#1A1C1A" }}>USDC 0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#5C6B5C" }}>Network Gas</span>
                      <span style={{ color: "#1A1C1A" }}>Calculated at sign</span>
                    </div>
                  </div>

                  <Separator style={{ backgroundColor: "rgba(168, 194, 185, 0.3)" }} className="my-4" />

                  <div className="flex justify-between items-end">
                    <span className="font-medium" style={{ color: "#1A1C1A" }}>TOTAL DUE</span>
                    <div className="text-right">
                      <p className="font-serif text-2xl font-semibold" style={{ color: "#1A1C1A" }}>
                        USDC {paymentDetails.amountUsdc.toFixed(2)}
                      </p>
                      <p className="text-sm" style={{ color: "#C5A35E" }}>
                        = {formatTHB(paymentDetails.amountThb)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 flex items-start gap-3 text-sm" style={{ color: "#5C6B5C" }}>
                <Shield className="w-5 h-5 shrink-0" style={{ color: "#2D3A2D" }} />
                <div>
                  <p>Funds are settled via regulated Thai digital asset protocols.</p>
                  <p>Your transaction is protected by institutional-grade encryption.</p>
                </div>
              </div>
            </div>

            {/* Payment Gateway */}
            <Card className="overflow-hidden border-0" style={{ backgroundColor: "#2D3A2D", color: "white" }}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#A8C2B9" }}>
                      SECURE GATEWAY
                    </p>
                    <h2 className="text-2xl font-serif italic">Finalize Payment</h2>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#3d473d" }}>
                    <DurianLogo className="w-6 h-6" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {paymentStatus === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#16a34a" }}>
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                    <p className="mb-4" style={{ color: "#A8C2B9" }}>
                      {paymentMethod === "usdc"
                        ? "Your USDC has been sent"
                        : "Payment verified by Primus zkTLS"}
                    </p>
                    {txHash && (
                      <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: "#3d473d" }}>
                        <p className="text-xs mb-1" style={{ color: "#A8C2B9" }}>Transaction Hash</p>
                        <p className="font-mono text-sm break-all">{txHash}</p>
                      </div>
                    )}
                    {verificationProof && (
                      <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: "#3d473d" }}>
                        <p className="text-xs mb-1" style={{ color: "#A8C2B9" }}>Verification Proof</p>
                        <p className="font-mono text-sm">{verificationProof}</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                      onClick={() => router.push("/directory")}
                    >
                      Back to Directory
                    </Button>
                  </div>
                ) : paymentStatus === "processing" || paymentStatus === "verifying" ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#C5A35E" }} />
                    <h3 className="text-xl font-semibold mb-2">
                      {paymentStatus === "verifying"
                        ? "Verifying Payment..."
                        : "Processing Payment..."}
                    </h3>
                    <p style={{ color: "#A8C2B9" }}>
                      {paymentStatus === "verifying"
                        ? "Primus zkTLS is verifying your payment"
                        : "Please confirm the transaction in your wallet"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#A8C2B9" }}>
                        SELECT SOURCE
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => setPaymentMethod("usdc")}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all`}
                          style={{
                            backgroundColor: paymentMethod === "usdc" ? "#3d473d" : "rgba(61, 71, 61, 0.5)",
                            border: paymentMethod === "usdc" ? "1px solid rgba(168, 194, 185, 0.5)" : "1px solid transparent"
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2D3A2D" }}>
                              <Wallet className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Connected Wallet</p>
                              <p className="text-xs" style={{ color: "#A8C2B9" }}>
                                {embeddedWallet
                                  ? shortenAddress(embeddedWallet.address)
                                  : "Connect wallet to pay"}
                              </p>
                            </div>
                          </div>
                          <div
                            className="w-5 h-5 rounded-full border-2"
                            style={{
                              borderColor: paymentMethod === "usdc" ? "#C5A35E" : "rgba(168, 194, 185, 0.5)",
                              backgroundColor: paymentMethod === "usdc" ? "#C5A35E" : "transparent"
                            }}
                          />
                        </button>

                        <button
                          onClick={() => setPaymentMethod("revolut")}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all`}
                          style={{
                            backgroundColor: paymentMethod === "revolut" ? "#3d473d" : "rgba(61, 71, 61, 0.5)",
                            border: paymentMethod === "revolut" ? "1px solid rgba(168, 194, 185, 0.5)" : "1px solid transparent"
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2D3A2D" }}>
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Revolut Payment</p>
                              <p className="text-xs" style={{ color: "#A8C2B9" }}>
                                Verified by Primus zkTLS
                              </p>
                            </div>
                          </div>
                          <div
                            className="w-5 h-5 rounded-full border-2"
                            style={{
                              borderColor: paymentMethod === "revolut" ? "#C5A35E" : "rgba(168, 194, 185, 0.5)",
                              backgroundColor: paymentMethod === "revolut" ? "#C5A35E" : "transparent"
                            }}
                          />
                        </button>
                      </div>
                    </div>

                    {paymentMethod === "usdc" && (
                      <div className="rounded-xl p-4" style={{ backgroundColor: "#3d473d" }}>
                        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#A8C2B9" }}>
                          OFF-RAMP PATHWAY
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span>USDC (Base)</span>
                          <ArrowRight className="w-4 h-4" style={{ color: "#C5A35E" }} />
                          <span style={{ color: "#C5A35E" }}>Thai Baht (PromptPay)</span>
                          <Badge className="ml-auto text-xs" style={{ backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#4ade80" }}>
                            OPTIMIZED
                          </Badge>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}>
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={
                        paymentMethod === "usdc"
                          ? handleUSDCPayment
                          : handleRevolutPayment
                      }
                      className="w-full h-14 text-lg font-semibold rounded-full"
                      style={{ backgroundColor: "#C5A35E", color: "#1A1C1A" }}
                    >
                      AUTHORIZE PAYMENT
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <div className="flex justify-center gap-4">
                      <Badge variant="outline" style={{ borderColor: "rgba(168, 194, 185, 0.5)", color: "#A8C2B9" }}>
                        VISA
                      </Badge>
                      <Badge variant="outline" style={{ borderColor: "rgba(168, 194, 185, 0.5)", color: "#A8C2B9" }}>
                        USDC
                      </Badge>
                      <Badge variant="outline" style={{ borderColor: "rgba(168, 194, 185, 0.5)", color: "#A8C2B9" }}>
                        PROMPTPAY
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto" style={{ backgroundColor: "rgba(253, 251, 247, 0.8)", backdropFilter: "blur(12px)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm" style={{ color: "#5C6B5C" }}>
            <div className="flex items-center gap-2">
              <DurianLogo className="w-5 h-5" />
              <span className="italic">Durian Pay (Thailand)</span>
            </div>
            <p>© 2024 LICENSED DIGITAL ASSET PROVIDER. KINGDOM OF THAILAND.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-[#1A1C1A]">
                SUPPORT
              </Link>
              <Link href="/legal" className="hover:text-[#1A1C1A]">
                PRIVACY
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom right, #A8C2B9, #FDFBF7)" }}>
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#2D3A2D" }} />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
