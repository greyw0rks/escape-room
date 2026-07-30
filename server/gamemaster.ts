import type { Room, RoomSession, Action, SessionMode } from "./types";
import { validateAction, objectById, recordEvent, isExpired } from "./room";
import { solvePuzzle, checkSolution, puzzleById, normaliseAnswer } from "./puzzle";
import { giveItem } from "./inventory";
import { applySocialEffect } from "./npc";

/**
 * The Game Master: the single place a player action changes the world.
 *
 * Doc 12's boundary — the engine decides, the AI only narrates the decision.
 * Nothing in the AI layer may call into here; it receives the outcome and
 * describes it. That keeps state changes unreachable by prompt injection.
 */

export interface ActionOutcome {
  ok: boolean;
  /** Machine-readable result the AI layer turns into prose. */
  effect:
    | "inspected"
    | "opened"
    | "took_item"
    | "revealed"
    | "solved_puzzle"
    | "escaped"
    | "refused"
    | "wrong_code"
    | "expired";
  /** Plain fallback text, used when the AI provider is unavailable. */
  text: string;
  itemsGained?: string[];
  objectsRevealed?: string[];
  puzzleSolved?: string;
  escaped?: boolean;
}

const REFUSALS: Record<string, string> = {
  unknown_object: "There's nothing like that here.",
  not_visible: "You can't see anything like that yet.",
  impossible_action: "That won't work on this.",
  requires_item: "You'll need something to do that.",
  requires_puzzle: "Something else has to happen first.",
  already_done: "You've already dealt with that.",
};

export function performAction(
  room: Room,
  session: RoomSession,
  objectId: string,
  action: Action,
  now: number = Date.now()
): ActionOutcome {
  if (session.endedAt !== null) {
    return { ok: false, effect: "expired", text: "This run is already over." };
  }
  if (isExpired(room, session, now)) {
    endSession(session, false, now);
    return { ok: false, effect: "expired", text: "The clock has run out." };
  }

  const verdict = validateAction(room, session, objectId, action);
  if (!verdict.allowed) {
    recordEvent(session, "fail", `${action}:${objectId}:${verdict.reason}`, now);
    return { ok: false, effect: "refused", text: REFUSALS[verdict.reason] };
  }

  const object = verdict.object;
  recordEvent(session, "action", `${action}:${objectId}`, now);

  const itemsGained: string[] = [];
  const objectsRevealed: string[] = [];

  // Inspecting alone never changes the world — it's the safe, free action.
  if (action === "inspect" || action === "read" || action === "listen") {
    if (session.objectStates[objectId] === "visible") {
      session.objectStates[objectId] = "inspected";
    }
    return { ok: true, effect: "inspected", text: object.description };
  }

  // An object guarded by a code can't be opened by acting on it directly.
  if (object.acceptsCode) {
    return {
      ok: false,
      effect: "refused",
      text: "It needs a code. What do you want to enter?",
    };
  }

  session.objectStates[objectId] = "modified";

  for (const revealed of object.reveals ?? []) {
    if (session.objectStates[revealed] === "hidden") {
      session.objectStates[revealed] = "visible";
      objectsRevealed.push(revealed);
    }
  }

  for (const itemId of object.yields ?? []) {
    if (giveItem(room, session, itemId).ok) itemsGained.push(itemId);
  }

  let puzzleSolved: string | undefined;
  let escaped = false;

  if (object.solvesPuzzle && session.puzzleStates[object.solvesPuzzle] !== "solved") {
    solvePuzzle(room, session, object.solvesPuzzle);
    puzzleSolved = object.solvesPuzzle;
    recordEvent(session, "solve", object.solvesPuzzle, now);

    for (const itemId of puzzleById(room, object.solvesPuzzle)?.yieldsItems ?? []) {
      if (giveItem(room, session, itemId).ok) itemsGained.push(itemId);
    }

    if (object.solvesPuzzle === room.escapePuzzleId) {
      escaped = true;
      endSession(session, true, now);
    }
  }

  return {
    ok: true,
    effect: escaped ? "escaped" : puzzleSolved ? "solved_puzzle" : itemsGained.length ? "took_item" : "opened",
    text: object.descriptionAfter ?? object.description,
    itemsGained,
    objectsRevealed,
    puzzleSolved,
    escaped,
  };
}

/** Entering a code into a keypad, dial or lock. */
export function submitCode(
  room: Room,
  session: RoomSession,
  objectId: string,
  code: string,
  now: number = Date.now()
): ActionOutcome {
  if (session.endedAt !== null || isExpired(room, session, now)) {
    return { ok: false, effect: "expired", text: "The clock has run out." };
  }

  const object = objectById(room, objectId);
  if (!object?.acceptsCode) {
    return { ok: false, effect: "refused", text: "There's nothing to enter a code into." };
  }

  const verdict = validateAction(room, session, objectId, "insert");
  if (!verdict.allowed) {
    return { ok: false, effect: "refused", text: REFUSALS[verdict.reason] };
  }

  if (normaliseAnswer(code) !== normaliseAnswer(object.acceptsCode)) {
    session.wrongAttempts += 1;
    recordEvent(session, "fail", `code:${objectId}:${normaliseAnswer(code)}`, now);
    return { ok: false, effect: "wrong_code", text: "Nothing happens." };
  }

  session.objectStates[objectId] = "solved";
  recordEvent(session, "solve", `code:${objectId}`, now);

  const itemsGained: string[] = [];
  for (const itemId of object.yields ?? []) {
    if (giveItem(room, session, itemId).ok) itemsGained.push(itemId);
  }

  let puzzleSolved: string | undefined;
  let escaped = false;

  if (object.solvesPuzzle) {
    solvePuzzle(room, session, object.solvesPuzzle);
    puzzleSolved = object.solvesPuzzle;
    for (const itemId of puzzleById(room, object.solvesPuzzle)?.yieldsItems ?? []) {
      if (giveItem(room, session, itemId).ok) itemsGained.push(itemId);
    }
    if (object.solvesPuzzle === room.escapePuzzleId) {
      escaped = true;
      endSession(session, true, now);
    }
  }

  return {
    ok: true,
    effect: escaped ? "escaped" : "solved_puzzle",
    text: object.descriptionAfter ?? "It opens.",
    itemsGained,
    puzzleSolved,
    escaped,
  };
}

/**
 * Talking to an NPC. Trust moves here, server-side — the AI layer receives the
 * resulting trust level and the allow-list of what may be said, and never
 * decides either for itself.
 */
export function talkTo(
  room: Room,
  session: RoomSession,
  npcId: string,
  message: string,
  now: number = Date.now()
): { ok: boolean; trust: string } {
  recordEvent(session, "talk", `${npcId}:${message.slice(0, 60)}`, now);
  const trust = applySocialEffect(session, npcId, message);
  return { ok: true, trust };
}

export function endSession(
  session: RoomSession,
  escaped: boolean,
  now: number = Date.now()
): void {
  if (session.endedAt !== null) return;
  session.endedAt = now;
  session.escaped = escaped;
}

/** Ranked runs get exactly one attempt per wallet per day (doc 10). */
export function sessionKey(dayId: number, player: string, mode: SessionMode): string {
  return `${mode}:${dayId}:${player.toLowerCase()}`;
}
