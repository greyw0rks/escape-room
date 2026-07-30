import type {
  Room,
  RoomSession,
  GameObject,
  SessionMode,
  Action,
  ObjectState,
} from "./types";

/**
 * Room and session lifecycle, plus the redaction boundary.
 *
 * `redactRoom` is a security control, not a convenience: the client must never
 * receive puzzle solutions, hint text, NPC secrets, or hidden objects. Anything
 * sent to the browser is public to a determined player.
 */

export function newSession(
  room: Room,
  mode: SessionMode,
  player: string | null,
  id: string,
  now: number = Date.now()
): RoomSession {
  const objectStates: Record<string, ObjectState> = {};
  for (const o of room.objects) objectStates[o.id] = o.state;

  const puzzleStates: RoomSession["puzzleStates"] = {};
  for (const p of room.puzzles) {
    // Puzzles with no unmet dependencies start discoverable.
    puzzleStates[p.id] = p.dependsOn.length === 0 ? "discovered" : "hidden";
  }

  const npcTrust: RoomSession["npcTrust"] = {};
  const npcEmotion: RoomSession["npcEmotion"] = {};
  for (const n of room.npcs) {
    npcTrust[n.id] = n.trust;
    npcEmotion[n.id] = n.emotion;
  }

  return {
    id,
    roomId: room.id,
    mode,
    player,
    startedAt: now,
    endedAt: null,
    escaped: false,
    objectStates,
    puzzleStates,
    inventory: [],
    seenItems: [],
    npcTrust,
    npcEmotion,
    hintLevels: {},
    wrongAttempts: 0,
    secretsFound: [],
    events: [],
  };
}

export function objectById(room: Room, id: string): GameObject | undefined {
  return room.objects.find((o) => o.id === id);
}

/** Server-measured elapsed time. The client's clock is never trusted. */
export function elapsedSec(session: RoomSession, now: number = Date.now()): number {
  const end = session.endedAt ?? now;
  return Math.max(0, Math.round((end - session.startedAt) / 1000));
}

export function timeRemainingSec(
  room: Room,
  session: RoomSession,
  now: number = Date.now()
): number {
  return Math.max(0, room.timeLimitSec - elapsedSec(session, now));
}

export function isExpired(room: Room, session: RoomSession, now: number = Date.now()): boolean {
  return timeRemainingSec(room, session, now) <= 0;
}

export function recordEvent(
  session: RoomSession,
  kind: RoomSession["events"][number]["kind"],
  detail: string,
  now: number = Date.now()
): void {
  session.events.push({ at: now - session.startedAt, kind, detail });
}

// ── Action validation ──────────────────────────────────────────────────────

export type ActionVerdict =
  | { allowed: true; object: GameObject }
  | {
      allowed: false;
      reason:
        | "unknown_object"
        | "not_visible"
        | "impossible_action"
        | "requires_item"
        | "requires_puzzle"
        | "already_done";
      /** Item or puzzle the player still needs, when relevant. */
      missing?: string;
    };

/**
 * Doc 5: every player action resolves to exactly one verdict before anything is
 * narrated. The engine decides; the AI only describes what the engine decided.
 */
export function validateAction(
  room: Room,
  session: RoomSession,
  objectId: string,
  action: Action
): ActionVerdict {
  const object = objectById(room, objectId);
  if (!object) return { allowed: false, reason: "unknown_object" };

  const state = session.objectStates[objectId];
  if (state === "hidden") return { allowed: false, reason: "not_visible" };
  if (state === "inactive") return { allowed: false, reason: "already_done" };

  if (!object.actions.includes(action)) {
    return { allowed: false, reason: "impossible_action" };
  }

  if (object.requiresPuzzle && session.puzzleStates[object.requiresPuzzle] !== "solved") {
    return { allowed: false, reason: "requires_puzzle", missing: object.requiresPuzzle };
  }

  if (object.requiresItem && !session.inventory.includes(object.requiresItem)) {
    return { allowed: false, reason: "requires_item", missing: object.requiresItem };
  }

  return { allowed: true, object };
}

// ── Redaction ──────────────────────────────────────────────────────────────

export interface ClientObject {
  id: string;
  name: string;
  description: string;
  state: ObjectState;
  actions: Action[];
}

export interface ClientItem {
  id: string;
  name: string;
  description: string;
  readableText?: string;
}

export interface ClientRoom {
  id: string;
  title: string;
  intro: string;
  difficulty: Room["difficulty"];
  timeLimitSec: number;
  objects: ClientObject[];
  inventory: ClientItem[];
  npcs: { id: string; name: string; role: string }[];
  progress: number;
  timeRemainingSec: number;
}

/**
 * Build the player-visible view of a room.
 *
 * Deliberately omits: puzzle solutions, the dependency graph, hint text, NPC
 * knowledge and secrets, red-herring flags, and any object still hidden.
 */
export function redactRoom(
  room: Room,
  session: RoomSession,
  now: number = Date.now()
): ClientRoom {
  const visible = room.objects.filter((o) => {
    const state = session.objectStates[o.id];
    return state !== "hidden";
  });

  const solvedCount = room.puzzles.filter(
    (p) => session.puzzleStates[p.id] === "solved"
  ).length;

  return {
    id: room.id,
    title: room.title,
    intro: room.intro,
    difficulty: room.difficulty,
    timeLimitSec: room.timeLimitSec,
    objects: visible.map((o) => ({
      id: o.id,
      name: o.name,
      // Once changed, an object reads differently — that's the player's feedback.
      description:
        o.descriptionAfter &&
        ["modified", "solved", "interacted"].includes(session.objectStates[o.id])
          ? o.descriptionAfter
          : o.description,
      state: session.objectStates[o.id],
      actions: o.actions,
    })),
    inventory: session.inventory.flatMap((id) => {
      const item = room.items.find((i) => i.id === id);
      if (!item) return [];
      return [
        {
          id: item.id,
          name: item.name,
          description: item.description,
          readableText: item.readableText,
        },
      ];
    }),
    npcs: room.npcs.map((n) => ({ id: n.id, name: n.name, role: n.role })),
    progress: room.puzzles.length ? solvedCount / room.puzzles.length : 0,
    timeRemainingSec: timeRemainingSec(room, session, now),
  };
}
