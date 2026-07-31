"use client";

import Link from "next/link";
import { useWallet } from "@/lib/wallet";
import { aliasFor } from "@/lib/identity";
import { Wordmark } from "@/components/Brand";
import { StudyScene } from "@/components/RoomArt";

/**
 * Room picker — the app proper. The landing page at `/` is the pitch; this is
 * where a player who already knows what the game is chooses how to play it.
 */
export default function Play() {
  const { address, connecting, inMiniPay, connect } = useWallet();

  return (
    <main className="stack-lg pad" style={{ paddingBottom: "var(--space-7)" }}>
      <header className="row-between rise" style={{ "--i": 0 } as React.CSSProperties}>
        <Link
          href="/"
          aria-label="Escape home"
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "inline-flex",
            alignItems: "center",
            minHeight: "var(--tap)",
          }}
        >
          <Wordmark />
        </Link>
        {address ? (
          <span className="pill">{aliasFor(address)}</span>
        ) : inMiniPay ? (
          <span className="faint">Signing you in…</span>
        ) : null}
      </header>

      <section
        className="card-lit stack rise"
        style={{ "--i": 1, padding: 0, overflow: "hidden" } as React.CSSProperties}
      >
        <div style={{ position: "relative", height: 150 }}>
          <StudyScene className="scene" />
          <div className="scene-fade" />
          <span
            className="pill pill-amber pill-live"
            style={{ position: "absolute", top: 12, left: 12 }}
          >
            Open now
          </span>
        </div>

        <div className="stack" style={{ padding: "var(--space-5)", paddingTop: 0 }}>
          <div className="row-between" style={{ alignItems: "flex-start" }}>
            <div>
              <p className="label">Room 001 · Today</p>
              <h2 style={{ marginTop: 4 }}>The Cartographer&apos;s Study</h2>
            </div>
            <span className="pill pill-cyan mono" style={{ marginTop: 4 }}>
              8:00
            </span>
          </div>

          <p className="muted">
            She left in a hurry and locked the way out behind her. Everything you need is
            still in the room.
          </p>

          <Link href="/play/practice" className="btn btn-primary btn-block">
            Play free practice run
          </Link>
          <p className="faint center">No wallet needed. Unlimited tries.</p>
        </div>
      </section>

      <section className="stack rise" style={{ "--i": 2 } as React.CSSProperties}>
        <div className="row-between" style={{ alignItems: "flex-start" }}>
          <h3>Play for the daily prize</h3>
          <span className="pill pill-amber" style={{ marginTop: 4 }}>
            Ranked
          </span>
        </div>
        <p className="muted">
          Everyone plays the same room. Entry goes into today&apos;s pool, and the fastest,
          cleanest escapes split it when the day closes.
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

      <hr className="rule" />

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
