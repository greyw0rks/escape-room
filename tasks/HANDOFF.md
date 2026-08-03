# Handoff — AI Escape Room (Celo MiniPay Mini App)

## Status snapshot
Last updated: 2026-08-02
Repo: `/home/greyw0rks/escape-room/` — **public at https://github.com/greyw0rks/escape-room**
Plan: `/home/greyw0rks/.claude/plans/witty-scribbling-noodle.md`
Target: **Celo Proof of Ship** monthly sprint → **MiniPay Discovery listing**

Phases 1–2 complete and **Phase 4 (contract) is code-complete** — written, tested,
and simulated against live Sepolia. **The game is playable end to end** in a browser.
Nothing is deployed on-chain yet; broadcasting is blocked on a funded deployer key.

**Phase order changed:** doing Phase 4 (contract) before Phase 3 (AI), because AI is
blocked on a provider key and the contract is not blocked on anything.

---

## What's done

### Phase 1 — MiniPay shell
- **Repo scaffolded and public.** Next.js 16.2.12 (app router) + React 19 + TypeScript.
  Design docs in `docs/`. CI runs typecheck, tests, build, and a bundle-size gate.
- **celopedia-skill v2.6.0 installed** at `.claude/skills/celopedia-skill/` (36 references),
  pulled from upstream — not copied from another local project.
- **Dropped wagmi/RainbowKit for plain viem.** The skill's scaffold guide is explicit that
  MiniPay uses `window.ethereum` directly. Cut **529 packages → 101** and removed the
  entire Coinbase-SDK→axios vulnerability tree.
- **Client JS 0.83 MB** against MiniPay's 2 MB cap. CI now fails the build if it exceeds.
- **MiniPay compliance:** `isMiniPay()` detection, ERC-8021 attribution via the official
  SDK (SSR-guarded), zero-click connect, readable aliases instead of raw `0x…` addresses,
  Add Cash deeplink, verified stablecoin + CIP-64 addresses.
- **Verified at 360×640 by screenshot:** zero overflow, all tap targets ≥44px.

### Phase 2 — Game engine + playable UI
- **Engine modules** in `server/`, following doc 13's service boundaries as plain modules:
  `puzzle` (DAG + validator), `inventory` (8-slot cap), `npc` (trust + knowledge gating),
  `hints` (5 levels), `room` (lifecycle + redaction), `scoring`, `gamemaster`, `sessions`.
- **Two safety gates:**
  - `validateRoom()` proves a room is escapable via a solver walk before it can publish.
    Blocks on cycles, dangling refs, unreachable escape puzzles.
  - `redactRoom()` is the client boundary — solutions, hint text, the dependency graph,
    NPC secrets and hidden objects never reach the browser.
- **Prize-pool split** uses integer maths with dust to first place, so payouts always sum
  to *exactly* the pool. Over-distributing by a wei would make on-chain claims insolvent.
- **Seed room "The Cartographer's Study"** — 4-puzzle chain, 3 clues each, a trust-gated
  parrot NPC. Doubles as the fallback when AI generation fails validation, so it's held to
  zero validator warnings.
- **77 tests passing.** Includes a playthrough suite that escapes the room the intended way.
- **Playable UI verified in a real browser at 360×640:** escaped in 7s for a score of 994,
  no console errors, no overflow. Hints escalate, the parrot answers from its allow-list,
  wrong codes cost accuracy without ending the run.

### Phase 4 — DailyRoomPool contract (DEPLOYED to Celo Sepolia)
- **Live at `0x92ca22515502d7e1360f57244fa86ebebcaede9c`** on Celo Sepolia (11142220),
  verified on Blockscout:
  https://celo-sepolia.blockscout.com/address/0x92ca22515502d7e1360f57244fa86ebebcaede9c
  Owner `0xc61Bbc0C…`, signer `0xfF4b87b6…`, rake 500 bps, claim window 30d.
  All three stablecoins enabled. Cost ~0.26 CELO of testnet funds.
- **Proven end to end on the live contract**, not just in tests: entered a room with a
  1.0 test-token fee → pool 0.95 / treasury 0.05 (exact 5% rake) → backend signed an
  EIP-712 claim → full pool withdrawn → pool reads 0. Then both defences were confirmed
  *on-chain*: a valid signature against an empty pool reverts `PoolExhausted(1000, 0)`,
  and a signature from the wrong key reverts `BadSignature`.
