/**
 * Room art — hand-authored SVG, ink lines on paper, as if a surveyor's
 * elevation of the room rather than a photograph.
 *
 * Why SVG and not generated raster art: it recolours from the design tokens,
 * stays sharp on any DPR, and costs a few KB inside the JS bundle instead of
 * a network fetch. MiniPay users are frequently on 2G, and the client bundle
 * is capped at 2 MB.
 */

const INK = "#111111";
const INK_3 = "#7a7a7a";
const RED = "#d0342c";

/**
 * Where each object sits in the scene, as percentages of the viewBox, so the
 * tap targets track the drawing at any screen size instead of drifting off it.
 * Keyed by the room's own object ids.
 *
 * Kept at least ~13% apart horizontally: a 44px target on a 360px screen is
 * 12% wide, so anything closer overlaps and steals its neighbour's taps.
 * The desk cluster is also staggered vertically, because their name tags
 * otherwise stack into an unreadable pile once revealed.
 */
export const HOTSPOTS: Record<string, { x: number; y: number }> = {
  "wall-map": { x: 15, y: 22 },
  safe: { x: 45, y: 22 },
  parrot: { x: 66, y: 26 },
  door: { x: 93, y: 30 },
  globe: { x: 80, y: 54 },
  "letter-tray": { x: 55, y: 46 },
  desk: { x: 38, y: 62 },
  drawer: { x: 20, y: 74 },
  "open-drawer": { x: 20, y: 74 },
};

