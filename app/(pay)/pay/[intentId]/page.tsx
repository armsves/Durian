"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  ArrowLeft,
  Lock,
  Wallet,
  CreditCard,
  CheckCircle2,
  Loader2,
  Shield,
  Copy,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DurianLogo } from "@/components/durian-logo";
import { QRCode } from "@/components/qr-code";
import { formatTHB, formatUSDC, thbToUsdc, shortenAddress, sleep } from "@/lib/utils";
import { mockPrimusVerification, generateVerificationBadge } from "@/lib/primus";
import { USDC_ADDRESS, ERC20_ABI, USDC_DECIMALS } from "@/lib/privy-config";
import { parseUnits, encodeFunctionData } from "viem";

interface PaymentDetails {
  businessId: string;
  businessName: string;
  amountThb: number;
  amountUsdc: number;
  reference: string;
  walletAddress: string;
}

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authenticated, login, user } = usePrivy();
  const { wallets } = useWallets();

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"usdc" | "revolut">("usdc");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "verifying" | "processing" | "success" | "error">("pending");
  const [verificationProof, setVerificationProof] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");

  // Load payment details from URL or fetch from API
  useEffect(() => {
    const businessId = searchParams.get("business") || "1";
    const amount = parseFloat(searchParams.get("amount") || "100");
    const reference = searchParams.get("ref") || `DUR-${Date.now().toString(36).toUpperCase()}`;

    // In production, fetch business details from Supabase
    setPaymentDetails({
      businessId,
      businessName: "Nimman Café & Roasters",
      amountThb: amount,
      amountUsdc: thbToUsdc(amount),
      reference,
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    });
  }, [searchParams]);

  const copyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: embeddedWallet.address,
            to: USDC_ADDRESS,
            data,
          },
        ],
      });

      setTxHash(txHash as string);
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
      // Mock Revolut payment link (in production, generate via Revolut API)
      const revolutLink = `https://revolut.me/pay/${paymentDetails.reference}`;

      // Verify with Primus zkTLS
      const result = await mockPrimusVerification(
        revolutLink,
        paymentDetails.amountThb
      );

      if (result.valid && result.proof) {
        setVerificationProof(result.proof);
        setPaymentStatus("success");
      } else {
        setError("Payment verification failed");
        setPaymentStatus("error");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Verification failed");
      setPaymentStatus("error");
    }
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-durian-gradient">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <DurianLogo className="w-8 h-8" />
              <span className="font-serif text-xl font-semibold">Durian</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                PAYMENT SUMMARY
              </p>
              <h1 className="text-4xl font-serif mb-2">
                Review your{" "}
                <span className="text-gradient italic">acquisition.</span>
              </h1>

              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-sage-700" />
                      </div>
                      <div>
                        <p className="font-medium">Payment to</p>
                        <p className="text-sm text-muted-foreground">
                          {paymentDetails.businessName}
                        </p>
                      </div>
                    </div>
                    <p className="font-serif text-xl">
                      USDC {paymentDetails.amountUsdc.toFixed(2)}
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span>USDC 0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Gas</span>
                      <span>Calculated at sign</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-end">
                    <span className="font-medium">TOTAL DUE</span>
                    <div className="text-right">
                      <p className="font-serif text-2xl font-semibold">
                        USDC {paymentDetails.amountUsdc.toFixed(2)}
                      </p>
                      <p className="text-sm text-primary">
                        = {formatTHB(paymentDetails.amountThb)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 shrink-0 text-sage-600" />
                <div>
                  <p>Funds are settled via regulated Thai digital asset protocols.</p>
                  <p>Your transaction is protected by institutional-grade encryption.</p>
                </div>
              </div>
            </div>

            {/* Payment Gateway */}
            <Card className="bg-sage-900 text-white overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-sage-300 mb-1">
                      SECURE GATEWAY
                    </p>
                    <h2 className="text-2xl font-serif italic">Finalize Payment</h2>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-sage-800 flex items-center justify-center">
                    <DurianLogo className="w-6 h-6 text-sage-400" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {paymentStatus === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                    <p className="text-sage-300 mb-4">
                      {paymentMethod === "usdc"
                        ? "Your USDC has been sent"
                        : "Payment verified by Primus zkTLS"}
                    </p>
                    {txHash && (
                      <div className="bg-sage-800 rounded-lg p-3 mb-4">
                        <p className="text-xs text-sage-400 mb-1">Transaction Hash</p>
                        <p className="font-mono text-sm break-all">{txHash}</p>
                      </div>
                    )}
                    {verificationProof && (
                      <div className="bg-sage-800 rounded-lg p-3 mb-4">
                        <p className="text-xs text-sage-400 mb-1">Verification Proof</p>
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
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gold-400" />
                    <h3 className="text-xl font-semibold mb-2">
                      {paymentStatus === "verifying"
                        ? "Verifying Payment..."
                        : "Processing Payment..."}
                    </h3>
                    <p className="text-sage-300">
                      {paymentStatus === "verifying"
                        ? "Primus zkTLS is verifying your payment"
                        : "Please confirm the transaction in your wallet"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-sage-300 mb-3">
                        SELECT SOURCE
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => setPaymentMethod("usdc")}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                            paymentMethod === "usdc"
                              ? "bg-sage-700 border border-sage-500"
                              : "bg-sage-800 hover:bg-sage-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-sage-600 flex items-center justify-center">
                              <Wallet className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Connected Wallet</p>
                              <p className="text-xs text-sage-400">
                                {embeddedWallet
                                  ? shortenAddress(embeddedWallet.address)
                                  : "Connect wallet to pay"}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 ${
                              paymentMethod === "usdc"
                                ? "border-gold-400 bg-gold-400"
                                : "border-sage-500"
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => setPaymentMethod("revolut")}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                            paymentMethod === "revolut"
                              ? "bg-sage-700 border border-sage-500"
                              : "bg-sage-800 hover:bg-sage-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-sage-600 flex items-center justify-center">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Revolut Payment</p>
                              <p className="text-xs text-sage-400">
                                Verified by Primus zkTLS
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 ${
                              paymentMethod === "revolut"
                                ? "border-gold-400 bg-gold-400"
                                : "border-sage-500"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {paymentMethod === "usdc" && (
                      <div className="bg-sage-800 rounded-xl p-4">
                        <p className="text-xs uppercase tracking-wider text-sage-300 mb-2">
                          OFF-RAMP PATHWAY
                        </p>
                        <div className="flex items-center gap-2">
                          <span>USDC (Polygon)</span>
                          <ArrowRight className="w-4 h-4 text-gold-400" />
                          <span className="text-gold-400">Thai Baht (PromptPay)</span>
                          <Badge className="bg-green-500/20 text-green-400 ml-auto">
                            OPTIMIZED
                          </Badge>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={
                        paymentMethod === "usdc"
                          ? handleUSDCPayment
                          : handleRevolutPayment
                      }
                      className="w-full h-14 text-lg bg-gold-500 hover:bg-gold-600 text-sage-900"
                    >
                      AUTHORIZE PAYMENT
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <div className="flex justify-center gap-4">
                      <Badge variant="outline" className="border-sage-600 text-sage-300">
                        VISA
                      </Badge>
                      <Badge variant="outline" className="border-sage-600 text-sage-300">
                        USDC
                      </Badge>
                      <Badge variant="outline" className="border-sage-600 text-sage-300">
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
      <footer className="border-t bg-background/80 backdrop-blur-xl mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <DurianLogo className="w-5 h-5" />
              <span className="italic">Durian Pay (Thailand)</span>
            </div>
            <p>© 2024 LICENSED DIGITAL ASSET PROVIDER. KINGDOM OF THAILAND.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-foreground">
                SUPPORT
              </Link>
              <Link href="/legal" className="hover:text-foreground">
                PRIVACY
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
