import type { Room, RoomSession, SessionMode } from "./types";
import { activePuzzles, isSolved } from "./puzzle";

/**
 * Hints.
 *
 * Doc 8's rule: a hint changes what the player *notices*, it does not hand over the
 * answer. Levels escalate observation → focus → connection → reasoning → solution.
 * Level 5 (the outright answer) is Practice-only — revealing it in Ranked would
 * destroy leaderboard integrity.
 */

export const MAX_HINT_LEVEL = 5;
/** Ranked players can climb to reasoning, never to the answer. */
export const MAX_RANKED_HINT_LEVEL = 4;

export function maxHintLevel(mode: SessionMode): number {
  return mode === "practice" ? MAX_HINT_LEVEL : MAX_RANKED_HINT_LEVEL;
}

export type HintResult =
  | { ok: true; level: number; text: string; puzzleId: string }
  | { ok: false; reason: "nothing_active" | "exhausted" };

/**
 * Give the next hint for whichever unsolved puzzle the player is closest to.
 * Targets the puzzle with the most hints already taken, so a player working a
 * specific problem keeps getting deeper help on *that* problem rather than being
 * bounced between puzzles.
 */
export function nextHint(
  room: Room,
  session: RoomSession,
  mode: SessionMode
): HintResult {
  const candidates = activePuzzles(room, session);
  if (candidates.length === 0) return { ok: false, reason: "nothing_active" };

  const ceiling = maxHintLevel(mode);
  const target = candidates
    .filter((p) => (session.hintLevels[p.id] ?? 0) < ceiling)
    .sort((a, b) => (session.hintLevels[b.id] ?? 0) - (session.hintLevels[a.id] ?? 0))[0];

  if (!target) return { ok: false, reason: "exhausted" };

  const level = (session.hintLevels[target.id] ?? 0) + 1;
  session.hintLevels[target.id] = level;

  return { ok: true, level, text: target.hints[level - 1], puzzleId: target.id };
}

/** Total hints taken across the run — the number scoring penalises. */
export function hintsUsed(session: RoomSession): number {
  return Object.values(session.hintLevels).reduce((sum, level) => sum + level, 0);
}

/**
 * Doc 8: detect a stuck player rather than nagging on a fixed timer. Some players
 * explore deliberately, so we require both silence *and* a lack of progress.
 */
export function looksStuck(session: RoomSession, now: number): boolean {
  const IDLE_MS = 90_000;
  const last = session.events[session.events.length - 1];
  if (!last) return false;

  const idleFor = now - (session.startedAt + last.at);
  if (idleFor < IDLE_MS) return false;

  // Repeating the same action is a stronger signal than silence alone.
  const recent = session.events.slice(-5);
  const repeating =
    recent.length === 5 && new Set(recent.map((e) => e.detail)).size <= 2;

  return idleFor > IDLE_MS * 2 || repeating;
}

/** Puzzles the player has open but not yet cracked — used to personalise guidance. */
export function unsolvedNames(room: Room, session: RoomSession): string[] {
  return room.puzzles.filter((p) => !isSolved(session, p.id)).map((p) => p.name);
}
