/**
 * Prop artwork. When a player examines something, they get a close-up of the
 * actual object — a letter on aged paper, the chart with its harbour circled
 * in red ink, the safe's dials — instead of a sentence describing it.
 *
 * Drawn as SVG on a 400x300 stage so every prop shares proportions and can be
 * shown either full-screen or as a 30px thumbnail from the same source. Ink
 * lines only, one red accent, matching the paper design tokens.
 */

const INK = "#16130f";
const INK_2 = "#4a443b";
const INK_3 = "#8b8375";
const RED = "#b8392b";
const PAPER = "#e8e0cd";

/** Handwriting, faked as a wobbling polyline. Real text at this scale would
 *  be unreadable anyway, and illegible-but-convincing is the point. */
function Script({
  y,
  width,
  seed = 0,
  color = INK_2,
}: {
  y: number;
  width: number;
  seed?: number;
  color?: string;
}) {
  const pts: string[] = [];
  const step = 5;
  for (let x = 0; x <= width; x += step) {
    // Deterministic pseudo-noise: same prop always renders identically, and
    // Math.random() would break SSR hydration.
    const n = Math.sin((x + seed * 37) * 0.7) + Math.sin((x + seed * 11) * 1.9) * 0.5;
    pts.push(`${x},${(n * 1.5).toFixed(2)}`);
  }
  return (
    <polyline
      points={pts.join(" ")}
      transform={`translate(0 ${y})`}
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.75"
    />
  );
}

export interface ArtifactProps {
  className?: string;
}

/** The correspondence in the letter tray. Carries the brass letter-opener. */
export function LetterArtifact({ className }: ArtifactProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img"
         aria-label="An opened letter, handwritten, with a brass letter-opener across it">
      <rect width="400" height="300" fill={PAPER} />
      {/* fold lines — this was posted, not written here */}
      <line x1="0" y1="104" x2="400" y2="104" stroke={INK} strokeOpacity="0.09" />
      <line x1="0" y1="205" x2="400" y2="205" stroke={INK} strokeOpacity="0.09" />

      <g transform="translate(44 44)">
        <text x="0" y="0" fontSize="13" fontFamily="monospace" fill={INK_3} letterSpacing="2">
          12 OCTOBER
        </text>
        <text x="0" y="30" fontSize="16" fontFamily="serif" fill={INK} fontStyle="italic">
          My dear Aldous —
        </text>
        <g transform="translate(0 52)">
          <Script y={0} width={300} seed={1} />
          <Script y={20} width={312} seed={2} />
          <Script y={40} width={286} seed={3} />
          <Script y={60} width={304} seed={4} />
          <Script y={80} width={180} seed={5} />
        </g>
        {/* The line that matters, in the sender's own hand, underlined. */}
        <text x="0" y="176" fontSize="15" fontFamily="serif" fill={RED} fontStyle="italic">
          I sail on the 12th. Do not follow.
        </text>
        <line x1="0" y1="182" x2="228" y2="182" stroke={RED} strokeWidth="1.2" opacity="0.7" />
        <g transform="translate(196 200)">
          <Script y={0} width={104} seed={9} color={INK} />
        </g>
      </g>

      {/* Brass letter-opener lying across the page, handle like a ship's prow. */}
      <g transform="translate(292 40) rotate(24)">
        <path d="M0 6 L86 4 L104 8 L86 12 L0 10 Z" fill="#b8a066" stroke={INK} strokeOpacity="0.4" />
        <path d="M0 3 L-34 5 L-40 8 L-34 11 L0 13 Z" fill="#8d7847" stroke={INK} strokeOpacity="0.4" />
        <circle cx="-18" cy="8" r="2.4" fill={INK} opacity="0.35" />
      </g>
    </svg>
  );
}

