"use client";

import Link from "next/link";
import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { aliasFor } from "@/lib/identity";
import { Wordmark } from "@/components/Brand";
import { StudyScene } from "@/components/RoomArt";

export default function Lobby() {
  const { address, connecting, inMiniPay, connect } = useWallet();
  const [howToOpen, setHowToOpen] = useState(false);

  return (
    <main className="stack-lg pad" style={{ paddingBottom: "var(--space-7)" }}>
      <header className="row-between rise" style={{ "--i": 0 } as React.CSSProperties}>
        <Wordmark />
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
        {/* The art carries the mood; the copy stays short because of it. */}
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
          <div className="row-between">
            <div>
              <p className="label">Room 001 · Today</p>
              <h2 style={{ marginTop: 4 }}>The Cartographer&apos;s Study</h2>
            </div>
            <span className="pill pill-cyan mono">8:00</span>
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

      <section className="stack-sm rise" style={{ "--i": 3 } as React.CSSProperties}>
        <button
          className="disclosure"
          onClick={() => setHowToOpen((v) => !v)}
          aria-expanded={howToOpen}
        >
          <span>How it works</span>
          <span aria-hidden style={{ transform: howToOpen ? "rotate(45deg)" : "none" }}>
            +
          </span>
        </button>
        {howToOpen && (
          <ol className="steps">
            <li>
              <span className="mono step-n">01</span>
              <span>
                <b>Search.</b> Tap anything in the room. Look closer at whatever seems out
                of place.
              </span>
            </li>
            <li>
              <span className="mono step-n">02</span>
              <span>
                <b>Ask.</b> Somebody in the room knows more than they are letting on.
              </span>
            </li>
            <li>
              <span className="mono step-n">03</span>
              <span>
                <b>Escape.</b> Speed, accuracy and how few hints you took decide your
                score.
              </span>
            </li>
          </ol>
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
