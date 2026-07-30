"use client";

import { toDataSuffix, codeFromHostname } from "@celo/attribution-tags";
import type { Hex } from "viem";

/**
 * MiniPay injects `window.ethereum.isMiniPay`. Inside MiniPay we must not pass a
 * custom feeCurrency (it manages fees itself) and must send legacy (type 0)
 * transactions — it ignores EIP-1559 fee fields and rejects type-2.
 */
export function isMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  return (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true;
}

// Derived from the hostname, so it must never be computed at module top level —
// that also runs during SSR, where `window` is undefined.
let cachedSuffix: Hex | null = null;

/** ERC-8021 attribution suffix so Celo can credit on-chain volume to this app. */
export function attributionSuffix(): Hex | undefined {
  if (typeof window === "undefined") return undefined;
  if (cachedSuffix) return cachedSuffix;
  try {
    cachedSuffix = toDataSuffix(codeFromHostname(window.location.hostname)) as Hex;
    return cachedSuffix;
  } catch {
    return undefined;
  }
}

/** Send the user to MiniPay's top-up screen instead of showing a balance error. */
export const ADD_CASH_DEEPLINK = "https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT";
