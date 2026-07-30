import type { Room, RoomSession, Puzzle, PuzzleState } from "./types";

/**
 * Puzzle graph logic.
 *
 * The validator here is the most important safety gate in the system: a daily room
 * that cannot be escaped, with real entry fees already collected, is the worst
 * possible failure. Nothing publishes without passing `validateRoom`.
 */

export function puzzleById(room: Room, id: string): Puzzle | undefined {
  return room.puzzles.find((p) => p.id === id);
}

/** A puzzle is reachable once every puzzle it depends on is solved. */
export function isReachable(room: Room, session: RoomSession, puzzleId: string): boolean {
  const puzzle = puzzleById(room, puzzleId);
  if (!puzzle) return false;
  return puzzle.dependsOn.every((dep) => session.puzzleStates[dep] === "solved");
}

export function isSolved(session: RoomSession, puzzleId: string): boolean {
  return session.puzzleStates[puzzleId] === "solved";
}

/** Puzzles the player can act on right now. Drives hint targeting. */
export function activePuzzles(room: Room, session: RoomSession): Puzzle[] {
  return room.puzzles.filter(
    (p) => !isSolved(session, p.id) && isReachable(room, session, p.id)
  );
}

export function progress(room: Room, session: RoomSession): number {
  if (room.puzzles.length === 0) return 0;
  const solved = room.puzzles.filter((p) => isSolved(session, p.id)).length;
  return solved / room.puzzles.length;
}

/** Answers are compared loosely — players shouldn't lose on spacing or case. */
export function normaliseAnswer(input: string): string {
  return input.trim().toLowerCase().replace(/[\s\-_]+/g, "");
}

export function checkSolution(puzzle: Puzzle, attempt: string): boolean {
  return normaliseAnswer(attempt) === normaliseAnswer(puzzle.solution);
}

/**
 * Mark a puzzle solved and apply its consequences (revealed objects, granted items).
 * Mutates the session — callers own persistence.
 */
export function solvePuzzle(room: Room, session: RoomSession, puzzleId: string): void {
  const puzzle = puzzleById(room, puzzleId);
  if (!puzzle || isSolved(session, puzzleId)) return;

  session.puzzleStates[puzzleId] = "solved";

  for (const objectId of puzzle.revealsObjects ?? []) {
    if (session.objectStates[objectId] === "hidden") {
      session.objectStates[objectId] = "visible";
    }
  }

  // Newly reachable puzzles surface as discovered so hints can target them.
  for (const other of room.puzzles) {
    if (
      session.puzzleStates[other.id] === "hidden" &&
      isReachable(room, session, other.id)
    ) {
      session.puzzleStates[other.id] = "discovered";
    }
  }
}

// ── Validation ─────────────────────────────────────────────────────────────

export interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
}

/**
 * Prove a room is solvable and free of soft-locks before it reaches players.
 *
 * `error` blocks publication outright. `warning` flags quality problems that
 * degrade the experience without making the room impossible.
 */
