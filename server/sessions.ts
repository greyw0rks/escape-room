import type { RoomSession } from "./types";

/**
 * Session store.
 *
 * In-memory for now, mirroring Arcadia's pattern: the app must run without a
 * database so CI and local dev work with no external dependency. Phase 5 swaps
 * the backing store for Postgres without changing this interface.
 *
 * Sessions live server-side only — the client holds nothing but an id.
 */

const sessions = new Map<string, RoomSession>();

/** Ranked runs are one-per-wallet-per-day; this maps that key to its session id. */
const claimedRuns = new Map<string, string>();

export function putSession(session: RoomSession): void {
  sessions.set(session.id, session);
}

export function getSession(id: string): RoomSession | undefined {
  return sessions.get(id);
}

export function claimRun(key: string, sessionId: string): boolean {
  if (claimedRuns.has(key)) return false;
  claimedRuns.set(key, sessionId);
  return true;
}

export function existingRun(key: string): string | undefined {
  return claimedRuns.get(key);
}

/** Sessions are short-lived; drop anything long past its useful life. */
export function sweepStale(maxAgeMs: number = 3_600_000, now: number = Date.now()): number {
  let removed = 0;
  for (const [id, session] of sessions) {
    if (now - session.startedAt > maxAgeMs) {
      sessions.delete(id);
      removed++;
    }
  }
  return removed;
}

export function sessionCount(): number {
  return sessions.size;
}
