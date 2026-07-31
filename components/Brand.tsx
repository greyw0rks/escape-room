/**
 * Brand marks. Hand-authored SVG rather than image files: they stay crisp at
 * any size, recolour from CSS variables, and add nothing to the network budget
 * (MiniPay users are often on 2G).
 */

/** The keyhole with lamplight coming through it. */
export function Mark({ size = 32, className }: { size?: number; className?: string }) {
  const id = "mk";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Escape"
    >
      <defs>
        <radialGradient id={`${id}-lamp`} cx="50%" cy="38%" r="52%">
          <stop offset="0%" stopColor="#ffc677" />
          <stop offset="55%" stopColor="#f0a848" />
          <stop offset="100%" stopColor="#8a5f24" />
        </radialGradient>
        <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f1a2b" />
          <stop offset="100%" stopColor="#0a0810" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill={`url(#${id}-plate)`} />
      <rect
        x="0.75"
        y="0.75"
        width="62.5"
        height="62.5"
        rx="11.25"
        fill="none"
        stroke="#f0a848"
        strokeOpacity="0.34"
      />
      <rect
        x="5.5"
        y="5.5"
        width="53"
        height="53"
        rx="8"
        fill="none"
        stroke="#f2ece2"
        strokeOpacity="0.11"
      />
      <path d="M32 24 L46 55 H18 Z" fill="#f0a848" opacity="0.14" />
      <path
        d="M32 17.5a8 8 0 0 0-4.2 14.8L24.5 46h15l-3.3-13.7A8 8 0 0 0 32 17.5z"
        fill={`url(#${id}-lamp)`}
      />
      <circle cx="32" cy="12" r="1.4" fill="#f2ece2" opacity="0.3" />
      <circle cx="32" cy="52" r="1.4" fill="#f2ece2" opacity="0.3" />
    </svg>
  );
}

/**
 * Name + mark lockup. MiniPay's listing rules require the app's name and logo
 * to be visible and clearly distinct from MiniPay's own branding, so this
 * appears on every top-level screen rather than only on the home page.
 */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="row" style={{ gap: 10 }}>
      <Mark size={size * 1.25} />
      <span
        className="display"
        style={{
          fontSize: size,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        Escape
      </span>
    </span>
  );
}
