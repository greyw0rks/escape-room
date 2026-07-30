import type { Room, RoomSession } from "./types";
import { hintsUsed } from "./hints";

/**
 * Scoring.
 *
 * Doc 10: "the algorithm should prioritise reasoning over speed alone" — a fast but
 * sloppy run must lose to a careful one. Speed is capped at 40% of the total so it
 * can never dominate accuracy and independent thinking.
 *
 * All inputs are server-measured. The client's clock is display only.
 */

export const MAX_SCORE = 1000;

const WEIGHT = {
  escape: 300, // getting out at all
  speed: 400, // how much time was left
  accuracy: 200, // wrong attempts
  independence: 100, // hints not taken
} as const;

/** Wrong attempts before the accuracy component bottoms out. */
const ACCURACY_FLOOR = 10;
/** Hints before the independence component bottoms out. */
const HINT_FLOOR = 8;

export interface ScoreBreakdown {
  total: number;
  escape: number;
  speed: number;
  accuracy: number;
  independence: number;
  secrets: number;
  elapsedSec: number;
  hintsUsed: number;
  wrongAttempts: number;
}

/** Each secret found adds a flat bonus on top of the base score. */
const SECRET_BONUS = 25;

export function scoreSession(room: Room, session: RoomSession): ScoreBreakdown {
  const endedAt = session.endedAt ?? Date.now();
  const elapsedSec = Math.max(0, Math.round((endedAt - session.startedAt) / 1000));
  const hints = hintsUsed(session);
  const wrong = session.wrongAttempts;

  // A run that never escaped scores only partial credit for progress made.
  if (!session.escaped) {
    const solved = room.puzzles.filter((p) => session.puzzleStates[p.id] === "solved").length;
    const partial = room.puzzles.length
      ? Math.round((solved / room.puzzles.length) * WEIGHT.escape)
      : 0;
    return {
      total: partial,
      escape: partial,
      speed: 0,
      accuracy: 0,
      independence: 0,
      secrets: 0,
      elapsedSec,
      hintsUsed: hints,
      wrongAttempts: wrong,
    };
  }

  const timeRemaining = Math.max(0, room.timeLimitSec - elapsedSec);
  const speed = Math.round((timeRemaining / room.timeLimitSec) * WEIGHT.speed);

  const accuracy = Math.round(
    (Math.max(0, ACCURACY_FLOOR - wrong) / ACCURACY_FLOOR) * WEIGHT.accuracy
  );

  const independence = Math.round(
    (Math.max(0, HINT_FLOOR - hints) / HINT_FLOOR) * WEIGHT.independence
  );

  const secrets = session.secretsFound.length * SECRET_BONUS;

  return {
    total: WEIGHT.escape + speed + accuracy + independence + secrets,
    escape: WEIGHT.escape,
    speed,
    accuracy,
    independence,
    secrets,
    elapsedSec,
    hintsUsed: hints,
    wrongAttempts: wrong,
  };
}

// ── Ranking ────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  player: string;
  score: number;
  hintsUsed: number;
  elapsedSec: number;
  /** ms epoch — the final tie-break, so an earlier finisher wins a dead heat. */
  finishedAt: number;
}

/**
 * Doc 11's tie-break order, exactly:
 *   1. higher score
 *   2. fewer hints
 *   3. shorter completion time
 *   4. earlier completion timestamp
 */
export function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.hintsUsed !== b.hintsUsed) return a.hintsUsed - b.hintsUsed;
  if (a.elapsedSec !== b.elapsedSec) return a.elapsedSec - b.elapsedSec;
  return a.finishedAt - b.finishedAt;
}

export function rank(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort(compareEntries);
}

// ── Prize pool split ───────────────────────────────────────────────────────

/**
 * Doc 11's daily tiers: top 1% / 10% / 25% take progressively smaller shares.
 * Within a tier every player receives an equal amount, so the split is fully
 * explainable to a player — which doc 10 requires ("users should always
 * understand how their reward was calculated").
 */
const TIERS = [
  { topFraction: 0.01, poolShare: 0.4 },
  { topFraction: 0.1, poolShare: 0.35 },
  { topFraction: 0.25, poolShare: 0.25 },
] as const;

export interface Payout {
  player: string;
  /** Smallest token unit. */
  amount: bigint;
  rank: number;
}

/**
 * Split `pool` across ranked finishers. Uses integer arithmetic throughout and
 * assigns any remainder to the top finisher, so the sum of payouts is always
 * exactly `pool` — never a wei more, which would make the on-chain claim insolvent.
 */
export function splitPool(ranked: LeaderboardEntry[], pool: bigint): Payout[] {
  if (ranked.length === 0 || pool <= 0n) return [];

  // Assign each finisher to the best tier they qualify for.
  const cutoffs = TIERS.map((t) =>
    Math.max(1, Math.floor(ranked.length * t.topFraction))
  );

  const buckets: LeaderboardEntry[][] = TIERS.map(() => []);
  ranked.forEach((entry, index) => {
    for (let t = 0; t < TIERS.length; t++) {
      if (index < cutoffs[t]) {
        buckets[t].push(entry);
        return;
      }
    }
  });

  // Tiers with nobody in them would strand their share, so redistribute it.
  const activeTiers = TIERS.map((t, i) => ({ ...t, members: buckets[i] })).filter(
    (t) => t.members.length > 0
  );
  const totalShare = activeTiers.reduce((s, t) => s + t.poolShare, 0);

  const payouts: Payout[] = [];
  let distributed = 0n;

  for (const tier of activeTiers) {
    // Scale by 1e6 to keep the share ratio in integer maths.
    const scaled = BigInt(Math.round((tier.poolShare / totalShare) * 1_000_000));
    const tierPool = (pool * scaled) / 1_000_000n;
    const each = tierPool / BigInt(tier.members.length);

    for (const member of tier.members) {
      payouts.push({
        player: member.player,
        amount: each,
        rank: ranked.indexOf(member) + 1,
      });
      distributed += each;
    }
  }

  // Integer division always leaves dust. Give it to first place.
  const dust = pool - distributed;
  if (dust > 0n && payouts.length > 0) payouts[0].amount += dust;

  return payouts.sort((a, b) => a.rank - b.rank);
}
