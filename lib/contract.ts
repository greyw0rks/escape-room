// Shared chain + contract constants used by both client and server.
import { defineChain } from "viem";
import { celo as viemCelo, celoSepolia as viemCeloSepolia } from "viem/chains";

// DailyRoomPool — one contract, multi-token. The `token` address is passed
// explicitly on entry and included in the EIP-712 claim signature so a claim
// signed for one stablecoin cannot be replayed against another.
export const POOL_ADDRESS = (process.env.NEXT_PUBLIC_POOL_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const CELO_NETWORK_NAME = (process.env.NEXT_PUBLIC_CELO_NETWORK ?? "testnet") as
  | "mainnet"
  | "testnet";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ??
  (CELO_NETWORK_NAME === "mainnet"
    ? "https://forno.celo.org"
    : "https://forno.celo-sepolia.celo-testnet.org/");

// Chain IDs: mainnet = 42220, Celo Sepolia = 11142220.
const baseCeloChain = CELO_NETWORK_NAME === "mainnet" ? viemCelo : viemCeloSepolia;
export const celoChain = defineChain({
  ...baseCeloChain,
  rpcUrls: { default: { http: [RPC_URL] } },
});

export type CeloToken = "usdm" | "usdc" | "usdt";

export interface CeloTokenMeta {
  id: CeloToken;
  label: string;
  decimals: number;
  tokenAddress: `0x${string}`;
  feeCurrencyAddress: `0x${string}` | null; // CIP-64; null on testnet (adapters not deployed)
}

const ZERO = "0x0000000000000000000000000000000000000000" as `0x${string}`;

// Canonical Celo mainnet addresses. Source: celopedia-skill references/contracts.md
const MAINNET = {
  usdm: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // Mento Dollar (cUSD), 18 dec
  usdc: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", // 6 dec
  usdt: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", // 6 dec
} as const;

// CIP-64 feeCurrency. USDC/USDT need the adapter — the raw token address is not
// valid as feeCurrency. USDm's token address IS its feeCurrency.
const MAINNET_FEE_CURRENCY: Record<CeloToken, `0x${string}`> = {
  usdm: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  usdc: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
  usdt: "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72",
};

function envAddr(name: string, fallback: string): `0x${string}` {
  return (process.env[name] ?? fallback) as `0x${string}`;
}

const isMainnet = CELO_NETWORK_NAME === "mainnet";

export const CELO_TOKENS: Record<CeloToken, CeloTokenMeta> = {
  usdm: {
    id: "usdm",
    label: "USDm",
    decimals: 18,
    tokenAddress: envAddr(
      "NEXT_PUBLIC_TOKEN_ADDRESS_USDM",
      isMainnet ? MAINNET.usdm : ZERO
    ),
    feeCurrencyAddress: isMainnet ? MAINNET_FEE_CURRENCY.usdm : null,
  },
  usdc: {
    id: "usdc",
    label: "USDC",
    decimals: 6,
    tokenAddress: envAddr(
      "NEXT_PUBLIC_TOKEN_ADDRESS_USDC",
      isMainnet ? MAINNET.usdc : ZERO
    ),
    feeCurrencyAddress: isMainnet ? MAINNET_FEE_CURRENCY.usdc : null,
  },
  usdt: {
    id: "usdt",
    label: "USDT",
    decimals: 6,
    tokenAddress: envAddr(
      "NEXT_PUBLIC_TOKEN_ADDRESS_USDT",
      isMainnet ? MAINNET.usdt : ZERO
    ),
    feeCurrencyAddress: isMainnet ? MAINNET_FEE_CURRENCY.usdt : null,
  },
};

export const DEFAULT_TOKEN: CeloToken = "usdm";

export function celoTokenMeta(t: CeloToken | undefined): CeloTokenMeta {
  return (t && CELO_TOKENS[t]) || CELO_TOKENS[DEFAULT_TOKEN];
}

/** UTC day number — the shared identifier for a daily room and its prize pool. */
export function currentDayId(now: number = Date.now()): number {
  return Math.floor(now / 86_400_000);
}