- **`contracts/celo/src/DailyRoomPool.sol`** — one shared pool per `(dayId, token)`.
  Fixed on-chain entry fee, EIP-712 signed claims, rake capped at a hard 20% the
  owner cannot raise, sweep of unclaimed prizes after a window, pausable entries.
- **Self-funding by construction**, so the pool can never owe more than it collected.
  There is no house float and the backend never custodies player money.
- **Two independent defences against overdraw**, per the risk register's "never trust
  one layer": the signature binds `(dayId, token, player, amount)` so it cannot be
  replayed across days/tokens/wallets, *and* `claim` re-checks the day's remaining
  balance on-chain. A compromised signer can misallocate one day's pool but can never
  mint value or reach another day.
- **Pausing never blocks claims** — earned winnings must always be withdrawable.
- **40 Foundry tests including 3 fuzz suites.** Proven non-vacuous by mutation
  testing: deleting the overdraw guard fails exactly the 3 tests that assert it,
  and removing either the `checkIn` dedupe guard or its `whenNotPaused` fails
  exactly the one test that asserts each.
- **`checkIn(uint32 dayId)` — the free entry path (2026-08-02).** A token-free
  transaction that registers a wallet for the day's room. It exists because
  MiniPay supports neither `personal_sign` nor `eth_signTypedData`, so a
  transaction is the *only* way a player can prove they control an address —
  `msg.sender` is the proof. It moves no tokens and touches no pool, treasury or
  entry accounting, so it cannot affect solvency (asserted directly, plus a fuzz
  suite over arbitrary dayIds and up to 32 wallets).
  - **The player signs it from their own wallet — never a relayer.** A relayer
    would make `msg.sender` the backend, destroying the ownership proof and
    attributing every transaction to one address.
  - **It must stay load-bearing.** Proof of Ship scores "real on-chain fees paid
    by real users" and flags farming; a transaction whose only output is a metric
    is exactly what that penalises. Check-in is what opens the ranked attempt, so
    the on-chain record is a byproduct of a real action. **Do not build
    streak-farming UI on it** — the reward for checking in is playing the room.
  - `whenNotPaused` (it is an entry path) but deliberately **not** `nonReentrant`
    (no external call, nothing to re-enter).
  - **Not yet on-chain.** The live contract is immutable, so this needs a redeploy.
- **`script/Deploy.s.sol`** hardcodes token addresses per chain id (a mistyped env var
  cannot enable a nonexistent token) and refuses to deploy if signer == owner.
  Simulated against live Sepolia: ~0.26 CELO to deploy and enable all three tokens.
- **CI now has a `contracts` job** running `forge fmt --check`, `forge build --sizes`
  and `forge test -vvv`. `forge-std` and OpenZeppelin are proper git submodules.

### Landing page (2026-07-31)
There was no landing page — `/` went straight to the room picker, so a first-time
visitor (or a MiniPay reviewer) arrived with **no idea what the game was**.

- **`/` is now a landing page**; the room picker moved to **`/play`**. Sections:
  hero → what's in a room → how it works (3 steps) → practice vs ranked → fair play
  → FAQ → closing CTA → footer. Structure follows Arcadia's landing page, which does
  the same job for the same audience.
- **Hero CTA goes straight into `/play/practice`** — free, no wallet, one tap from
  cold visitor to actually playing the game.
- **The FAQ answers the gambling question directly**, which matters because Proof of
  Ship excludes gambling: fixed known entry, no wager, no odds, no randomness in the
  split, outcome determined purely by skill. Also states plainly that we never hold
  player funds.
- **Footer disclaims operator identity** ("not operated by MiniPay or Celo"), which
  MiniPay's listing rules require.
- `/play` and `/play/[sessionId]` coexist — Next gives the static segment precedence.

### Visual identity — retro Macintosh (2026-08-02)
**Replaced the dark-editorial look.** Now built to **`docs/retro-mac-ui-spec.md`**
(in-repo) from a new reference: the Susan Kare tribute site — sky-blue hero bands,
hard black Mac window chrome, bitmap type, pixel-art icons. The old
`heal-grow-ui-spec.md` is **retired** (kept at `~/heal-grow-ui-spec.md` for history
only); do not build to it. It was a full design-system replacement, not a retheme,
approved as such.

- **Two load-bearing rules:** (1) borders are solid black `#111`, never
  translucent — that hard frame is what reads as window chrome; (2) nothing is
  rounded, `--radius: 0` (only `.btn-circle` keeps a radius).
