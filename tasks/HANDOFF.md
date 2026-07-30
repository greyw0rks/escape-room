# Handoff — AI Escape Room (Celo MiniPay Mini App)

## Status snapshot
Last updated: 2026-07-30
Repo: `/home/greyw0rks/escape-room/` (was `Escape room` — renamed; the space broke tooling)
Plan: `/home/greyw0rks/.claude/plans/witty-scribbling-noodle.md`
Target: **Celo Proof of Ship** monthly sprint → **MiniPay Discovery listing**

Phase 1 of 7 complete. The app builds, all routes render, nothing is on-chain yet.

---

## What's done

- **Repo scaffolded.** Next.js 16.2.12 (app router) + React 19 + TypeScript. Design docs
  moved to `docs/`. Git initialised, first commit `523cb8d`.
- **celopedia-skill v2.6.0 installed** at `.claude/skills/celopedia-skill/` (36 references).
  Pulled from upstream `celo-org/celopedia-skills`, not copied from another local project.
- **Dropped wagmi/RainbowKit for plain viem.** The skill's scaffold guide is explicit that
  MiniPay needs no connector libraries — it uses `window.ethereum` directly. This cut
  **529 packages → 101** and removed the entire Coinbase-SDK→axios vulnerability tree.
- **Client JS is 0.83 MB** against MiniPay's hard 2 MB cap. Verified from the real build output.
- **MiniPay compliance layer built:**
  - `lib/minipay.ts` — `isMiniPay()` detection, ERC-8021 attribution via the official
    `@celo/attribution-tags` SDK (hostname-derived, SSR-guarded), Add Cash deeplink.
  - `lib/wallet.ts` — zero-click connect inside MiniPay; outside it only adopts an
    already-authorised account so a plain browser visit never pops a wallet.
  - `lib/identity.ts` — deterministic readable aliases ("Quiet Locksmith 4417") so no raw
    `0x…` address is ever shown as a player's identity.
  - `lib/contract.ts` — Celo chain config, stablecoin + CIP-64 feeCurrency addresses
    verified against the skill's `contracts.md`. Defaults to **testnet**.
- **Design system** (`app/globals.css`) — plain CSS custom properties, no Tailwind. Dark
  "dim room lit by one lamp" palette. Authored at 360×640.
- **Routes live, no dead links:** `/`, `/play/[sessionId]`, `/leaderboard`, `/stats`,
  `/legal`. All return 200.
- **Mobile verified by screenshot at 360×640** (Playwright): zero horizontal overflow on
  every page, and every tap target now clears 44px after a fix.

---

## What's remaining

