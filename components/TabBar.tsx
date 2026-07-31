import Link from "next/link";

/**
 * Bottom navigation: three text-only tabs, no icons, no indicator bar — the
 * spec is explicit about all three. The active label simply takes the primary
 * text colour.
 */
export function TabBar({ active }: { active: "home" | "today" | "you" }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <Link href="/" className={active === "home" ? "active" : undefined}>
        Home
      </Link>
      <Link href="/play" className={active === "today" ? "active" : undefined}>
        Today
      </Link>
      <Link href="/stats" className={active === "you" ? "active" : undefined}>
        You
      </Link>
    </nav>
  );
}
