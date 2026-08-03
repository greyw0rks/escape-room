import { NextResponse, type NextRequest } from "next/server";
import { normalizeHost, routeForHost } from "@/lib/hostRouting";

/**
 * Translates the host-routing decision (see `lib/hostRouting.ts`) into a
 * response. Kept deliberately thin — all the logic that's worth testing lives
 * in the pure module.
 *
 * The matcher skips Next internals and static assets so this only runs on real
 * page navigations, which keeps the edge cost negligible.
 *
 * Uses Next 16's `proxy` convention (the renamed `middleware`); the request/
 * response API is identical.
 */
export function proxy(req: NextRequest) {
  const host = normalizeHost(req.headers.get("host"));
  const { pathname, search } = req.nextUrl;

  const decision = routeForHost(host, pathname, search);

  if (decision.action === "redirect") {
    return NextResponse.redirect(decision.url, 307);
  }
  if (decision.action === "rewrite") {
    const url = req.nextUrl.clone();
    url.pathname = decision.pathname;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals, the API, and files with an extension
  // (favicon, icons, OG image, robots, etc.).
  matcher: ["/((?!_next/|api/|.*\\.[^/]+$).*)"],
};
