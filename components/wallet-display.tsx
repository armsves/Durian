"use client";

import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Copy, ExternalLink, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, shortenAddress, formatUSDC } from "@/lib/utils";
import { createPublicClient, http, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { USDC_ADDRESS, ERC20_ABI } from "@/lib/privy-config";

interface WalletDisplayProps {
  className?: string;
  showBalance?: boolean;
  compact?: boolean;
}

export function WalletDisplay({
  className,
  showBalance = true,
  compact = false,
}: WalletDisplayProps) {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address || user?.wallet?.address;

  const fetchBalance = async () => {
    if (!walletAddress || !USDC_ADDRESS) return;

    setIsLoading(true);
    try {
      const client = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });

      const balanceRaw = await client.readContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      });

      setBalance(formatUnits(balanceRaw as bigint, 6));
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showBalance && walletAddress) {
      fetchBalance();
    }
  }, [walletAddress, showBalance]);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openExplorer = () => {
    if (walletAddress) {
      window.open(
        `https://sepolia.basescan.org/address/${walletAddress}`,
        "_blank"
      );
    }
  };

  if (!authenticated || !walletAddress) {
    return null;
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 bg-muted px-3 py-2 rounded-xl",
          className
        )}
      >
        <Wallet className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-sm">{shortenAddress(walletAddress)}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
          <Copy className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet
          </CardTitle>
          <Badge variant="sage">Base Sepolia</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2 bg-muted p-3 rounded-xl">
          <span className="font-mono text-sm truncate">
            {shortenAddress(walletAddress, 6)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyAddress}
            >
              {copied ? (
                <span className="text-xs text-green-600">Copied!</span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={openExplorer}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showBalance && (
          <div className="bg-sage-50 dark:bg-sage-900/20 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">USDC Balance</p>
                <p className="text-2xl font-serif font-semibold">
                  {formatUSDC(parseFloat(balance))} <span className="text-base font-normal">USDC</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchBalance}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          Embedded wallet powered by Privy
        </div>
      </CardContent>
    </Card>
  );
}
