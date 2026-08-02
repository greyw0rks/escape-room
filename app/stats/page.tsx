import Link from "next/link";

export const metadata = { title: "Stats — Escape" };

export default function Stats() {
  return (
    <main className="stack pad page-narrow" style={{ paddingTop: "var(--space-6)" }}>
      <Link href="/" className="nav-link">
        ← Back
      </Link>
      <h1>Stats</h1>
      <p className="muted">
        Open metrics for this app — players, escapes, prize pools paid out, and network
        fees. No sign-in needed.
      </p>
      <div className="card center">
        <p className="muted">Metrics go live with the first ranked room.</p>
      </div>
    </main>
  );
}