/** The wall chart. Red-ink circle round the harbour, and the sailing date. */
export function ChartArtifact({ className }: ArtifactProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img"
         aria-label="A sea chart with a harbour circled in red ink and a note beside it">
      <rect width="400" height="300" fill={PAPER} />

      {/* graticule */}
      <g stroke={INK} strokeOpacity="0.1">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={20 + i * 45} y1="16" x2={20 + i * 45} y2="284" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1="16" y1={30 + i * 45} x2="384" y2={30 + i * 45} />
        ))}
      </g>

      {/* coastline + shallows */}
      <path
        d="M22 232 C70 214 96 236 128 210 C158 186 184 200 214 168 C242 138 276 152 306 120 C332 92 360 104 380 84"
        fill="none" stroke={INK} strokeWidth="2" />
      <path
        d="M22 250 C74 232 98 254 132 228 C162 204 188 218 218 186 C246 156 280 170 310 138 C336 110 362 122 380 102"
        fill="none" stroke={INK} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 4" />

      {/* depth soundings */}
      <g fill={INK_3} fontSize="9" fontFamily="monospace">
        <text x="60" y="200">17</text>
        <text x="140" y="176">24</text>
        <text x="238" y="140">31</text>
        <text x="320" y="104">12</text>
      </g>

      {/* compass rose */}
      <g transform="translate(66 74)" stroke={INK} strokeOpacity="0.5" fill="none">
        <circle r="24" />
        <circle r="15" strokeOpacity="0.3" />
        <path d="M0 -28 L0 28 M-28 0 L28 0" />
        <path d="M-19 -19 L19 19 M19 -19 L-19 19" strokeOpacity="0.3" />
        <path d="M0 -28 L5 -8 L0 0 L-5 -8 Z" fill={INK} fillOpacity="0.65" stroke="none" />
      </g>

      {/* The clue: a harbour ringed in red, twice, the way you mark something
          you keep coming back to. */}
      <g stroke={RED} fill="none">
        <ellipse cx="214" cy="168" rx="30" ry="22" strokeWidth="2" transform="rotate(-12 214 168)" />
        <ellipse cx="214" cy="168" rx="34" ry="26" strokeWidth="1" opacity="0.5"
                 transform="rotate(6 214 168)" />
      </g>
      <text x="250" y="206" fontSize="15" fontFamily="serif" fontStyle="italic" fill={RED}>
        she sailed on
      </text>
      <text x="250" y="226" fontSize="15" fontFamily="serif" fontStyle="italic" fill={RED}>
        the 12th
      </text>

      {/* pins */}
      {[
        [16, 12],
        [384, 12],
        [16, 288],
        [384, 288],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={INK} opacity="0.4" />
      ))}
    </svg>
  );
}

/** The globe, turned right around: the latitude scratched into the meridian. */
export function GlobeArtifact({ className }: ArtifactProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img"
         aria-label="A brass-mounted globe turned to show the number 47 scratched into its meridian">
      <rect width="400" height="300" fill={PAPER} />
      <g transform="translate(200 140)">
        <circle r="104" fill="none" stroke={INK} strokeWidth="2" />
        {/* meridians + parallels */}
        <g stroke={INK} strokeOpacity="0.22" fill="none">
          <ellipse rx="38" ry="104" />
          <ellipse rx="74" ry="104" />
          <line x1="-104" y1="0" x2="104" y2="0" />
          <path d="M-98 -34 L98 -34 M-98 34 L98 34" strokeOpacity="0.16" />
          <path d="M-74 -68 L74 -68 M-74 68 L74 68" strokeOpacity="0.16" />
        </g>
        {/* landmasses */}
        <path d="M-72 -46 C-46 -60 -24 -40 2 -50 C24 -58 44 -44 62 -52"
              fill="none" stroke={INK} strokeWidth="1.6" opacity="0.6" />
        <path d="M-84 18 C-56 4 -30 26 -2 14 C22 4 48 24 76 12"
              fill="none" stroke={INK} strokeWidth="1.6" opacity="0.6" />
        <path d="M-40 56 C-20 48 4 62 28 52" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.5" />

        {/* brass meridian ring — worn bright where it has been handled */}
        <path d="M0 -118 A118 118 0 0 1 0 118" fill="none" stroke="#b8a066" strokeWidth="7" />
        <path d="M0 -118 A118 118 0 0 1 0 118" fill="none" stroke={INK} strokeOpacity="0.3"
              strokeWidth="7" strokeDasharray="1 9" />

        {/* THE CLUE, scratched into the brass */}
        <g transform="translate(118 4)">
          <rect x="-22" y="-16" width="44" height="32" fill="#c9b47c" stroke={INK}
                strokeOpacity="0.35" />
          <text x="0" y="8" textAnchor="middle" fontSize="24" fontFamily="monospace"
                fill={INK} letterSpacing="1">47</text>
        </g>

        {/* stand */}
        <path d="M0 118 L0 138 M-40 156 L40 156 L30 138 L-30 138 Z"
              fill="none" stroke={INK} strokeWidth="2" />
      </g>
      <text x="200" y="288" textAnchor="middle" fontSize="11" fontFamily="monospace"
            fill={INK_3} letterSpacing="2">SCRATCHED INTO THE MERIDIAN</text>
    </svg>
  );
}

