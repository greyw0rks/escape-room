/**
 * Host-based routing for the marketing/game split.
 *
 * One codebase serves two faces:
 *   - the marketing landing on the apex domain (escape-room.uno)
 *   - the game on a subdomain (game./app./celo.escape-room.uno)
 *
 * The logic lives here as pure functions so it can be unit-tested without the
 * edge runtime; `middleware.ts` is a thin wrapper that translates the decision
 * into a NextResponse.
 *
 * Until the real domain's DNS points at this deployment, every host that isn't
 * the apex or a game subdomain falls through as `next` and behaves exactly as
 * before — the current Vercel URL and `localhost` are unaffected. That is also
 * why nothing here is allowed to touch MiniPay's currently-listed URL.
 */

const APEX = process.env.NEXT_PUBLIC_APEX_HOST ?? "escape-room.uno";
const GAME_HOST = process.env.NEXT_PUBLIC_GAME_HOST ?? `game.${APEX}`;

// Subdomains that all resolve to the game, so pointing app. or celo. at this
// deployment Just Works without a code change. `game.` is canonical — apex game
// links redirect there.
const GAME_SUBDOMAINS = ["game", "app", "celo"];

// Routes that belong to the game rather than the marketing site. `/legal` is
// deliberately excluded: it must stay reachable from the landing's footer on the
// apex as well as inside the game.
const GAME_ROUTES = ["/play", "/stats", "/leaderboard"];

export type HostMode = "marketing" | "game" | "passthrough";

export type RouteDecision =
  | { action: "next" }
  | { action: "rewrite"; pathname: string }
  | { action: "redirect"; url: string };

/** Bare hostname, lowercased, port stripped. */
export function normalizeHost(raw: string | null | undefined): string {
  return (raw ?? "").split(":")[0].trim().toLowerCase();
}

export function classifyHost(host: string): HostMode {
  if (host === APEX || host === `www.${APEX}`) return "marketing";
  if (host === GAME_HOST) return "game";
  if (GAME_SUBDOMAINS.some((s) => host === `${s}.${APEX}`)) return "game";
  return "passthrough";
}

function isGameRoute(pathname: string): boolean {
  return GAME_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

/**
 * Decide what to do with a request, given its host and path.
 *
 *   marketing  →  `/` is the landing; game routes 307 to the canonical game host
 *   game       →  `/` rewrites to the Today feed so the subdomain root IS the game
 *   passthrough →  never touched (current Vercel domain, localhost, previews)
 */
export function routeForHost(
  host: string,
  pathname: string,
  search = ""
): RouteDecision {
  const mode = classifyHost(host);

  if (mode === "marketing") {
    if (isGameRoute(pathname)) {
      return {
        action: "redirect",
        url: `https://${GAME_HOST}${pathname}${search}`,
      };
    }
    return { action: "next" };
  }

  if (mode === "game") {
    if (pathname === "/") {
      return { action: "rewrite", pathname: "/play" };
    }
    return { action: "next" };
  }

  return { action: "next" };
}

export const _internal = { APEX, GAME_HOST, GAME_SUBDOMAINS, GAME_ROUTES };
