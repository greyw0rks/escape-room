import { describe, it, expect } from "vitest";
import { scoreSession, rank, splitPool, compareEntries, type LeaderboardEntry } from "../scoring";
import { newSession } from "../room";
import { solvePuzzle } from "../puzzle";
import { cartographersStudy } from "../rooms/cartographers-study";

const room = cartographersStudy;

function escapedSession(opts: {
  elapsedSec: number;
  hints?: Record<string, number>;
  wrong?: number;
  secrets?: string[];
}) {
  const s = newSession(room, "ranked", "0xabc", "s1", 0);
  s.escaped = true;
  s.endedAt = opts.elapsedSec * 1000;
  s.hintLevels = opts.hints ?? {};
  s.wrongAttempts = opts.wrong ?? 0;
  s.secretsFound = opts.secrets ?? [];
  return s;
}

describe("scoreSession", () => {
  it("gives a perfect fast run close to the maximum", () => {
    const score = scoreSession(room, escapedSession({ elapsedSec: 0 }));
    expect(score.total).toBe(1000);
  });

  it("penalises a slow run but still rewards escaping", () => {
    const fast = scoreSession(room, escapedSession({ elapsedSec: 60 }));
    const slow = scoreSession(room, escapedSession({ elapsedSec: 400 }));
    expect(fast.total).toBeGreaterThan(slow.total);
    expect(slow.escape).toBe(300);
  });

  it("ranks a careful slow player above a sloppy fast one", () => {
    // Doc 10: reasoning must outweigh raw speed.
    const sloppyFast = scoreSession(
      room,
      escapedSession({ elapsedSec: 60, wrong: 10, hints: { a: 5, b: 3 } })
    );
    const carefulSlow = scoreSession(room, escapedSession({ elapsedSec: 300 }));
    expect(carefulSlow.total).toBeGreaterThan(sloppyFast.total);
  });

  it("never returns a negative component for extreme hint or error counts", () => {
    const s = scoreSession(
      room,
      escapedSession({ elapsedSec: 480, wrong: 999, hints: { a: 99 } })
    );
    expect(s.accuracy).toBe(0);
    expect(s.independence).toBe(0);
    expect(s.total).toBeGreaterThanOrEqual(0);
  });

  it("adds a bonus per secret found", () => {
    const none = scoreSession(room, escapedSession({ elapsedSec: 100 }));
    const two = scoreSession(
      room,
      escapedSession({ elapsedSec: 100, secrets: ["s1", "s2"] })
    );
    expect(two.total - none.total).toBe(50);
  });

  it("awards partial credit for progress when the player fails to escape", () => {
    const s = newSession(room, "ranked", "0xabc", "s2", 0);
    s.endedAt = 480_000;
    solvePuzzle(room, s, "open-drawer");
    solvePuzzle(room, s, "read-globe");

    const score = scoreSession(room, s);
    expect(score.total).toBeGreaterThan(0);
    expect(score.total).toBeLessThan(300);
    expect(score.speed).toBe(0);
  });

  it("scores a run with zero progress at zero", () => {
    const s = newSession(room, "ranked", "0xabc", "s3", 0);
    s.endedAt = 480_000;
    expect(scoreSession(room, s).total).toBe(0);
  });
});

describe("tie-breaking", () => {
  const base = { score: 900, hintsUsed: 2, elapsedSec: 200, finishedAt: 1000 };

  it("orders by score first", () => {
    const a: LeaderboardEntry = { ...base, player: "a", score: 800 };
    const b: LeaderboardEntry = { ...base, player: "b", score: 900 };
    expect(rank([a, b])[0].player).toBe("b");
  });

  it("breaks a score tie on fewer hints", () => {
    const a: LeaderboardEntry = { ...base, player: "a", hintsUsed: 5 };
    const b: LeaderboardEntry = { ...base, player: "b", hintsUsed: 1 };
    expect(rank([a, b])[0].player).toBe("b");
  });

  it("breaks a score+hint tie on shorter time", () => {
    const a: LeaderboardEntry = { ...base, player: "a", elapsedSec: 300 };
    const b: LeaderboardEntry = { ...base, player: "b", elapsedSec: 100 };
    expect(rank([a, b])[0].player).toBe("b");
  });

  it("breaks a total tie on the earlier finish timestamp", () => {
    const a: LeaderboardEntry = { ...base, player: "a", finishedAt: 5000 };
    const b: LeaderboardEntry = { ...base, player: "b", finishedAt: 2000 };
    expect(rank([a, b])[0].player).toBe("b");
  });

  it("is a total order — identical entries compare equal", () => {
    const a: LeaderboardEntry = { ...base, player: "a" };
    expect(compareEntries(a, { ...a })).toBe(0);
  });
});

describe("splitPool", () => {
  const entries = (n: number): LeaderboardEntry[] =>
    Array.from({ length: n }, (_, i) => ({
      player: `0x${i}`,
      score: 1000 - i,
      hintsUsed: 0,
      elapsedSec: 100 + i,
      finishedAt: 1000 + i,
    }));

  it("distributes exactly the pool, never more", () => {
    // Over-distributing would make the on-chain claim insolvent.
    for (const n of [1, 2, 7, 13, 100, 137]) {
      const pool = 1_000_000n;
      const payouts = splitPool(rank(entries(n)), pool);
      const sum = payouts.reduce((s, p) => s + p.amount, 0n);
      expect(sum).toBe(pool);
    }
  });

  it("handles a pool that does not divide evenly", () => {
    const pool = 1_000_003n;
    const payouts = splitPool(rank(entries(7)), pool);
    expect(payouts.reduce((s, p) => s + p.amount, 0n)).toBe(pool);
  });

  it("pays the whole pool to the only player", () => {
    const payouts = splitPool(rank(entries(1)), 500n);
    expect(payouts).toHaveLength(1);
    expect(payouts[0].amount).toBe(500n);
  });

  it("pays better ranks at least as much as worse ranks", () => {
    const payouts = splitPool(rank(entries(100)), 1_000_000n);
    for (let i = 1; i < payouts.length; i++) {
      expect(payouts[i - 1].amount).toBeGreaterThanOrEqual(payouts[i].amount);
    }
  });

  it("pays nobody below the 25% cutoff", () => {
    const payouts = splitPool(rank(entries(100)), 1_000_000n);
    expect(payouts.length).toBeLessThanOrEqual(25);
  });

  it("returns nothing for an empty board or an empty pool", () => {
    expect(splitPool([], 1000n)).toEqual([]);
    expect(splitPool(rank(entries(5)), 0n)).toEqual([]);
  });
});
