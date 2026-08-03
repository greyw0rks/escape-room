# Retro-Mac UI spec

The reference for Escape's visual identity. Supersedes
`heal-grow-ui-spec.md` (the old dark-editorial spec, kept at
`~/heal-grow-ui-spec.md` for history only — do not build to it).

Source reference: the Susan Kare tribute site — classic Macintosh, sky-blue
hero bands, hard black window chrome, bitmap type, pixel-art icons.

## The two rules that carry the whole look

1. **Borders are solid black, never translucent.** `--line: #111`. That hard
   1px frame is what reads as Mac window chrome rather than a modern card. If a
   border looks soft, the look is broken.
2. **Nothing is rounded.** `--radius: 0` and stays 0. The one exception is
   `.btn-circle`, where a full circle reads as a button, not a rounded rect.

## Palette (tokens in `app/globals.css :root`)

| Token         | Value     | Use                                       |
| ------------- | --------- | ----------------------------------------- |
| `--bg`        | `#f5f5f0` | off-white content ground                  |
| `--sky`       | `#a8d8f0` | hero + room band                          |
| `--surface`   | `#ffffff` | window interiors                          |
| `--paper`     | `#fdfcf7` | illustration ground (art never sits raw)  |
| `--text`      | `#111111` | near-black ink                            |
| `--accent`    | `#ffd83d` | highlighter yellow — the clue, sparingly  |
| `--red`       | `#d0342c` | alarm / the one red accent in artifacts   |
| `--line`      | `#111111` | all chrome (solid, see rule 1)            |

Sky-blue hero/room bands sit over the off-white content ground. That band
contrast replaces the old cream-on-charcoal one.

## Type

- **Display = Silkscreen** (bitmap). Headings, labels, buttons, window title
  bars. Never a paragraph. **Silkscreen, not Press Start 2P** — the latter is
  ~40% wider per glyph and wraps headings at MiniPay's 360px minimum.
- **Body = IBM Plex Mono.** Everything you actually read. `--font-body` and
  `--font-mono` both point at it.
- Pixel type is sized in **whole px** (`--px-xs`…`--px-2xl`), never rem: a
  bitmap face only lands on the pixel grid at integer sizes, else it renders
  soft.

## Window chrome (the defining motif)

`.window` = hard 1px black frame + white interior. `.window-bar` = a title bar
with the classic centred title flanked by pinstripe rules (a CSS
`repeating-linear-gradient`, no image, free against the bundle gate). Panels
that already had a header row (the room bar, the artifact bar) become title
bars rather than growing a second one.

## Icons

12 object icons in `components/RoomArt.tsx`, drawn as **pixel art on a 20×20
grid inside the 40×40 viewBox** (each cell = 2 units, crisp at the 44/64px they
render at). Authored as `'#'`-string rows, emitted as `<rect>` runs with
`shape-rendering="crispEdges"` and `fill: currentColor` so tinting still works.
The app mark (`Brand.tsx` `Mark`, `public/icon.svg`, OG image) is a pixel
keyhole on the same grid.

The **room scene** (`StudyScene`, viewBox 400×340) keeps its hand-drawn line
art — only the small object icons are pixelated.

## Layout

- **Full-bleed at every width.** `.app-shell` is `width: 100%` — no max-width
  cap on mobile or desktop. Content gets its measure from section padding, so
  chrome, bands and rules run edge to edge. Only long-form single-column pages
  (`.page-narrow`) cap their own measure (~860px) and centre; the shell behind
  them still runs full width.
- **`.room-stage` is pinned to the art's 400:340 ratio.** Hotspots are
  positioned against the *stage*, not the SVG, so a stage wider than the art
  letterboxes the drawing and strands taps off it. Under the full-bleed shell
  the stage is driven off **height** (`height: 100%; width: auto`), because
  `width: 100%` would beat `aspect-ratio` on an unbounded column and
  re-introduce the letterbox (measured: one hotspot went off-art at 1920px that
  way). On mobile the stage caps its width at `(100dvh - 190px) * 400/340`.

## Hard constraints (MiniPay)

- Authored mobile-first at **360×640** (MiniPay's hard minimum). Every heading
  must fit without clipping — if one breaks, shorten the copy, never downsize
  the font.
- Client JS **< 2 MB** (CI gates `.next/static/*.js`; currently ~937 KB).
  Fonts don't count toward it but keep them lean anyway.
- `--tap: 44px` floor on every interactive target.
- Plain CSS only — no Tailwind, no CSS-in-JS.