export function validateRoom(room: Room): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const err = (message: string) => issues.push({ severity: "error", message });
  const warn = (message: string) => issues.push({ severity: "warning", message });

  const puzzleIds = new Set(room.puzzles.map((p) => p.id));
  const objectIds = new Set(room.objects.map((o) => o.id));
  const itemIds = new Set(room.items.map((i) => i.id));

  if (!puzzleIds.has(room.escapePuzzleId)) {
    err(`escapePuzzleId "${room.escapePuzzleId}" does not exist`);
  }

  // Dangling references — each would strand the player at runtime.
  for (const p of room.puzzles) {
    for (const dep of p.dependsOn) {
      if (!puzzleIds.has(dep)) err(`puzzle "${p.id}" depends on unknown puzzle "${dep}"`);
    }
    for (const o of p.revealsObjects ?? []) {
      if (!objectIds.has(o)) err(`puzzle "${p.id}" reveals unknown object "${o}"`);
    }
    for (const i of p.yieldsItems ?? []) {
      if (!itemIds.has(i)) err(`puzzle "${p.id}" yields unknown item "${i}"`);
    }
    // Doc 3: every puzzle needs primary, supporting and confirmation clues.
    if (p.clues.length < 3) {
      warn(`puzzle "${p.id}" has ${p.clues.length} clues; doc 3 requires at least 3`);
    }
    if (!p.clues.some((c) => c.role === "primary")) {
      warn(`puzzle "${p.id}" has no primary clue`);
    }
    if (p.solution.trim() === "") err(`puzzle "${p.id}" has an empty solution`);
  }

  for (const o of room.objects) {
    if (o.requiresItem && !itemIds.has(o.requiresItem)) {
      err(`object "${o.id}" requires unknown item "${o.requiresItem}"`);
    }
    if (o.requiresPuzzle && !puzzleIds.has(o.requiresPuzzle)) {
      err(`object "${o.id}" requires unknown puzzle "${o.requiresPuzzle}"`);
    }
    if (o.solvesPuzzle && !puzzleIds.has(o.solvesPuzzle)) {
      err(`object "${o.id}" solves unknown puzzle "${o.solvesPuzzle}"`);
    }
    for (const y of o.yields ?? []) {
      if (!itemIds.has(y)) err(`object "${o.id}" yields unknown item "${y}"`);
    }
    for (const r of o.reveals ?? []) {
      if (!objectIds.has(r)) err(`object "${o.id}" reveals unknown object "${r}"`);
    }
  }

  for (const c of room.combinations) {
    for (const input of c.inputs) {
      if (!itemIds.has(input)) err(`combination input "${input}" is not a known item`);
    }
    if (!itemIds.has(c.output)) err(`combination output "${c.output}" is not a known item`);
  }

  // A cycle means a set of puzzles can never be entered.
  const cycle = findCycle(room);
  if (cycle) err(`puzzle dependency cycle: ${cycle.join(" -> ")}`);

  // The decisive check: can a perfect solver actually get out?
  if (!issues.some((i) => i.severity === "error")) {
    const walk = solverWalk(room);
    if (!walk.escaped) {
      err(
        `room is not solvable — solver stalled with ${walk.solved.length}/${room.puzzles.length} ` +
          `puzzles solved (unreachable: ${walk.unreachable.join(", ") || "none"})`
      );
    }
  }

  // Every puzzle should matter. An unreachable non-escape puzzle is dead content.
  const reachableAll = solverWalk(room).solved;
  for (const p of room.puzzles) {
    if (!reachableAll.includes(p.id)) {
      warn(`puzzle "${p.id}" is never reachable`);
    }
  }

  return issues;
}

export function isPublishable(room: Room): boolean {
  return !validateRoom(room).some((i) => i.severity === "error");
}

function findCycle(room: Room): string[] | null {
  const visiting = new Set<string>();
  const done = new Set<string>();
  const stack: string[] = [];

  const visit = (id: string): string[] | null => {
    if (done.has(id)) return null;
    if (visiting.has(id)) return [...stack.slice(stack.indexOf(id)), id];

    visiting.add(id);
    stack.push(id);
    for (const dep of puzzleById(room, id)?.dependsOn ?? []) {
      const found = visit(dep);
      if (found) return found;
    }
    stack.pop();
    visiting.delete(id);
    done.add(id);
    return null;
  };

  for (const p of room.puzzles) {
    const found = visit(p.id);
    if (found) return found;
  }
  return null;
}

interface SolverWalk {
  escaped: boolean;
  solved: string[];
  unreachable: string[];
}

/**
 * Simulate a perfect player: repeatedly solve every puzzle whose dependencies are
 * met, until nothing new opens up. If the escape puzzle is never solved, the room
 * is unwinnable and must not publish.
 */
function solverWalk(room: Room): SolverWalk {
  const solved = new Set<string>();
  let advanced = true;

  while (advanced) {
    advanced = false;
    for (const p of room.puzzles) {
      if (solved.has(p.id)) continue;
      if (p.dependsOn.every((d) => solved.has(d))) {
        solved.add(p.id);
        advanced = true;
      }
    }
  }

  return {
    escaped: solved.has(room.escapePuzzleId),
    solved: [...solved],
    unreachable: room.puzzles.filter((p) => !solved.has(p.id)).map((p) => p.id),
  };
}
