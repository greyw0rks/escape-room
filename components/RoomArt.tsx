/**
 * Room art — hand-authored SVG in an engraved / etched style, as if plates
 * from an old cartography manual.
 *
 * Why SVG and not generated raster art: it recolours from the design tokens,
 * stays sharp on any DPR, and costs a few KB inside the JS bundle instead of
 * a network fetch. MiniPay users are frequently on 2G, and the client bundle
 * is capped at 2 MB.
 *
 * Everything is drawn from the same primitives — thin amber strokes on ink,
 * hatching for shadow, one warm light source top-left — so the set reads as
 * one hand rather than seven clip-art pieces.
 */

const AMBER = "#f0a848";
const BRIGHT = "#ffc677";
const DIM = "#8a5f24";
const COLD = "#5ec8d8";

/** Wide establishing shot: the study, lit by one lamp. */
export function StudyScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 150"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A cartographer's study, lit by a single desk lamp"
    >
      <defs>
        <radialGradient id="sc-lamp" cx="27%" cy="34%" r="46%">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.42" />
          <stop offset="55%" stopColor={AMBER} stopOpacity="0.12" />
          <stop offset="100%" stopColor={AMBER} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sc-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f1a2b" />
          <stop offset="100%" stopColor="#0a0810" />
        </linearGradient>
        {/* Hatching, the way an engraver would shade a plate. */}
        <pattern id="sc-hatch" width="6" height="6" patternUnits="userSpaceOnUse"
                 patternTransform="rotate(38)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={AMBER} strokeOpacity="0.16" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="320" height="150" fill="url(#sc-floor)" />

      {/* Back wall panelling — vertical lines, fading to the right where the
          lamp doesn't reach. */}
      <g stroke={AMBER} strokeOpacity="0.09">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={14 + i * 29} y1="0" x2={14 + i * 29} y2="104" />
        ))}
      </g>
      <line x1="0" y1="104" x2="320" y2="104" stroke={AMBER} strokeOpacity="0.2" />

      {/* The lamp's pool of light. */}
      <rect width="320" height="150" fill="url(#sc-lamp)" />

      {/* Wall map, left — a coastline and a rhumb-line rose. */}
      <g transform="translate(20 20)">
        <rect width="74" height="52" fill="none" stroke={AMBER} strokeOpacity="0.4" />
        <rect x="3" y="3" width="68" height="46" fill="url(#sc-hatch)" opacity="0.5" />
        <path d="M8 40 C18 30 24 34 30 26 C36 18 46 22 52 15 C58 9 64 12 68 8"
              fill="none" stroke={BRIGHT} strokeOpacity="0.55" strokeWidth="1.1" />
        <circle cx="50" cy="36" r="7" fill="none" stroke={AMBER} strokeOpacity="0.45" />
        <path d="M50 27 L50 45 M41 36 L59 36 M44 30 L56 42 M56 30 L44 42"
              stroke={AMBER} strokeOpacity="0.35" strokeWidth="0.6" />
      </g>

      {/* Desk with lamp, centre. */}
      <g transform="translate(112 52)">
        {/* lamp: shade + the light it throws */}
        <path d="M34 2 L54 2 L60 16 L28 16 Z" fill={AMBER} fillOpacity="0.22"
              stroke={BRIGHT} strokeOpacity="0.6" />
        <line x1="44" y1="16" x2="44" y2="40" stroke={AMBER} strokeOpacity="0.5" />
        <path d="M28 16 L14 52 L74 52 L60 16 Z" fill={BRIGHT} fillOpacity="0.09" />
        {/* desktop */}
        <rect x="0" y="40" width="96" height="5" fill={AMBER} fillOpacity="0.3"
              stroke={AMBER} strokeOpacity="0.5" />
        <rect x="6" y="45" width="84" height="7" fill="none" stroke={AMBER} strokeOpacity="0.28" />
        <line x1="48" y1="45" x2="48" y2="52" stroke={AMBER} strokeOpacity="0.28" />
        {/* legs */}
        <line x1="10" y1="52" x2="10" y2="76" stroke={AMBER} strokeOpacity="0.35" />
        <line x1="86" y1="52" x2="86" y2="76" stroke={AMBER} strokeOpacity="0.35" />
        {/* papers */}
        <path d="M56 36 L82 36 L80 40 L54 40 Z" fill={BRIGHT} fillOpacity="0.3" />
      </g>

      {/* Globe on its stand, right. */}
      <g transform="translate(240 46)">
        <circle cx="22" cy="22" r="20" fill="none" stroke={AMBER} strokeOpacity="0.42" />
        <ellipse cx="22" cy="22" rx="8" ry="20" fill="none" stroke={AMBER} strokeOpacity="0.22" />
        <line x1="2" y1="22" x2="42" y2="22" stroke={AMBER} strokeOpacity="0.22" />
        <path d="M8 13 C14 16 22 12 30 15 C34 16 38 14 40 13"
              fill="none" stroke={BRIGHT} strokeOpacity="0.4" strokeWidth="0.9" />
        <path d="M6 30 C13 27 20 32 27 29 C32 27 36 30 39 29"
              fill="none" stroke={BRIGHT} strokeOpacity="0.4" strokeWidth="0.9" />
        <path d="M22 43 L22 52 M10 56 L34 56 L30 52 L14 52 Z"
              fill="none" stroke={AMBER} strokeOpacity="0.4" />
      </g>

      {/* The door — far right, cold, and shut. It is the only cold thing in
          the frame, which is the point. */}
      <g transform="translate(292 14)">
        <rect width="26" height="90" fill="none" stroke={COLD} strokeOpacity="0.36" />
        <rect x="4" y="5" width="18" height="34" fill="none" stroke={COLD} strokeOpacity="0.2" />
        <rect x="4" y="45" width="18" height="34" fill="none" stroke={COLD} strokeOpacity="0.2" />
        <circle cx="8" cy="52" r="2" fill={COLD} fillOpacity="0.55" />
      </g>

      {/* Floorboards, converging slightly for depth. */}
      <g stroke={AMBER} strokeOpacity="0.1">
        <line x1="0" y1="118" x2="320" y2="118" />
        <line x1="0" y1="134" x2="320" y2="134" />
        <line x1="86" y1="104" x2="66" y2="150" />
        <line x1="196" y1="104" x2="216" y2="150" />
      </g>
    </svg>
  );
}