- **Tokens:** off-white `#f5f5f0` ground, sky `#a8d8f0` hero/room bands, white
  `#ffffff` window interiors, paper `#fdfcf7` illustration ground, ink `#111`,
  highlighter `--accent #ffd83d`, red `#d0342c`.
- **Type:** Silkscreen (bitmap) for display/labels/buttons/title-bars **only** —
  never a paragraph; **Silkscreen not Press Start 2P** (the latter wraps at 360px).
  IBM Plex Mono for all body. Pixel type sized in whole px (`--px-*`), never rem.
- **Window chrome is the motif:** `.window` frame + `.window-bar` pinstriped
  title bar (CSS gradient, no image). Existing header rows became title bars.
- **Icons are pixel art:** 12 object icons redrawn on a 20×20 grid inside the
  40×40 viewBox (`'#'`-string rows → `<rect>` runs, `crispEdges`, `currentColor`).
  App mark / `icon.svg` / OG image are a matching pixel keyhole. The **room scene
  keeps its hand-drawn line art** — only the small icons are pixelated.
- **Full-bleed at every width** — the old 480px mobile / 1120px desktop shell caps
  were removed; `.app-shell` is `width: 100%`. `.room-stage` is pinned to the art's
  400:340 ratio and driven off height so the full-bleed column can't letterbox it.
- **Swept every hardcoded colour** outside globals.css: `opengraph-image.tsx`,
  `public/icon.svg`, `manifest.ts` (bg/theme), `Brand.tsx`, `Artifacts.tsx` ink
  palette, `RoomArt.tsx` INK/RED, and `.hotspot`/`.verb` inline colours.
- **Verified:** all 5 routes full-bleed with zero overflow at 360 and 1440; 0/7
  hotspots off-art at 360/768/1024/1280/1440/1920; all popovers place; 77 tests
  pass; full playthrough clean; client JS 937 KB (< 2 MB gate).

### Gameplay — tappable scene + prop artifacts (2026-07-31)
The room was a chat log with a row of buttons. It is now a place you look at.

- **The scene is the interface.** Objects are hotspots positioned over the
  drawing in *percentage* coordinates (`HOTSPOTS` in `components/RoomArt.tsx`),
  so they track the art at any screen size. Unfound objects show a breathing
  ring; found ones shrink to a dot and reveal their name.
- **Prop artifacts** (`components/Artifacts.tsx`) are the payoff for searching:
  examining something opens a **full-screen close-up of the actual object** —
  the letter on aged paper with handwriting and the sailing date in red ink, the
  chart with its harbour circled, the globe's brass meridian showing **47**, the
  safe's dials, the ledger. Closing it leaves a **tappable thumbnail** in the
  caption so a clue can be re-checked without walking the room again.
- Handwriting is faked with a deterministic sine-based polyline — `Math.random()`
  would break SSR hydration, and real text at that size is unreadable anyway.
- Only `inspect`/`read`/`rotate` open a prop. Taking or pushing something does
  not, so the viewer never interrupts a non-visual action.
- Text is a **capped caption strip (26vh)** under the art, not a transcript.
- Hotspots are spaced ≥13% apart horizontally: a 44px target on a 360px screen
  is 12% wide, so anything closer steals its neighbour's taps. Verified
  programmatically — zero overlaps, all ≥44px, all clickable.