/** The study, drawn as an elevation. Portrait-ish so it fills a phone. */
export function StudyScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 340"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="A cartographer's study: a desk, a globe, a wall map, a safe, a perch and a locked door"
    >
      {/* wall panelling */}
      <g stroke={INK} strokeOpacity="0.08">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={16 + i * 30} y1="0" x2={16 + i * 30} y2="248" />
        ))}
      </g>
      <line x1="0" y1="248" x2="400" y2="248" stroke={INK} strokeOpacity="0.28" />

      {/* floorboards, converging slightly for depth */}
      <g stroke={INK} strokeOpacity="0.1">
        <line x1="0" y1="280" x2="400" y2="280" />
        <line x1="0" y1="312" x2="400" y2="312" />
        <line x1="110" y1="248" x2="86" y2="340" />
        <line x1="250" y1="248" x2="274" y2="340" />
      </g>

      {/* WALL MAP — left */}
      <g transform="translate(38 44)">
        <rect width="96" height="70" fill="#efe7d7" stroke={INK} strokeWidth="2.2" />
        <path d="M10 54 C24 44 32 50 42 36 C52 22 66 28 74 18 C80 11 86 14 90 10"
              fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="1.2" />
        <ellipse cx="62" cy="42" rx="11" ry="8" fill="none" stroke={RED} strokeWidth="1.9" />
        <circle cx="20" cy="20" r="7" fill="none" stroke={INK} strokeOpacity="0.35" />
        <path d="M20 12 v16 M12 20 h16" stroke={INK} strokeOpacity="0.28" strokeWidth="0.7" />
      </g>

      {/* SAFE — behind/right of the map */}
      <g transform="translate(150 52)">
        <rect width="62" height="54" fill="#d3c9b2" stroke={INK} strokeWidth="2.2" />
        <rect x="6" y="6" width="50" height="42" fill="none" stroke={INK} strokeOpacity="0.3" />
        <g transform="translate(12 20)">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 10} width="8" height="14" fill="#efe7d7" stroke={INK}
                  strokeOpacity="0.6" strokeWidth="0.8" />
          ))}
        </g>
        <circle cx="50" cy="27" r="4.5" fill="none" stroke={INK} strokeWidth="1.2" />
      </g>

      {/* PERCH + PARROT */}
      <g transform="translate(244 76)">
        <line x1="14" y1="0" x2="14" y2="52" stroke={INK} strokeOpacity="0.45" strokeWidth="1.9" />
        <line x1="0" y1="30" x2="30" y2="30" stroke={INK} strokeOpacity="0.45" strokeWidth="1.9" />
        <path d="M14 30 c-8 -4 -10 -14 -4 -19 c6 -5 15 -2 15 6 c0 8 -4 12 -11 13z"
              fill="#efe7d7" stroke={INK} strokeWidth="1.9" />
        <circle cx="18" cy="16" r="1.3" fill={INK} />
        <path d="M25 18 l5 2 l-5 2z" fill={INK} opacity="0.7" />
      </g>

      {/* DESK — centre, the anchor of the room */}
      <g transform="translate(112 190)">
        {/* lamp */}
        <path d="M52 -34 L78 -34 L86 -14 L44 -14 Z" fill="#efe7d7" stroke={INK} strokeWidth="1.9" />
        <line x1="65" y1="-14" x2="65" y2="8" stroke={INK} strokeOpacity="0.5" strokeWidth="1.9" />
        {/* letter tray on the desktop */}
        <g transform="translate(96 -14)">
          <path d="M0 14 L5 0 H33 L38 14 Z" fill="#efe7d7" stroke={INK} strokeWidth="1.3" />
          <path d="M0 14 h10 l3 4 h12 l3 -4 h10" fill="none" stroke={INK} strokeOpacity="0.5" />
        </g>
        {/* desktop + apron */}
        <rect x="0" y="8" width="176" height="9" fill="#efe7d7" stroke={INK} strokeWidth="2.2" />
        <rect x="10" y="17" width="156" height="26" fill="#efe7d7" stroke={INK} strokeWidth="1.9" />
        {/* the drawer that will not close */}
        <rect x="20" y="22" width="62" height="16" fill="#e0d7c4" stroke={INK} strokeWidth="1.2" />
        <line x1="44" y1="30" x2="58" y2="30" stroke={INK} strokeOpacity="0.6" strokeWidth="1.9" />
        {/* legs */}
        <line x1="16" y1="43" x2="16" y2="70" stroke={INK} strokeWidth="2" />
        <line x1="160" y1="43" x2="160" y2="70" stroke={INK} strokeWidth="2" />
      </g>

      {/* GLOBE — right */}
      <g transform="translate(292 138)">
        <circle cx="30" cy="30" r="28" fill="#efe7d7" stroke={INK} strokeWidth="2.2" />
        <ellipse cx="30" cy="30" rx="11" ry="28" fill="none" stroke={INK} strokeOpacity="0.25" />
        <line x1="2" y1="30" x2="58" y2="30" stroke={INK} strokeOpacity="0.25" />
        <path d="M8 19 C18 23 30 16 42 21 C48 23 53 20 56 18"
              fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="1.1" />
        <path d="M6 42 C16 37 27 45 38 40 C45 37 51 42 55 40"
              fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="1.1" />
        <path d="M30 -2 A32 32 0 0 1 30 62" fill="none" stroke="#b8a066" strokeWidth="3.4" />
        <path d="M30 58 v12 M14 82 h32 l-5 -12 h-22z" fill="none" stroke={INK} strokeWidth="2" />
      </g>

      {/* DOOR — far right. The way out. */}
      <g transform="translate(352 96)">
        <rect width="40" height="152" fill="#e0d7c4" stroke={INK} strokeWidth="2.4" />
        <rect x="7" y="10" width="26" height="56" fill="none" stroke={INK} strokeOpacity="0.35" />
        <rect x="7" y="82" width="26" height="56" fill="none" stroke={INK} strokeOpacity="0.35" />
        {/* keyhole, no handle on this side */}
        <circle cx="12" cy="76" r="3" fill={RED} opacity="0.8" />
        <path d="M12 78 l2.4 6 h-4.8z" fill={RED} opacity="0.8" />
      </g>
    </svg>
  );
}

/* ── Object plates ─────────────────────────────────────────────────────────
   Pixel-art marks used in tiles and inventory rows, drawn on a 20x20 grid
   inside the existing 40x40 viewBox so each pixel is 2 units — whole numbers
   at the 44px these render at, which is what keeps the edges hard.

   Authored as strings so the shape is legible in source and editable by eye:
   '#' paints a filled cell, anything else leaves it clear. Emitting <rect>
   runs rather than a raster keeps `currentColor` tinting, needs no
   `image-rendering` hack, and costs nothing against the bundle gate. */

type IconProps = { size?: number; className?: string };

const CELL = 2; // 20x20 grid across a 40x40 viewBox

