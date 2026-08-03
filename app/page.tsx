"use client";

import Link from "next/link";
import { useState } from "react";
import { Wordmark } from "@/components/Brand";
import { TabBar } from "@/components/TabBar";
import { StudyScene, ObjectIcon } from "@/components/RoomArt";

/**
 * Landing page. A first-time visitor — or a MiniPay reviewer — arrives here
 * knowing nothing, so this page has one job: explain what the game is before
 * asking anyone to play it. The app itself lives at /play.
 */

const STEPS = [
  {
    n: "01",
    title: "Search the room",
    body: "Tap anything you can see. Look closer at whatever seems out of place — a drawer that sits proud of its frame, a globe worn at the equator.",
  },
  {
    n: "02",
    title: "Ask whoever is in there",
    body: "You are not always alone. Someone in the room has overheard more than they should have, and will tell you if you ask the right way.",
  },
  {
    n: "03",
    title: "Get out before the clock",
    body: "Eight minutes. Speed, accuracy and how few hints you took decide your score — and, in ranked rooms, your share of the pot.",
  },
];

const THINGS = [
  { id: "desk", label: "Things to search" },
  { id: "safe", label: "Locks to open" },
  { id: "parrot", label: "People to question" },
  { id: "wall-map", label: "Clues to piece together" },
  { id: "letter-tray", label: "Items to carry" },
  { id: "door", label: "One way out" },
];

const FAQ = [
  {
    q: "Do I need to spend anything to play?",
    a: "No. The practice room is free, needs no wallet, and you can replay it as often as you like. Ranked rooms are the only thing that costs money.",
  },
  {
    q: "How is the prize pool split?",
    a: "Everyone who enters a day's room pays the same fixed fee into one shared pool. When the day closes, players are ranked by score and the pool is split between the best escapes. There is no randomness in the split and no house edge beyond a fixed platform fee.",
  },
  {
    q: "Is this gambling?",
    a: "No. The entry fee is fixed and known up front, there is no wager, no odds and no chance element in the payout — your result depends entirely on how well you solve the room. Two players who play identically score identically.",
  },
  {
    q: "Who holds my money?",
    a: "Nobody. Entry fees go straight into a smart contract on Celo, and the contract itself checks that no payout can ever exceed what a day actually collected. We never take custody of player funds.",
  },
  {
    q: "Is every room the same?",
    a: "Everyone plays the same room on the same day, so the leaderboard is fair. A new room arrives every day, and every room is checked by a solver before it opens — an unsolvable room can never go live.",
  },
];

export default function Landing() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main>
      <header className="lp-nav">
        <Wordmark size={20} />
        <Link href="/play" className="btn btn-ghost lp-nav-cta">
          Play
        </Link>
      </header>

      {/* HERO — the scene does the explaining that copy would take a paragraph to do. */}
      <section className="lp-hero">
        <div className="lp-hero-art" aria-hidden="true">
          <StudyScene className="scene" />
          </div>

        <div className="lp-hero-body stack">
          <span className="pill pill-red pill-live">A new room every day</span>
          <h1 className="lp-title">
            You have eight minutes
            <br />
            <span className="hl">to get out.</span>
          </h1>
          <p className="lp-sub">
            An escape room you play on your phone. Search it, question whoever is inside,
            and find the way out before the clock runs down.
          </p>
          <div className="stack-sm">
            <Link href="/play/practice" className="btn btn-primary btn-block">
              Play free practice run
            </Link>
            <a href="#how" className="btn btn-ghost btn-block">
              How it works
            </a>
          </div>
          <p className="faint center">No wallet, no signup, unlimited tries.</p>
        </div>
      </section>

      {/* WHAT'S IN A ROOM */}
      <section className="lp-section">
        <p className="label">What is in a room</p>
        <h2 className="sec-title" style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--space-2)" }}>Everything you need is already in there.</h2>
        <p className="muted">
          No outside knowledge, no trivia, no guessing. Every room is solvable from what
          you can see and who you can talk to.
        </p>
        <ul className="tiles" style={{ marginTop: "var(--space-5)" }}>
          {THINGS.map((t) => (
            <li key={t.id}>
              <div className="tile-art" style={{ display: "grid", placeItems: "center" }}>
                <span className="ink">
                  <ObjectIcon id={t.id} size={44} />
                </span>
              </div>
              <span className="tile-label">{t.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section lp-section-alt" id="how">
        <p className="label">How it works</p>
        <h2 className="sec-title" style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--space-2)" }}>Three things to do.</h2>
        <ol className="lp-steps">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="mono lp-step-n">{s.n}</span>
              <div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* MODES */}
      <section className="lp-section">
        <p className="label">Two ways to play</p>
        <h2 className="sec-title" style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--space-2)" }}>Practice free, or play for the pot.</h2>

        <div className="lp-modes">
          <div className="card stack-sm">
            <div className="row-between" style={{ alignItems: "flex-start" }}>
              <h3>Practice</h3>
              <span className="pill">Free</span>
            </div>
            <p className="muted">
              The same room, no entry fee and no wallet. Replay it as many times as you
              like. Nothing is at stake and nothing is recorded.
            </p>
            <Link href="/play/practice" className="btn btn-block">
              Play now
            </Link>
          </div>

          <div className="card-lit stack-sm">
            <div className="row-between" style={{ alignItems: "flex-start" }}>
              <h3>Ranked</h3>
              <span className="pill pill-red">Daily pot</span>
            </div>
            <p className="muted">
              One attempt. A fixed entry fee in a stablecoin goes into the day&apos;s
              shared pool, and the best escapes split it when the day closes.
            </p>
            <Link href="/play" className="btn btn-primary btn-block">
              Enter today&apos;s room
            </Link>
          </div>
        </div>
      </section>

      {/* FAIR PLAY */}
      <section className="lp-section lp-section-alt">
        <p className="label">Fair play</p>
        <h2 className="sec-title" style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--space-2)" }}>Skill decides it. Not chance.</h2>
        <p className="muted">
          Entry is a fixed, known amount. There is no wager, no odds and no randomness in
          how the pot is divided — two players who solve the room identically score
          identically. Prize money sits in a smart contract on Celo that will not let a
          day pay out more than it took in, and we never hold player funds.
        </p>
        <div className="chip-row" style={{ marginTop: "var(--space-4)" }}>
          {[
            "Fixed entry",
            "No house edge",
            "Non-custodial",
            "Same room for everyone",
            "Solver-checked",
            "Open source",
          ].map((p) => (
            <span key={p} className="pill">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section">
        <p className="label">Questions</p>
        <h2 className="sec-title" style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--space-2)" }}>Before you start.</h2>
        <div className="lp-faq">
          {FAQ.map((f, i) => (
            <div key={f.q}>
              <button
                className="disclosure"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="lp-faq-q">{f.q}</span>
                <span aria-hidden style={{ transform: open === i ? "rotate(45deg)" : "none" }}>
                  +
                </span>
              </button>
              {open === i && <p className="muted lp-faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="lp-close">
        <h2 className="sec-title" style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--space-2)" }}>Today&apos;s room is open.</h2>
        <p className="muted">Eight minutes. See if you get out.</p>
        <Link href="/play/practice" className="btn btn-primary btn-block">
          Play free practice run
        </Link>
      </section>

      <footer className="lp-footer">
        <Wordmark size={16} />
        <nav className="row" style={{ flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/play" className="nav-link">
            Play
          </Link>
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
        <p className="faint center">
          Escape is an independent game. It is not operated by MiniPay or Celo.
        </p>
      </footer>
    </main>
  );
}
