"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";
import { aliasFor } from "@/lib/identity";
import { StudyScene, ObjectIcon } from "@/components/RoomArt";
import { TabBar } from "@/components/TabBar";

/**
 * Today feed — the app proper. Built to heal-grow-ui-spec.md screen 2:
 * day label, banner card, section header + muted subhead, 2-column tile grid,
 * bottom tabs. The landing page at `/` is the pitch; this is where a player
 * who already knows the game chooses how to play it.
 */

const WHATS_INSIDE = [
  { id: "desk", label: "Things to search" },
  { id: "safe", label: "Locks to open" },
  { id: "parrot", label: "People to question" },
  { id: "door", label: "One way out" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Play() {
  const { address, connecting, inMiniPay, connect } = useWallet();
  // Resolved after mount: rendering a date on the server and again on the
  // client can disagree across a midnight boundary and trip hydration.
  const [today, setToday] = useState("Today");
  useEffect(() => setToday(DAYS[new Date().getDay()]), []);

  return (
    <>
      <main
        className="stack-lg"
        style={{ padding: "var(--space-5) var(--space-5) var(--space-6)" }}
      >
        <header className="row-between rise" style={{ "--i": 0 } as React.CSSProperties}>
          <h1 style={{ fontSize: "var(--fs-xl)" }}>{today}</h1>
          {address ? (
            <span className="pill">{aliasFor(address)}</span>
          ) : inMiniPay ? (
            <span className="faint">Signing you in…</span>
          ) : null}
        </header>

        <Link
          href="/play/practice"
          className="banner rise"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          <span className="grow">
            <span className="banner-title" style={{ display: "block" }}>
              Try today&apos;s room free
            </span>
            <span className="banner-sub" style={{ display: "block" }}>
              No wallet, unlimited tries. Nothing at stake.
            </span>
          </span>
          <span className="banner-arrow" aria-hidden>
            →
          </span>
        </Link>

        <section className="rise" style={{ "--i": 2 } as React.CSSProperties}>
          <h2 className="sec-title">Today&apos;s room</h2>
          <p className="sec-sub">Everyone plays the same room. It closes at midnight.</p>

          <div className="hero-panel" style={{ marginTop: "var(--space-4)" }}>
            <StudyScene />
            <div className="hero-overlay">
              <h2>The Cartographer&apos;s Study</h2>
              <p>She left in a hurry and locked the way out behind her.</p>
              {address ? (
                <Link href="/play/ranked" className="btn btn-primary btn-block">
                  Enter today&apos;s room
                </Link>
              ) : inMiniPay ? (
                <button className="btn btn-primary btn-block" disabled>
                  Signing you in…
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-block"
                  onClick={connect}
                  disabled={connecting}
                >
                  {connecting ? "Opening wallet…" : "Sign in to play ranked"}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rise" style={{ "--i": 3 } as React.CSSProperties}>
          <h2 className="sec-title">What is inside</h2>
          <p className="sec-sub">Everything you need is already in the room.</p>
          <ul className="tiles" style={{ marginTop: "var(--space-4)" }}>
            {WHATS_INSIDE.map((t) => (
              <li key={t.id}>
                <div className="tile-art" style={{ display: "grid", placeItems: "center" }}>
                  <span style={{ color: "#1a1a1a", display: "flex" }}>
                    <ObjectIcon id={t.id} size={44} />
                  </span>
                </div>
                <span className="tile-label">{t.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rise" style={{ "--i": 4 } as React.CSSProperties}>
          <h2 className="sec-title">Resources</h2>
          <Link href="/#how" className="resource">
            <span className="resource-icon" aria-hidden>
              ?
            </span>
            <span>
              <span className="tag" style={{ display: "block" }}>
                Guide
              </span>
              <span className="resource-title" style={{ display: "block" }}>
                How the daily prize pool works
              </span>
            </span>
          </Link>
          <Link href="/legal" className="resource" style={{ borderBottom: 0 }}>
            <span className="resource-icon" aria-hidden>
              §
            </span>
            <span>
              <span className="tag" style={{ display: "block" }}>
                Legal
              </span>
              <span className="resource-title" style={{ display: "block" }}>
                Terms and privacy
              </span>
            </span>
          </Link>
        </section>
      </main>

      <TabBar active="today" />
    </>
  );
}
