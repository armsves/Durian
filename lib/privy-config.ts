import type { PrivyClientConfig } from "@privy-io/react-auth";
import { base, baseSepolia } from "viem/chains";

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "light",
    accentColor: "#567956",
    logo: "/durian-logo.svg",
    showWalletLoginFirst: false,
  },
  loginMethods: ["email", "wallet", "google"],
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },
  defaultChain: baseSepolia,
  supportedChains: [baseSepolia, base],
};

export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532");
export const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET as `0x${string}`;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// ERC20 ABI for USDC transfers
export const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
