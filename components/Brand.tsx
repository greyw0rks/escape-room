/**
 * Brand marks. Hand-authored SVG rather than image files: they stay crisp at
 * any size, recolour from CSS variables, and add nothing to the network budget
 * (MiniPay users are often on 2G).
 */

/** A keyhole punched into a plate — the way out, and the game's whole premise.
 *  Drawn on a 16x16 grid inside a 64x64 viewBox so it stays on the pixel grid
 *  at any multiple-of-16 size, matching the object icons. */
export function Mark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label="Escape"
    >
      <rect x="0" y="0" width="64" height="64" fill="var(--accent, #ffd83d)" />
      <path
        d="M0 0h64v4H0zM0 60h64v4H0zM0 0h4v64H0zM60 0h4v64h-4z"
        fill="var(--line, #111)"
      />
      {/* keyhole: round bow over a tapered stem */}
      <path
        d="M24 16h16v4H24zM20 20h24v4H20zM20 24h24v4H20zM20 28h24v4H20zM24 32h16v4H24z
           M28 36h8v4h-8zM24 40h16v4H24zM20 44h24v4H20z"
        fill="var(--line, #111)"
      />
    </svg>
  );
}

/**
 * Name + mark lockup. MiniPay's listing rules require the app's name and logo
 * to be visible and clearly distinct from MiniPay's own branding, so this
 * appears on every top-level screen rather than only on the home page.
 */
export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <span className="row" style={{ gap: 9 }}>
      <Mark size={size * 1.2} />
      {/* The bitmap face carries its own weight and spacing; forcing 650 and
          0.2em tracking on top of it only smears the glyph grid. */}
      <span className="display" style={{ fontSize: size, lineHeight: 1 }}>
        Escape
      </span>
    </span>
  );
}
