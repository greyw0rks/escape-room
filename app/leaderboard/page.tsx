import Link from "next/link";

export default function Leaderboard() {
  return (
    <main className="stack pad" style={{ paddingTop: "var(--space-6)" }}>
      <Link href="/" className="faint">
        ← Back
      </Link>
      <h1>Today&apos;s leaderboard</h1>
      <p className="muted">
        Rankings open once the first players escape. The board resets when the day closes.
      </p>
      <div className="card center">
        <p className="muted">No escapes yet today.</p>
        <p className="faint">Be the first out.</p>
      </div>
    </main>
  );
}
