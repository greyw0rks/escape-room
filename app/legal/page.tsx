import Link from "next/link";

export const metadata = { title: "Terms & Privacy — Escape" };

export default function Legal() {
  return (
    <main className="stack pad" style={{ paddingTop: "var(--space-6)" }}>
      <Link href="/" className="nav-link">
        ← Back
      </Link>
      <h1>Terms &amp; Privacy</h1>
      <p className="muted">
        Escape is a skill-based puzzle game. Entry to a ranked room contributes to that
        day&apos;s prize pool, which is shared among the players who escape fastest with
        the fewest mistakes. Outcomes depend on how you solve the room — there is no
        element of chance in how the pool is split.
      </p>
      <p className="muted">
        Practice rooms are always free and never require a stablecoin balance.
      </p>
      <div className="card">
        <p className="faint">
          Full Terms of Service and Privacy Policy are being finalised and will be
          published here before ranked rooms open.
        </p>
      </div>
    </main>
  );
}
