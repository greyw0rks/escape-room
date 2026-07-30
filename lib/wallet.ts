"use client";

import { useCallback, useEffect, useState } from "react";
import { createWalletClient, createPublicClient, custom, http, type WalletClient } from "viem";
import { celoChain } from "./contract";
import { isMiniPay } from "./minipay";

export interface WalletState {
  address: `0x${string}` | null;
  connecting: boolean;
  /** True inside the MiniPay browser — the UI must not render a connect button. */
  inMiniPay: boolean;
  /** Null until a wallet is present. */
  walletClient: WalletClient | null;
  connect: () => Promise<void>;
}

function injected(): { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: never }).ethereum ?? null;
}

/** Read-only client. Always available — used for balances and pool state before connect. */
export function publicClient() {
  return createPublicClient({ chain: celoChain, transport: http() });
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [inMiniPay, setInMiniPay] = useState(false);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  const attach = useCallback((accounts: string[]) => {
    const eth = injected();
    if (!eth || accounts.length === 0) {
      setAddress(null);
      setWalletClient(null);
      return;
    }
    const account = accounts[0] as `0x${string}`;
    setAddress(account);
    setWalletClient(
      createWalletClient({ account, chain: celoChain, transport: custom(eth) })
    );
  }, []);

  const connect = useCallback(async () => {
    const eth = injected();
    if (!eth) return;
    setConnecting(true);
    try {
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      attach(accounts);
    } finally {
      setConnecting(false);
    }
  }, [attach]);

  useEffect(() => {
    const eth = injected();
    if (!eth) return;

    const mini = isMiniPay();
    setInMiniPay(mini);

    // Zero-click connect is mandatory inside MiniPay — never make the user tap
    // a connect button there. Outside MiniPay we only adopt an already-authorised
    // account, so a plain browser visit never triggers a wallet popup.
    void (async () => {
      setConnecting(true);
      try {
        const method = mini ? "eth_requestAccounts" : "eth_accounts";
        attach((await eth.request({ method })) as string[]);
      } catch {
        attach([]);
      } finally {
        setConnecting(false);
      }
    })();

    const onAccountsChanged = (accounts: unknown) => attach(accounts as string[]);
    const ethEvents = eth as unknown as {
      on?: (e: string, h: (a: unknown) => void) => void;
      removeListener?: (e: string, h: (a: unknown) => void) => void;
    };
    ethEvents.on?.("accountsChanged", onAccountsChanged);
    return () => ethEvents.removeListener?.("accountsChanged", onAccountsChanged);
  }, [attach]);

  return { address, connecting, inMiniPay, walletClient, connect };
}