/** Packs each run of filled cells in a row into one <rect>. */
function pixels(rows: string[]): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] !== "#") {
        x++;
        continue;
      }
      let run = 0;
      while (row[x + run] === "#") run++;
      out.push(
        <rect
          key={`${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={run * CELL}
          height={CELL}
        />
      );
      x += run;
    }
  });
  return out;
}

function PixelIcon({ rows, ...p }: IconProps & { rows: string[] }) {
  return (
    <svg
      width={p.size ?? 20}
      height={p.size ?? 20}
      viewBox="0 0 40 40"
      fill="currentColor"
      stroke="none"
      shapeRendering="crispEdges"
      className={p.className}
      aria-hidden
    >
      {pixels(rows)}
    </svg>
  );
}

const ART: Record<string, string[]> = {
  desk: [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "  ################  ",
    "  #              #  ",
    "  ################  ",
    "  #  ######      #  ",
    "  #  #    #      #  ",
    "  #  # ## #      #  ",
    "  #  #    #      #  ",
    "  #  ######      #  ",
    "  ################  ",
    "  ##          ##    ",
    "  ##          ##    ",
    "  ##          ##    ",
    "  ##          ##    ",
    "                    ",
    "                    ",
  ],
  drawer: [
    "                    ",
    "                    ",
    "                    ",
    "  ################  ",
    "  #              #  ",
    "  #  ##########  #  ",
    "  #  #        #  #  ",
    "  #  #   ##   #  #  ",
    "  #  #        #  #  ",
    "  #  ##########  #  ",
    "  #              #  ",
    "  ################  ",
    "  #              #  ",
    "  #  ##########  #  ",
    "  #  #        #  #  ",
    "  #  #   ##   #  #  ",
    "  #  #        #  #  ",
    "  #  ##########  #  ",
    "  ################  ",
    "                    ",
  ],
  "letter-tray": [
    "                    ",
    "                    ",
    "      ########      ",
    "      #      #      ",
    "      #  ##  #      ",
    "      #      #      ",
    "    ############    ",
    "    #          #    ",
    "    #   ####   #    ",
    "    #          #    ",
    "  ################  ",
    "  #              #  ",
    "  #  ##########  #  ",
    "  #              #  ",
    "  ################  ",
    "  #              #  ",
    "  #              #  ",
    "  ################  ",
    "                    ",
    "                    ",
  ],
  globe: [
    "                    ",
    "       ######       ",
    "     ##########     ",
    "    ############    ",
    "   ####    #####    ",
    "   ###  ##  #####   ",
    "  ####      #####   ",
    "  ###   ##   #####  ",
    "  ####      ######  ",
    "   ###  ###  #####  ",
    "   #####    #####   ",
    "    ############    ",
    "     ##########     ",
    "       ######       ",
    "        ####        ",
    "        ####        ",
    "      ########      ",
    "    ############    ",
    "                    ",
    "                    ",
  ],
  "wall-map": [
    "                    ",
    "  ################  ",
    "  #              #  ",
    "  #    ##        #  ",
    "  #   ####       #  ",
    "  #    ##  ##    #  ",
    "  #       ####   #  ",
    "  #        ##    #  ",
    "  #   ##      ## #  ",
    "  #  ####    #####  ",
    "  #   ##      ## #  ",
    "  #        ##    #  ",
    "  #  ##   ####   #  ",
    "  # ####   ##    #  ",
    "  #  ##          #  ",
    "  #              #  ",
    "  ################  ",
    "                    ",
    "                    ",
    "                    ",
  ],
  safe: [
    "                    ",
    "  ################  ",
    "  #              #  ",
    "  #  ##########  #  ",
    "  #  #        #  #  ",
    "  #  #   ##   #  #  ",
    "  #  #  ####  #  #  ",
    "  #  # ###### #  #  ",
    "  #  # ##  ## #  #  ",
    "  #  # ###### #  #  ",
    "  #  #  ####  #  #  ",
    "  #  #   ##   #  #  ",
    "  #  #        #  #  ",
    "  #  ##########  #  ",
    "  #           ## #  ",
    "  #           ## #  ",
    "  ################  ",
    "                    ",
    "                    ",
    "                    ",
  ],
  door: [
    "                    ",
    "    ############    ",
    "    #          #    ",
    "    #  ######  #    ",
    "    #  #    #  #    ",
    "    #  #    #  #    ",
    "    #  #    #  #    ",
    "    #  ######  #    ",
    "    #          #    ",
    "    #      ##  #    ",
    "    #      ##  #    ",
    "    #          #    ",
    "    #  ######  #    ",
    "    #  #    #  #    ",
    "    #  #    #  #    ",
    "    #  #    #  #    ",
    "    #  ######  #    ",
    "    #          #    ",
    "    ############    ",
    "                    ",
  ],
  parrot: [
    "                    ",
    "        ######      ",
    "      ##########    ",
    "     ####    ####   ",
    "    ###   ##  ####  ",
    "  #####       ####  ",
    "  #######    #####  ",
    "    #############   ",
    "     ###########    ",
    "      #########     ",
    "      #########     ",
    "       #######      ",
    "       #######      ",
    "        #####       ",
    "        #####       ",
    "         ###        ",
    "        ## ##       ",
    "      ####  ####    ",
    "                    ",
    "                    ",
  ],
  "brass-key": [
    "                    ",
    "                    ",
    "                    ",
    "     ######         ",
    "    ########        ",
    "   ####  ####       ",
    "   ###    ###       ",
    "   ###    ###       ",
    "   ####  ####       ",
    "    ################",
    "    ################",
    "   ####  ####  ##  #",
    "   ###    ###  ##  #",
    "    ########   ##   ",
    "     ######         ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
  ],
  ledger: [
    "                    ",
    "                    ",
    "   ###############  ",
    "   #             #  ",
    "   #  #########  #  ",
    "   #             #  ",
    "   #  #########  #  ",
    "   #             #  ",
    "   #  ######     #  ",
    "   #             #  ",
    "   #  #########  #  ",
    "   #             #  ",
    "   #  #######    #  ",
    "   #             #  ",
    "   #  #########  #  ",
    "   #             #  ",
    "   ###############  ",
    "   ###############  ",
    "                    ",
    "                    ",
  ],
  plate: [
    "                    ",
    "                    ",
    "                    ",
    "   ##############   ",
    "   #            #   ",
    "   #            #   ",
    "   #            #   ",
    "   #   ######   #   ",
    "   #            #   ",
    "   #            #   ",
    "   #   ######   #   ",
    "   #            #   ",
    "   #            #   ",
    "   #            #   ",
    "   ##############   ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
  ],
};

export const DeskIcon = (p: IconProps) => <PixelIcon rows={ART.desk} {...p} />;
export const DrawerIcon = (p: IconProps) => <PixelIcon rows={ART.drawer} {...p} />;
export const LetterTrayIcon = (p: IconProps) => (
  <PixelIcon rows={ART["letter-tray"]} {...p} />
);
export const GlobeIcon = (p: IconProps) => <PixelIcon rows={ART.globe} {...p} />;
export const WallMapIcon = (p: IconProps) => <PixelIcon rows={ART["wall-map"]} {...p} />;
export const SafeIcon = (p: IconProps) => <PixelIcon rows={ART.safe} {...p} />;
export const DoorIcon = (p: IconProps) => <PixelIcon rows={ART.door} {...p} />;
export const ParrotIcon = (p: IconProps) => <PixelIcon rows={ART.parrot} {...p} />;
export const KeyIcon = (p: IconProps) => <PixelIcon rows={ART["brass-key"]} {...p} />;
export const LedgerIcon = (p: IconProps) => <PixelIcon rows={ART.ledger} {...p} />;

const BY_ID: Record<string, string> = {
  desk: "desk",
  drawer: "drawer",
  "open-drawer": "drawer",
  "letter-tray": "letter-tray",
  "letter-opener": "brass-key",
  globe: "globe",
  "wall-map": "wall-map",
  safe: "safe",
  door: "door",
  parrot: "parrot",
  "brass-key": "brass-key",
  ledger: "ledger",
};

/** Falls back to a plain plate so an AI-generated room with unknown object
 *  ids still renders something intentional rather than a broken slot. */
export function ObjectIcon({ id, size = 20 }: { id: string; size?: number }) {
  return <PixelIcon rows={ART[BY_ID[id] ?? "plate"]} size={size} />;
}

export { INK, INK_3, RED };
