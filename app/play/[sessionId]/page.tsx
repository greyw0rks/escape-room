import Link from "next/link";

export default async function Play({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const mode = sessionId === "practice" ? "Practice" : "Ranked";

  return (
    <main className="stack pad" style={{ paddingTop: "var(--space-6)" }}>
      <Link href="/" className="faint">
        ← Leave room
      </Link>
      <span className="pill pill-amber">{mode}</span>
      <h1>The Cartographer&apos;s Study</h1>
      <div className="card">
        <p className="muted">The room is still being built.</p>
      </div>
    </main>
  );
}
