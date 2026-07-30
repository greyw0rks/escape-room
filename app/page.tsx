"use client";

import Link from "next/link";
import { useWallet } from "@/lib/wallet";
import { aliasFor } from "@/lib/identity";

export default function Lobby() {
  const { address, connecting, inMiniPay, connect } = useWallet();

  return (
    <main className="stack-lg pad" style={{ paddingTop: "var(--space-6)" }}>
      <header className="stack-sm">
        <div className="row-between">
          <span className="pill pill-amber">Room 001</span>
          {address ? (
            <span className="faint">{aliasFor(address)}</span>
          ) : inMiniPay ? (
            <span className="faint">Signing you in…</span>
          ) : null}
        </div>
        <h1>Today&apos;s room is open.</h1>
        <p className="muted">
          A new room is built every day. Search it, question whoever is inside, and get
          out before the clock runs down.
        </p>
      </header>

      <section className="card-lit stack">
        <div className="row-between">
          <div>
            <h3>The Cartographer&apos;s Study</h3>
            <p className="faint">Everyone plays the same room today.</p>
          </div>
          <span className="pill pill-cyan">8 min</span>
        </div>

        <Link href="/play/practice" className="btn btn-primary btn-block">
          Play free practice run
        </Link>
        <p className="faint center">No stablecoin needed. Unlimited tries.</p>
      </section>

      <section className="stack">
        <h3>Play for the daily prize</h3>
        <p className="muted">
          Entry goes into today&apos;s prize pool. The fastest, cleanest escapes split it
          when the day closes.
        </p>

        {!address && !inMiniPay && (
          <button className="btn btn-block" onClick={connect} disabled={connecting}>
            {connecting ? "Opening wallet…" : "Sign in to play ranked"}
          </button>
        )}

        {address && (
          <Link href="/play/ranked" className="btn btn-block">
            Enter today&apos;s room
          </Link>
        )}
      </section>

      <nav className="row-between" style={{ marginTop: "auto" }}>
        <Link href="/leaderboard" className="nav-link">
          Leaderboard
        </Link>
        <Link href="/stats" className="nav-link">
          Stats
        </Link>
        <Link href="/legal" className="nav-link">
          Terms
        </Link>
      </nav>
    </main>
  );
}