- **Verbs open at the object you tapped** (PR #7, 2026-08-01). They used to
  appear in the bottom bar — up to **462px** of travel on a 640px screen, with
  the caption text in between, which broke the "the scene is the interface"
  premise. The popover position is **measured after mount and clamped inside
  the stage**, not set by a percentage anchor: a percentage can't know how wide
  six verbs render, so edge objects (wall map, study door) clipped outside the
  art. It flips above the hotspot when opening below would overflow. Verified
  across all 7 hotspots at 360×640 and 412×915 — max travel now 151px.
- **Desktop layout** (2026-08-02). The app is no longer mobile-only: from
  `min-width: 900px` the shell widens to 1120px (1320px on the room, via
  `.app-shell:has(.room)`), the room becomes a two-pane grid with the art left
  and caption/actions right, the landing sections reflow to multi-column, and
  the bottom tab bar moves to the top. Mobile is untouched — every rule is
  inside a `min-width` or `hover` query, and the 360×640 screenshots are
  byte-identical to the pre-change baseline on 4 of 5 routes (the 5th differs
  only by animation/encoder noise, confirmed by diffing two runs of the *same*
  build).
- **The room stage must stay pinned to `aspect-ratio: 400 / 340`.** The scene
  SVG is `xMidYMid meet`, but hotspots are positioned as a percentage of the
  **stage**, not the art. Any stage wider than the art's ratio letterboxes the
  drawing and strands hotspots off it — measured at 1440px, **3 of 7 ended up
  outside the artwork**. Do not give `.room-stage` a free-form width or height
  on desktop. Note `height: 100%` silently defeats `aspect-ratio` in a grid
  cell; use `width: 100%; height: auto; max-height: 100%`.
- Desktop hover affordances live in `@media (hover: hover) and (pointer: fine)`
  so a tap never leaves a hover state stuck on. The hotspot ring scaling on
  hover is the only cue a mouse user gets that a hotspot is live; it
  deliberately does not reveal the object's name, since finding things is the
  game.

### CI/CD
- **CI** (`.github/workflows/ci.yml`) — `app` job (typecheck, vitest, build, 2 MB bundle
  gate) and `contracts` job (fmt, build, forge test). Both green on main.
- **CD — Vercel's native GitHub integration**, project
  `greyw0rks-projects/escape-room` (`prj_ZXZthN9GA1dTyXLrDmsudw8M7KAq`), production
  branch `main`. Preview URL per PR, production on merge. No secrets to manage.
  Env vars set for all targets: `NEXT_PUBLIC_CELO_NETWORK=testnet`,
  `NEXT_PUBLIC_POOL_ADDRESS=0x92ca2251…de9c`.
- **LIVE at https://escape-room-chi-five.vercel.app** (also
  `escape-room-greyw0rks-projects.vercel.app`). Verified in production: 200, correct
  title, `POST /api/session/start` returns the seed room, and redaction holds — no
  `solution`/`hints`/`dependsOn`/`secrets` keys in the client payload.
  ⚠️ Note `escape-room.vercel.app` is **someone else's p5.js project**, not ours.
- **Vercel Deployment Protection had to be disabled.** The project defaulted to
  `ssoProtection: all_except_custom_domains`, which 302'd every request to a Vercel
  SSO login. In a MiniPay webview that renders as a login wall instead of the game.
- **A GitHub Actions deploy workflow was written and then deleted.** Vercel's GitHub
  App already deploys on push, so keeping both meant two competing deploys per commit.
  See the failures log for why a token-based workflow wasn't viable.
- **Known gap:** the Git integration deploys on push *regardless of CI*. CI still runs
  and reports, but cannot block a bad commit from reaching a preview URL. Acceptable
  while main is PR-protected (checks must pass before merge), but revisit before the
  MiniPay listing — a broken production deploy is visible to reviewers.
- **`main` is protected** by a ruleset (id 20116895) with `current_user_can_bypass:
  never`, matching the Arcadia repos. Required checks: `app` and `contracts`.
  **Direct `git push origin main` is now rejected** — every change needs a branch + PR.

---

## What's remaining

- [ ] **Phase 4 — done for testnet.** Deployed and verified on Celo Sepolia, full
      entry→claim loop exercised on-chain. Mainnet deploy is Phase 7.