/** The wall safe: four dials, and the instruction scratched above them. */
export function SafeArtifact({ className }: ArtifactProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img"
         aria-label="An iron wall safe with four numbered dials and an instruction scratched above them">
      <rect width="400" height="300" fill={PAPER} />
      <g transform="translate(60 46)">
        <rect width="280" height="208" fill="#cfc7b6" stroke={INK} strokeWidth="2" />
        <rect x="10" y="10" width="260" height="188" fill="none" stroke={INK} strokeOpacity="0.3" />

        {/* the scratched instruction */}
        <text x="140" y="46" textAnchor="middle" fontSize="12" fontFamily="monospace"
              fill={INK} letterSpacing="1.5">LATITUDE, THEN THE</text>
        <text x="140" y="64" textAnchor="middle" fontSize="12" fontFamily="monospace"
              fill={INK} letterSpacing="1.5">DAY SHE SAILED</text>

        {/* four dials, deliberately NOT showing the answer */}
        <g transform="translate(30 96)">
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${i * 58} 0)`}>
              <rect width="44" height="58" fill="#e6dfd0" stroke={INK} strokeWidth="1.5" />
              <text x="22" y="24" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={INK_3}>{["8", "3", "9", "1"][i]}</text>
              <line x1="4" y1="30" x2="40" y2="30" stroke={INK} strokeOpacity="0.25" />
              <text x="22" y="48" textAnchor="middle" fontSize="17" fontFamily="monospace"
                    fill={INK}>{["9", "4", "0", "2"][i]}</text>
            </g>
          ))}
        </g>

        <circle cx="252" cy="126" r="13" fill="none" stroke={INK} strokeWidth="2" />
        <path d="M252 116 v-6 M252 142 v-6 M242 126 h-6 M268 126 h-6"
              stroke={INK} strokeWidth="1.5" />
        <rect x="24" y="176" width="232" height="1" fill={INK} opacity="0.2" />
      </g>
    </svg>
  );
}

/** The ledger from the locked drawer. */
export function LedgerArtifact({ className }: ArtifactProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img"
         aria-label="An open ledger of dated entries">
      <rect width="400" height="300" fill={PAPER} />
      <line x1="200" y1="12" x2="200" y2="288" stroke={INK} strokeOpacity="0.25" />
      <line x1="62" y1="12" x2="62" y2="288" stroke={RED} strokeOpacity="0.3" />
      <g stroke={INK} strokeOpacity="0.12">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1="16" y1={44 + i * 22} x2="384" y2={44 + i * 22} />
        ))}
      </g>
      <text x="24" y="30" fontSize="11" fontFamily="monospace" fill={INK_3} letterSpacing="2">
        DATE
      </text>
      <text x="214" y="30" fontSize="11" fontFamily="monospace" fill={INK_3} letterSpacing="2">
        CONSIGNMENT
      </text>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <g key={i} transform={`translate(0 ${58 + i * 22})`}>
          <text x="22" y="0" fontSize="12" fontFamily="monospace" fill={INK_2}>
            {`0${(i % 9) + 1}/10`}
          </text>
          <Script y={-4} width={104} seed={i + 20} />
        </g>
      ))}
      <g transform="translate(214 190)">
        <Script y={0} width={150} seed={40} color={RED} />
      </g>
    </svg>
  );
}

/** Fallback: an evidence card, so an unknown object still shows something
 *  deliberate rather than an empty frame. */
export function GenericArtifact({ className }: ArtifactProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="An item from the room">
      <rect width="400" height="300" fill={PAPER} />
      <rect x="28" y="28" width="344" height="244" fill="none" stroke={INK} strokeOpacity="0.3" />
      <rect x="40" y="40" width="320" height="220" fill="none" stroke={INK} strokeOpacity="0.12" />
      <circle cx="200" cy="140" r="42" fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="2" />
      <path d="M200 118 v44 M178 140 h44" stroke={INK} strokeOpacity="0.25" strokeWidth="2" />
      <text x="200" y="222" textAnchor="middle" fontSize="11" fontFamily="monospace"
            fill={INK_3} letterSpacing="2">EXAMINED</text>
    </svg>
  );
}

/** Room-object id → prop. Objects absent from this map have no close-up, so
 *  the game falls back to plain narration rather than showing a stock card. */
const ARTIFACTS: Record<string, (p: ArtifactProps) => React.ReactElement> = {
  "letter-tray": LetterArtifact,
  "wall-map": ChartArtifact,
  globe: GlobeArtifact,
  safe: SafeArtifact,
  ledger: LedgerArtifact,
  drawer: LedgerArtifact,
};

export function hasArtifact(id: string): boolean {
  return id in ARTIFACTS;
}

export function Artifact({ id, className }: { id: string; className?: string }) {
  const Art = ARTIFACTS[id] ?? GenericArtifact;
  return <Art className={className} />;
}
