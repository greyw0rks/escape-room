// Shared chain + contract constants used by both client and server.
import { defineChain } from "viem";
import { celo as viemCelo, celoSepolia as viemCeloSepolia } from "viem/chains";

// DailyRoomPool — one contract, multi-token. The `token` address is passed
// explicitly on entry and included in the EIP-712 claim signature so a claim
// signed for one stablecoin cannot be replayed against another.
const DEPLOYED_POOL: Record<"mainnet" | "testnet", `0x${string}`> = {
  // Not deployed to mainnet yet — Phase 7, and it moves real money.
  mainnet: "0x0000000000000000000000000000000000000000",
  testnet: "0x92ca22515502d7e1360f57244fa86ebebcaede9c",
};

export const CELO_NETWORK_NAME = (process.env.NEXT_PUBLIC_CELO_NETWORK ?? "testnet") as
  | "mainnet"
  | "testnet";

export const POOL_ADDRESS = (process.env.NEXT_PUBLIC_POOL_ADDRESS ??
  DEPLOYED_POOL[CELO_NETWORK_NAME]) as `0x${string}`;

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
  feeCurrencyAddress: `0x${string}`; // CIP-64
}

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

// Celo Sepolia. Each address below was read back on-chain (symbol + decimals)
// rather than trusted from a doc table — the skill's reference lists
// 0xEF4d55…, but that contract reports "cUSD"/"Celo Dollar". The real USDm is
// 0xdE9e4C…, and both are separately registered in the FeeCurrencyDirectory.
const TESTNET = {
  usdm: "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b", // Mento Dollar, 18 dec
  usdc: "0x01C5C0122039549AD1493B8220cABEdD739BC44E", // 6 dec
  usdt: "0xd077A400968890Eacc75cdc901F0356c943e4fDb", // 6 dec
} as const;

// Sepolia fee adapters, resolved via FeeCurrencyDirectory.getCurrencies() and
// confirmed by calling adaptedToken() on each.
const TESTNET_FEE_CURRENCY: Record<CeloToken, `0x${string}`> = {
  usdm: "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
  usdc: "0xbf1441Ea57f43f35f713431001f35742c88071c7",
  usdt: "0xe19447B12cb0d0220B2a501D8382be2f61CcF92a",
};

function envAddr(name: string, fallback: string): `0x${string}` {
  return (process.env[name] ?? fallback) as `0x${string}`;
}

const isMainnet = CELO_NETWORK_NAME === "mainnet";
const TOKENS = isMainnet ? MAINNET : TESTNET;
const FEE_CURRENCY = isMainnet ? MAINNET_FEE_CURRENCY : TESTNET_FEE_CURRENCY;

export const CELO_TOKENS: Record<CeloToken, CeloTokenMeta> = {
  usdm: {
    id: "usdm",
    label: "USDm",
    decimals: 18,
    tokenAddress: envAddr("NEXT_PUBLIC_TOKEN_ADDRESS_USDM", TOKENS.usdm),
    feeCurrencyAddress: FEE_CURRENCY.usdm,
  },
  usdc: {
    id: "usdc",
    label: "USDC",
    decimals: 6,
    tokenAddress: envAddr("NEXT_PUBLIC_TOKEN_ADDRESS_USDC", TOKENS.usdc),
    feeCurrencyAddress: FEE_CURRENCY.usdc,
  },
  usdt: {
    id: "usdt",
    label: "USDT",
    decimals: 6,
    tokenAddress: envAddr("NEXT_PUBLIC_TOKEN_ADDRESS_USDT", TOKENS.usdt),
    feeCurrencyAddress: FEE_CURRENCY.usdt,
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
