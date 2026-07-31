/**
 * Brand marks. Hand-authored SVG rather than image files: they stay crisp at
 * any size, recolour from CSS variables, and add nothing to the network budget
 * (MiniPay users are often on 2G).
 */

/** A keyhole stamped into paper — the way out, and the game's whole premise. */
export function Mark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Escape"
    >
      <rect x="1" y="1" width="62" height="62" rx="4" fill="#e8e0d0" />
      <rect
        x="4.5"
        y="4.5"
        width="55"
        height="55"
        rx="2"
        fill="none"
        stroke="#1a1a1a"
        strokeOpacity="0.3"
      />
      <path
        d="M32 17.5a8 8 0 0 0-4.2 14.8L24.5 46h15l-3.3-13.7A8 8 0 0 0 32 17.5z"
        fill="#1a1a1a"
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
      <span
        style={{
          fontSize: size,
          fontWeight: 650,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        Escape
      </span>
    </span>
  );
}