- [ ] **Phase 3 — AI layer** (task #3). *Blocked on an AI provider key.* Swappable gateway,
      intent parsing before narration, cached shared prompt prefix, injection filter,
      offline fallback. Then nightly room generation + the solvability validator.
- [ ] **Phase 5 — Ranked loop** (task #5). Entry → session → server scoring → day close →
      signed claim. Anti-cheat. Swap the in-memory session store for Postgres.
- [ ] **Wire `checkIn` end to end.** Two steps, in order: (1) **redeploy to Celo
      Sepolia** — the live contract is immutable so `checkIn` does not exist on-chain
      yet, and the new address goes in `lib/contract.ts`; (2) frontend — check-in
      button on `/play` via the existing viem client in `lib/wallet.ts` (legacy tx,
      no custom `feeCurrency`, per `lib/minipay.ts`), and a `hasCheckedIn` gate in
      `app/api/session/start/route.ts` before a ranked session opens.
- [ ] **Phase 6 — Listing surface** (task #6). Real leaderboard, `/stats` metrics, full
      ToS/Privacy, in-app support link.
- [x] ~~**Visual identity + game art**~~ — **done 2026-07-31.** See "Visual identity" above.
      Remaining art work is *additional* rooms, not the first one.
- [ ] **Phase 7 — Mainnet + submission** (task #7).

---

## What Claude can do autonomously

- Phases 4–6: contract + Foundry tests, API routes, leaderboard, stats, UI.
- Phase 3 *plumbing* (gateway interface, prompt builder, injection filter, fallback path)
  can be built and tested with a stub provider before a real key exists.
- Deploy and verify on **Celo Sepolia** — testnet, free funds, no real money at risk.
- Run typecheck, Vitest, `forge test`, builds, bundle-size checks.
- Screenshot-verify every screen at 360×640 and catch regressions.
- Commit and push continuously (Proof of Ship scores commit activity).

### How to screenshot-verify (browser automation works on this box)
There is **no Playwright in this repo**, but a chromium binary is already cached at
`~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`. To drive the UI:

1. `npm i playwright-core` in a scratch dir (e.g. `/tmp/pwtool`) — *not* in this repo,
   it doesn't belong in the dependency tree or the bundle budget.
2. Launch with `chromium.launch({ executablePath: <that path>, args: ["--no-sandbox"] })`.
3. Point it at `next build && next start` on a spare port, **not `next dev`** — the dev
   overlay (`<nextjs-portal>`) swallows clicks and renders a stray "N" badge.
   Start detached: `setsid nohup npx next start -p 3311 > /tmp/er-start.log 2>&1 &`.
4. Assert on geometry (bounding boxes vs the stage, tap targets ≥44px,
   `scrollWidth` vs viewport) *and* read the PNG — the Fraunces line-height bug was
   invisible to DOM probing and only showed up in the image.

## What requires the human

- [x] ~~Register on talent.app~~ — **done**
- [x] ~~Create the public GitHub repo~~ — **done**, https://github.com/greyw0rks/escape-room
- [ ] **Choose an AI provider and supply the API key** — blocks Phase 3.
      Decided: **Google Gemini**. Put the key in `escape-room/.env.local` as
      `GEMINI_API_KEY=` (gitignored; see `.env.example`), and in Vercel → Settings →
      Environment Variables for production. **Do not** prefix it `NEXT_PUBLIC_` — that
      would inline it into the client bundle for every player to read.
      Model choice is quota-driven, not quality-driven: `gemini-3.1-flash-lite` has
      **500 requests/day** vs `gemini-3.6-flash`'s **20/day**, and hints are short and
      heavily prompt-constrained. Note the account's **image models are all at 0 quota**
      except Imagen 4 (25/day), so AI art is not currently an option — which is fine,
      the room art is hand-drawn SVG.
- [x] ~~Fund a Celo Sepolia deployer key~~ — **done 2026-07-31**, 4 CELO from the faucet.
      Deployer key is reused from `Arcadia/arcadia-contracts/celo/.env`; note it is a
      **mainnet key holding ~0.97 real CELO**, so any mainnet broadcast is real money.
- [x] ~~Set up Vercel CD~~ — **done 2026-07-31** via Vercel's GitHub App; no secrets needed.
- [ ] **Fund the mainnet deployer wallet** and hold the settlement signer key. Signer key
      goes in a host env var (Vercel/Railway) and must **never** be committed.
- [ ] **Approve mainnet deployment** at Phase 7 — real money starts moving.
- [ ] **Provide a support channel** (Telegram recommended) and accept MiniPay's
      **24-hour critical-fix SLA**.
- [ ] **Approve ToS + Privacy Policy** text before ranked rooms open.
- [ ] **Test on a real Android device via ngrok** — MiniPay cannot be fully verified in
      Chrome device mode, and Claude has no device access.

---

## What has failed / been tried and abandoned

*(Append only — never delete. This is the record for future sessions.)*

- **2026-07-30 — `@celo/attribution-tags@^1.0.0` does not exist.** Latest published is
  **0.3.0**. Pinning 1.x failed install with ETARGET. Fixed by using `^0.3.0`.
- **2026-07-30 — Pinning exact devDependency versions failed.** `@types/react-dom@19.2.7`
  and others were invented and don't exist on npm. Switched tooling deps to caret ranges.
  Lesson: verify with `npm view <pkg> version` before pinning.
- **2026-07-30 — wagmi + RainbowKit abandoned deliberately.** Not a library failure but
  the wrong fit: it dragged in the Coinbase SDK → axios chain (30 vulnerabilities, 1
  critical) and ~430 extra packages for connector UI MiniPay never uses.
- **2026-07-30 — `PublicClient` type annotation broke typecheck.** viem's Celo chain client
  isn't assignable to the generic `PublicClient`. Fixed by letting the return type infer.
- **2026-07-30 — `pkill -f next-server` killed the agent's own shell** (exit 144). Use
  `setsid ... &` to start detached servers, and kill by PID from `ss -lptn`.
- **2026-07-31 — Stale `.next` chunks caused a 500 that looked like a code bug.** A
  surviving old `next-server` held port 3000 and served chunks from a previous build
  (`ChunkLoadError` / `MODULE_NOT_FOUND`). The new server then failed with EADDRINUSE,
  which was buried at the *top* of the log while the tail showed the misleading chunk
  error. Fix: kill the PID holding :3000, `rm -rf .next`, rebuild. Read the *head* of a
  server log, not just the tail.
- **2026-07-31 — First redaction test was over-strict and failed.** It asserted no puzzle
  `solution` string appears in the client view, but item-name solutions like
  `letter-opener` legitimately appear in object prose — *spotting the item is the puzzle*.
  Narrowed the assertion to code-style (numeric) answers, hint text, and graph fields.
- **2026-07-31 — `sed -i` truncated a Solidity file to 0 bytes, twice.** Both times it
  ran while `forge` had the file open, and both times the loss was silent — the next
  build failed with a confusing unrelated error. Abandoned `sed -i` for in-place edits
  in this repo; use the Edit tool or rewrite the whole file.
- **2026-07-31 — Foundry cheatcodes were consumed by inline `_sign(...)` arguments.**
  Solidity evaluates arguments before the call, and `_sign` makes an external call to
  `claimDigest`, so `vm.prank` / `vm.expectRevert` were spent on *that* call instead of
  on `claim`. Two scripted attempts to hoist the signature lines both put them in the
  wrong place. Fix: every signature is now built into a local **before** any cheatcode.
- **2026-07-31 — Vitest was running OpenZeppelin's Hardhat test suite.** Adding the
  Foundry submodule put ~1,600 `.test.js` files under `contracts/celo/lib/`, and with no
  vitest config the runner walked them all: 163 failing files and 45s runs, while our
  own 77 tests passed underneath. Fixed with `vitest.config.ts` scoping `include` to
  `{app,lib,server}`. Runs are back to 2s. **CI would have gone red on the next push.**
- **2026-07-31 — The celopedia skill's Sepolia token table is wrong for USDm.** It lists
  `0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80`, but that contract reports
  `symbol() = "cUSD"` / `name() = "Celo Dollar"`. The real Mento Dollar on Sepolia is
  `0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b`. Lesson: read every address back
  on-chain (`symbol`, `decimals`) before committing it — doc tables go stale.
  Also disproved the old code comment that CIP-64 adapters aren't deployed on testnet;
  they are, and are now wired in.
- **2026-07-31 — Rapid-fire `cast send` calls silently failed on nonce races.** Firing
  five transactions back to back, two returned non-zero with no useful output; retrying
  the same call individually succeeded. Don't infer a contract bug from a failed `cast
  send` in a loop — re-run it alone before debugging. Prefer `cast call` to read the
  revert reason, which returns the actual selector.
- **2026-07-31 — The first Deploy workflow run went red because no Vercel secrets
  existed.** A permanently red badge on a public repo reads as a broken project to a
  Proof of Ship judge, so the job now checks for credentials and skips with a notice
  instead. Applies to any CD added before its secrets are provisioned.
- **2026-07-31 — Could not mint a Vercel CI token programmatically.**
  `POST /v3/user/tokens` returns `forbidden: Cannot create tokens for this app` when
  authenticated with the CLI's OAuth token. The local CLI token in
  `~/.local/share/com.vercel.cli/auth.json` is *also* unusable as a CI secret: it is
  short-lived (the one seen expired the same day, and `expiresAt` is in **seconds**,
  not milliseconds — decoding it as ms gives a nonsense 1970 date). A long-lived token
  must be created by hand at vercel.com/account/tokens. Sidestepped entirely by using
  Vercel's GitHub App instead, which needs no token — so the Actions deploy workflow
  was deleted rather than left half-wired.
- **2026-07-31 — New Vercel projects are SSO-protected by default.** The first
  deployment returned **302 to `vercel.com/sso-api`**, not 200. A naive `curl -o
  /dev/null -w %{http_code}` smoke test against the *bare* project name would also have
  been misleading, because `escape-room.vercel.app` is an unrelated third party's
  p5.js app that returns a healthy 200. Lesson: when smoke-testing a deploy, assert on
  page *content* (title/markup), not just the status code, and confirm you're hitting
  your own alias.
- **2026-07-31 — `line-height: 1.22` is the floor for Fraunces headings.** At 1.12 the
  descenders (g/y/p) were sliced off the moment a heading wrapped to a second line —
  it looked like a z-index/overlap bug, and probing the DOM showed no overlap at all.
  Only cropping the element and *looking* at it revealed the real cause. Lesson: when
  a layout looks wrong but the geometry says it's fine, screenshot the element itself.
- **2026-07-31 — Next's dev overlay intercepts Playwright clicks.** `<nextjs-portal>`
  sits above the page and swallowed pointer events, so scripted playthroughs timed out
  on visible, enabled buttons. It also renders a stray "N" badge that looks like a UI
  bug in dev screenshots. Fix: run UI verification against `next build && next start`,
  which is more honest anyway.
- **2026-07-31 — Satori (`next/og`) requires explicit `display: flex`** on any div with
  more than one child, and does not support `<br>`. The build fails hard rather than
  degrading, so the OG route breaks the whole deploy if this is wrong.
- **2026-07-31 — 21st.dev MCP and the ui-ux-pro-max skill were both installed and only
  partly useful.** 21st connects fine, but its "themes" are generic shadcn/Tailwind
  token sets (`--primary`, `--sidebar-accent`…) with no atmosphere, and this project is
  deliberately plain CSS with no Tailwind — importing one would have fought the
  architecture for no gain. Its *component* catalogue is also paid. The ui-ux-pro-max
  skill's **data** (84 style specs with concrete CSS, 74 font pairings) was genuinely
  useful as reference — style #71 "Modern Dark (Cinema Mobile)" informed the token
  system — but its logo/icon generators need a `GEMINI_API_KEY` that isn't configured.
  Net: the design data helped, the component/theme fetching did not.
- **2026-07-31 — Two full UI directions were built and rejected before the right
  reference surfaced.** First a warm amber "Detective's Study" noir, then a light
  "paper & ink" scheme. Both were coherent; both were wrong. The user then supplied
  `heal-grow-ui-spec.md` + a reference screenshot, which specified the answer exactly
  (charcoal + cream illustration panels + serif display). **Lesson: when a user says
  the UI "looks AI generated", ask for a reference image or spec before designing.**
  Three passes of guessing cost far more than one question would have.
- **2026-07-31 — A stale file path sent me reading the wrong spec.** The first link
  pointed at `yieldscout-buildspec.md` (an unrelated hackathon spec); the intended
  file was `heal-grow-ui-spec.md`. Read the file *before* acting on it and sanity-check
  that its subject matches the conversation.
- **2026-07-31 — `cd` inside a Bash tool call persists across later calls.** After
  reading Arcadia's source I ran `npm run build` and spent time debugging a `/play`
  404 that did not exist — the build had run in `Arcadia/arcadia-frontend`, and its
  route table (`/games`, `/tournament`) was the giveaway. Use absolute paths, and if a
  build output looks like a different project, check `pwd` before debugging the code.
- **2026-08-01 — A percentage anchor cannot place a popover.** The first verb-popover
  attempt positioned it at the hotspot's `x`/`y` percentages with a magic
  `clamp(22, x, 78)`. It looked right for mid-scene objects and clipped badly for edge
  ones — the wall map's buttons ran **24px off the left of the stage** and the study
  door's ran off the bottom. The clamp cannot work because it doesn't know the
  popover's rendered width. Fix: `useLayoutEffect` measures `offsetWidth/Height`
  against the stage and clamps in px. **Lesson: anything whose size depends on its
  content has to be measured, not guessed at in CSS percentages.**
- **2026-08-01 — Verifying one element in three positions missed two bugs.** The first
  pass sampled 3 of 7 hotspots and reported "placement works". Driving *all* hotspots
  at two viewports is what surfaced the left-clip and bottom-overflow. For anything
  positioned relative to variable anchors, iterate every anchor.
- **2026-08-02 — `height: 100%` silently defeats `aspect-ratio`.** The first desktop
  room grid set `aspect-ratio: 400 / 340` *and* `height: 100%` on `.room-stage`. The
  explicit height wins, so the stage stayed the wrong shape and the art letterboxed
  by 123px — the aspect-ratio looked applied but did nothing. `width: 100%;
  height: auto; max-height: 100%` is what actually holds the ratio in a grid cell.
- **2026-08-02 — "Screenshot differs" is not proof of a regression.** The mobile
  landing PNG differed from its baseline by 2 bytes after the desktop change. Two
  runs of the *unchanged* build differed by the same amount — the page animates, so
  the capture is not deterministic. Before chasing a pixel diff, re-shoot the same
  build twice to establish the noise floor.
- **2026-08-02 — Capping a measure with `max-width` + `margin-inline: auto` centres
  the text away from its own heading.** Applied to `.lp-section > *`, the 62ch prose
  ended up horizontally centred in a 1040px column while its `h2` started at the left
  edge. Cap the section's *padding* instead: `padding-inline: max(pad, (100% - cap)/2)`
  keeps children left-aligned and the band full-bleed.

---

## Risks & things that can go wrong

- **An unsolvable generated room with real entry fees collected.** Worst failure in the
  system. `validateRoom()` now exists and gates on a solver walk, but it is only proven
  against hand-authored rooms — it must be run against *generated* rooms at scale in
  Phase 3, plus a manual kill-switch before mainnet.
- **Signing claims that exceed the day's pool.** `splitPool` is tested to sum exactly, but
  the on-chain `claim` must *also* revert on overdraw. Never trust one layer.
- **AI cost overrun.** Instrument cost-per-session from day one and cap turns per run.
- **Activity farming.** A tempting-but-wrong reading of Proof of Ship is "get users to
  send lots of cheap transactions and the leaderboard rewards it". The rubric
  (celopedia `references/proof-of-ship.md:121,135`) says the opposite: it combines
  Talent Protocol's on-chain score with a quality review and states you "cannot game
  one without the other" — strong on-chain activity with a weak product is *penalised*.
  What counts is "real on-chain fees paid by real users". So every player transaction
  we add must do a real job in the product. `checkIn` qualifies because it opens the
  ranked attempt; a bare streak-badge transaction would not.
- **Gambling framing.** Proof of Ship explicitly excludes gambling. Defence: fixed entry,
  no randomness in the payout split, skill-based outcome. Keep the mechanic *and the copy*
  on skill framing.
- **2 MB bundle cap.** 0.83 MB now with the room UI built, so there's headroom — but
  re-measure after the AI layer. CI gates this automatically.
- **In-memory session store is single-process.** Fine now; a second Railway replica would
  lose sessions. Must move to Postgres in Phase 5 before any real traffic.
- **3 npm vulnerabilities remain**, all inside Next.js's own build toolchain
  (sharp/postcss). Not runtime-exposed; no patched release fixes them yet. Recheck before
  submission.
- **Prompt injection.** Players will try to talk the NPC into revealing the solution. The
  engine boundary means the model *cannot* mutate state, and forbidden knowledge is
  filtered server-side — but this needs adversarial testing in Phase 3, not just a filter.
- **MiniPay can only be truly tested on a real device** via ngrok. Chrome device mode will
  miss real failures.

---

## Ideas to improve the project

- [x] ~~**Ship the practice room publicly now.**~~ **Done 2026-07-31** — live at
  https://escape-room-chi-five.vercel.app, no wallet or contract needed. It can now
  gather real feedback and D1 retention data while the economy is still being built.
  Next step on this thread: get it in front of actual players (and add art first —
  see the visual-identity item under "What's remaining").
- **Localisation.** MiniPay's core markets are Nigeria, Kenya, Brazil, Colombia,
  Philippines. Puzzle text *is* the game — early i18n scaffolding is far cheaper than
  retrofitting.
- **Room archive.** Doc 14 wants archived rooms to return in later seasons. The full puzzle
  graph is already stored, so this is nearly free.
- **AI Telegram support agent.** MiniPay's checklist recommends one for the 24h SLA. Also
  opens the Proof of Ship AI-agents prize pool ($1,000 USDT) if paired with ERC-8004 +
  Self Agent ID registration.
- **`/stats` as a credibility artifact.** MiniPay reviewers use it to judge promotion.
  Building it early — even with small numbers — reads better than a late scramble.
- **Ghost replays** (doc 11) are deferred, but the ordered event log is already recorded,
  so they're now cheap to add. It also strengthens anti-cheat.
- **More seed rooms.** One hand-authored room is a single point of failure for the AI
  fallback path. Two or three would make the fallback far more robust.