- [ ] **Phase 2 — Game engine** (task #2). `server/` modules: room, puzzle DAG, inventory
      (8-slot cap), NPC (6 trust levels, 9 emotions), hints (5 levels), game master, scoring.
      One hand-authored seed room. No AI, no crypto. **This is where the game becomes fun.**
- [ ] **Phase 3 — AI layer** (task #3). Swappable gateway, intent parsing before narration,
      cached shared prompt prefix, injection filter, offline fallback. Then nightly room
      generation + the solvability validator.
- [ ] **Phase 4 — Contract** (task #4). `DailyRoomPool.sol` + Foundry tests. Deploy to
      Celo Sepolia, verify.
- [ ] **Phase 5 — Ranked loop** (task #5). Entry → session → server scoring → day close →
      signed claim. Anti-cheat.
- [ ] **Phase 6 — Listing surface** (task #6). Real leaderboard, `/stats` metrics, full
      ToS/Privacy, in-app support link.
- [ ] **Phase 7 — Mainnet + submission** (task #7).

---

## What Claude can do autonomously

- All of phases 2–6: engine, AI plumbing, contract + Foundry tests, API routes, UI.
- Deploy and verify on **Celo Sepolia** (testnet, free funds — no real money at risk).
- Run typecheck, Vitest, `forge test`, production builds, bundle-size checks.
- Screenshot-verify every screen at 360×640 and catch overflow / tap-target regressions.
- Commit continuously (Proof of Ship scores commit activity).

## What requires the human

- [ ] **Register on talent.app** for the current Proof of Ship campaign — hard gate,
      cannot be automated.
- [ ] **Create the public GitHub repo** and push. Currently local-only. Proof of Ship
      requires a public repo with verifiable commits.
- [ ] **Fund the mainnet deployer wallet** and hold the settlement signer key. Signer key
      goes in a host env var (Vercel/Railway) and must **never** be committed.
- [ ] **Choose an AI provider and supply the API key** (blocks Phase 3).
- [ ] **Approve mainnet deployment** when Phase 7 arrives — real money starts moving.
- [ ] **Provide a support channel** (Telegram recommended) and accept MiniPay's
      **24-hour critical-fix SLA**.
- [ ] **Approve ToS + Privacy Policy** text before ranked rooms open.

---

## What has failed / been tried and abandoned

*(Append only — never delete. This is the record for future sessions.)*

- **2026-07-30 — `@celo/attribution-tags@^1.0.0` does not exist.** Latest published is
  **0.3.0**. Pinning 1.x failed install with ETARGET. Fixed by using `^0.3.0`.
- **2026-07-30 — Pinning exact devDependency versions failed.** `@types/react-dom@19.2.7`
  and several others were invented and don't exist on npm. Switched tooling deps to caret
  ranges. Lesson: verify with `npm view <pkg> version` before pinning.
- **2026-07-30 — wagmi + RainbowKit abandoned deliberately.** Not a failure of the library
  but the wrong fit: it dragged in the Coinbase SDK → axios chain (30 vulnerabilities,
  1 critical) and ~430 extra packages for connector UI that MiniPay never uses. The
  celopedia scaffold reference confirms plain viem is the correct MiniPay approach.
- **2026-07-30 — `PublicClient` type annotation broke typecheck.** viem's Celo chain client
  isn't assignable to the generic `PublicClient` type (duplicate incompatible types).
  Fixed by letting the return type infer rather than annotating.
- **2026-07-30 — `pkill -f next-server` killed the agent's own shell** (exit 144). Use
  `setsid ... &` to start detached servers instead of pkill-then-restart.

---

## Risks & things that can go wrong

- **An unsolvable generated room with real entry fees collected.** Worst failure in the
  system — players pay, nobody can escape. Mitigation: the validator gate must prove a
  solver walk reaches escape *before* a room is ever published, plus a hand-authored
  fallback room and a manual kill-switch. Non-negotiable before mainnet.
- **Signing claims that exceed the day's prize pool.** Must be enforced *both* in the
  backend signer and on-chain (`claim` reverts on overdraw). Never trust one layer.
- **AI cost overrun.** A long conversation could cost more than the entry fee. Instrument
  cost-per-session from day one and cap turns per run.
- **Gambling framing.** Proof of Ship explicitly excludes gambling. The defence is that
  this is skill-based: fixed entry, no randomness in the payout split. Keep the mechanic
  *and the copy* on skill framing.
- **2 MB bundle cap.** Currently 0.83 MB with headroom, but the room UI is the biggest
  screen still to build. Framer Motion (suggested by doc 13) is heavy — prefer CSS
  animation. Re-measure after Phase 2.
- **3 npm vulnerabilities remain**, all inside Next.js's own build toolchain
  (sharp/postcss). Not runtime-exposed; no patched Next release fixes them yet. Recheck
  before submission.
- **Prompt injection.** Players will try to talk the NPC into revealing the solution.
  Filtering happens *before* the model call, and the model can never mutate game state —
  but this needs adversarial testing, not just a filter.
- **MiniPay can only be truly tested on a real device** via ngrok. Chrome device mode is
  not sufficient and will miss real failures.

---

## Ideas to improve the project

- **Ship the practice room publicly before ranked opens.** It needs no wallet and no
  contract, so it can gather real feedback and D1 retention data while the economy is
  still being built.
- **Localisation.** MiniPay's core markets are Nigeria, Kenya, Brazil, Colombia,
  Philippines. Puzzle text is the whole game — early i18n scaffolding would be far cheaper
  than retrofitting.
- **Room archive.** Doc 14 wants archived rooms to return in later seasons. Storing the
  full puzzle graph from day one makes that free later.
- **AI Telegram support agent.** MiniPay's listing checklist recommends one for meeting
  the 24h SLA. Also opens the Proof of Ship AI-agents prize pool ($1,000 USDT) if paired
  with ERC-8004 + Self Agent ID registration.
- **`/stats` as a credibility artifact.** MiniPay reviewers use it to judge promotion.
  Building it early — even with small numbers — reads better than a late scramble.
- **Ghost replays** (doc 11) are deferred, but recording the action log from day one costs
  almost nothing and makes them trivial to add later. It also strengthens anti-cheat.