/* ── Object plates ─────────────────────────────────────────────────────────
   Each is drawn on a 40x40 grid with a 1.4 stroke so they sit together
   optically. `currentColor` lets a chip tint its own icon on press. */

type IconProps = { size?: number; className?: string };
const box = (p: IconProps) => ({
  width: p.size ?? 22,
  height: p.size ?? 22,
  viewBox: "0 0 40 40",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: p.className,
  "aria-hidden": true,
});

export function DeskIcon(p: IconProps) {
  return (
    <svg {...box(p)}>
      <path d="M4 16h32v4H4z" />
      <path d="M7 20v14M33 20v14" />
      <path d="M10 20h12v8H10z" />
      <path d="M16 24h.01" />
      <path d="M24 10h8l3 6H21z" opacity="0.75" />
    </svg>
  );
}

export function DrawerIcon(p: IconProps) {
  return (
    <svg {...box(p)}>
      <rect x="6" y="10" width="28" height="20" rx="1" />
      <path d="M6 20h28" />
      <path d="M17 15h6M17 25h6" />
    </svg>
  );
}

export function LetterTrayIcon(p: IconProps) {
  return (
    <svg {...box(p)}>
      <path d="M5 22l4-10h22l4 10v6H5z" />
      <path d="M5 22h9l2 3h8l2-3h9" />
      <path d="M13 17h14" opacity="0.7" />
    </svg>
  );
}

export function GlobeIcon(p: IconProps) {
  return (
    <svg {...box(p)}>
      <circle cx="20" cy="17" r="11" />
      <ellipse cx="20" cy="17" rx="4.5" ry="11" />
      <path d="M9 17h22" />
      <path d="M20 28v5M13 36h14l-2.5-3h-9z" />
    </svg>
  );
}

export function WallMapIcon(p: IconProps) {
  return (
    <svg {...box(p)}>
      <rect x="5" y="7" width="30" height="26" />
      <path d="M9 27c4-4 6-2 9-6s7-2 9-6" opacity="0.85" />
      <circle cx="26" cy="24" r="3.5" opacity="0.7" />
      <path d="M26 20.5v7M22.5 24h7" opacity="0.7" />
    </svg>
  );
}

export function SafeIcon(p: IconProps) {
  return (
    <svg {...box(p)}>
      <rect x="6" y="8" width="28" height="24" rx="1.5" />
      <rect x="10" y="12" width="20" height="16" rx="1" opacity="0.6" />
      <circle cx="20" cy="20" r="4" />
      <path d="M20 16v-2M20 26v-2M16 20h-2M26 20h-2" />
    </svg>
  );
}

export function DoorIcon(p: IconProps) {
  return (
    <svg {...box(p)}>
      <rect x="10" y="5" width="20" height="30" />
      <rect x="14" y="9" width="12" height="9" opacity="0.6" />
      <circle cx="14" cy="24" r="1.6" />
      <path d="M12.4 27.5h3.2" opacity="0.7" />
    </svg>
  );
}

export function ParrotIcon(p: IconProps) {
  return (
    <svg {...box(p)}>
      <path d="M22 8a7 7 0 0 1 4 12.5c0 5-2 8-6 10" />
      <path d="M22 12.5h.01" />
      <path d="M15.5 13c-2 .5-3.5 2-3.5 4l3.5-1" />
      <path d="M20 30.5c-3 0-5 1-6 3h14" opacity="0.75" />
      <path d="M11 25h6" opacity="0.6" />
    </svg>
  );
}

/** Chosen by object id, so the room data drives the art. */
const BY_ID: Record<string, (p: IconProps) => React.ReactElement> = {
  desk: DeskIcon,
  drawer: DrawerIcon,
  "open-drawer": DrawerIcon,
  "letter-tray": LetterTrayIcon,
  globe: GlobeIcon,
  "wall-map": WallMapIcon,
  safe: SafeIcon,
  door: DoorIcon,
  parrot: ParrotIcon,
};

/** Falls back to a plain plate so an AI-generated room with unknown object
 *  ids still renders something intentional rather than a broken slot. */
export function ObjectIcon({ id, size = 22 }: { id: string; size?: number }) {
  const Icon = BY_ID[id];
  if (Icon) return <Icon size={size} />;
  return (
    <svg {...box({ size })}>
      <rect x="8" y="8" width="24" height="24" rx="1.5" />
      <path d="M14 20h12" opacity="0.6" />
    </svg>
  );
}
