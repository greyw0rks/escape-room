import { describe, it, expect } from "vitest";
import { validateRoom, isPublishable, solvePuzzle, activePuzzles, checkSolution, normaliseAnswer } from "../puzzle";
import { newSession } from "../room";
import { cartographersStudy } from "../rooms/cartographers-study";
import type { Room } from "../types";

const clone = (): Room => structuredClone(cartographersStudy);

describe("seed room", () => {
  it("passes validation with no errors", () => {
    const issues = validateRoom(cartographersStudy);
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
  });

  it("is publishable", () => {
    expect(isPublishable(cartographersStudy)).toBe(true);
  });

  it("has no validation warnings either", () => {
    // The seed room is also the fallback room, so it should be exemplary.
    expect(validateRoom(cartographersStudy)).toEqual([]);
  });
});

describe("validateRoom catches unshippable rooms", () => {
  it("rejects an unreachable escape puzzle", () => {
    const room = clone();
    // Make the escape depend on a puzzle that nothing can ever solve, via a
    // second puzzle that depends on the escape itself.
    room.puzzles.push({
      id: "orphan",
      name: "Orphan",
      objective: "unreachable",
      state: "hidden",
      dependsOn: ["open-door"],
      solution: "x",
      clues: [],
      hints: ["", "", "", "", ""],
    });
    room.puzzles.find((p) => p.id === "open-door")!.dependsOn = ["orphan"];

    const errors = validateRoom(room).filter((i) => i.severity === "error");
    expect(errors.length).toBeGreaterThan(0);
    expect(isPublishable(room)).toBe(false);
  });

  it("detects a dependency cycle", () => {
    const room = clone();
    room.puzzles.find((p) => p.id === "open-drawer")!.dependsOn = ["crack-safe"];

    const errors = validateRoom(room).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.message.includes("cycle"))).toBe(true);
  });

  it("catches a puzzle depending on a puzzle that does not exist", () => {
    const room = clone();
    room.puzzles[0].dependsOn = ["ghost-puzzle"];

    const errors = validateRoom(room).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.message.includes("ghost-puzzle"))).toBe(true);
  });

  it("catches an object yielding an item that does not exist", () => {
    const room = clone();
    room.objects.find((o) => o.id === "safe")!.yields = ["imaginary-key"];

    const errors = validateRoom(room).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.message.includes("imaginary-key"))).toBe(true);
  });

  it("catches an empty solution", () => {
    const room = clone();
    room.puzzles[0].solution = "   ";

    const errors = validateRoom(room).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.message.includes("empty solution"))).toBe(true);
  });

  it("warns when a puzzle has fewer than three clues", () => {
    const room = clone();
    room.puzzles[0].clues = room.puzzles[0].clues.slice(0, 2);

    const warnings = validateRoom(room).filter((i) => i.severity === "warning");
    expect(warnings.some((w) => w.message.includes("at least 3"))).toBe(true);
    // Thin clues degrade quality but don't make the room unwinnable.
    expect(isPublishable(room)).toBe(true);
  });
});

describe("puzzle progression", () => {
  it("gates the safe behind both the drawer and the globe", () => {
    const room = cartographersStudy;
    const session = newSession(room, "practice", null, "s1");

    expect(activePuzzles(room, session).map((p) => p.id).sort()).toEqual([
      "open-drawer",
      "read-globe",
    ]);

    solvePuzzle(room, session, "open-drawer");
    // One dependency met is not enough.
    expect(activePuzzles(room, session).map((p) => p.id)).not.toContain("crack-safe");

    solvePuzzle(room, session, "read-globe");
    expect(activePuzzles(room, session).map((p) => p.id)).toContain("crack-safe");
  });

  it("does not open the door until the safe is cracked", () => {
    const room = cartographersStudy;
    const session = newSession(room, "practice", null, "s2");

    solvePuzzle(room, session, "open-drawer");
    solvePuzzle(room, session, "read-globe");
    expect(activePuzzles(room, session).map((p) => p.id)).not.toContain("open-door");

    solvePuzzle(room, session, "crack-safe");
    expect(activePuzzles(room, session).map((p) => p.id)).toContain("open-door");
  });

  it("solving the same puzzle twice is a no-op", () => {
    const room = cartographersStudy;
    const session = newSession(room, "practice", null, "s3");

    solvePuzzle(room, session, "open-drawer");
    const after = { ...session.puzzleStates };
    solvePuzzle(room, session, "open-drawer");
    expect(session.puzzleStates).toEqual(after);
  });
});

describe("answer checking", () => {
  it("ignores case, spacing and separators", () => {
    expect(normaliseAnswer(" 47-12 ")).toBe("4712");
    expect(normaliseAnswer("Brass_Key")).toBe("brasskey");
  });

  it("accepts the safe code in forgiving formats", () => {
    const safe = cartographersStudy.puzzles.find((p) => p.id === "crack-safe")!;
    expect(checkSolution(safe, "4712")).toBe(true);
    expect(checkSolution(safe, " 47 12 ")).toBe(true);
    expect(checkSolution(safe, "4713")).toBe(false);
  });
});
