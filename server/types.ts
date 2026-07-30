/**
 * Core game types.
 *
 * The authority rule this whole engine is built around: a Room is authored data,
 * a RoomSession is mutable per-player state, and only the server holds both. The
 * client never receives the puzzle graph, the canonical solution, or unreleased
 * hint text — it sees a redacted view (see `redactRoom` in room.ts).
 */

// ── Objects ────────────────────────────────────────────────────────────────

export type ObjectState =
  | "hidden"
  | "visible"
  | "inspected"
  | "interacted"
  | "modified"
  | "solved"
  | "inactive";

export type Action =
  | "inspect"
  | "open"
  | "close"
  | "read"
  | "push"
  | "pull"
  | "rotate"
  | "lift"
  | "move"
  | "use"
  | "take"
  | "unlock"
  | "turn_on"
  | "turn_off"
  | "listen"
  | "press"
  | "insert"
  | "combine"
  | "talk";

export interface GameObject {
  id: string;
  name: string;
  /** Shown the first time a player looks at it. */
  description: string;
  /** Replaces `description` once the object has been changed (opened, unlocked…). */
  descriptionAfter?: string;
  state: ObjectState;
  /** Actions this object accepts. Anything else is refused as "impossible". */
  actions: Action[];
  /** Items granted on `take` / successful interaction. */
  yields?: string[];
  /** Item required before this object will respond at all. */
  requiresItem?: string;
  /** Puzzle that must be solved before this object becomes usable. */
  requiresPuzzle?: string;
  /** Objects revealed (hidden → visible) once this one is interacted with. */
  reveals?: string[];
  /** Free-text answer this object accepts, e.g. a keypad code. Compared normalised. */
  acceptsCode?: string;
  /** Puzzle this object completes when correctly used/coded. */
  solvesPuzzle?: string;
  /** Red herrings are allowed, but must never block progress (doc 3). */
  redHerring?: boolean;
}

// ── Items ──────────────────────────────────────────────────────────────────

export type ItemCategory = "key" | "access" | "tool" | "puzzle" | "info" | "special";

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  /** Consumed on use (battery, fuse) vs retained (flashlight, crowbar). */
  consumable?: boolean;
  /** Info items stay readable forever once collected (doc 6). */
  readableText?: string;
  /** id of the item produced by combining — see Room.combinations. */
}

export interface Combination {
  inputs: [string, string];
  output: string;
  /** Whether the inputs are destroyed. */
  consumesInputs: boolean;
}

// ── Puzzles ────────────────────────────────────────────────────────────────

export type PuzzleState = "hidden" | "visible" | "discovered" | "partial" | "solved";

export interface Clue {
  id: string;
  /** Where the player finds it — an object id, or an NPC id. */
  sourceId: string;
  text: string;
  /** Primary/supporting/confirmation. Doc 3 requires >=3 clues per puzzle. */
  role: "primary" | "supporting" | "confirmation";
}

export interface Puzzle {
  id: string;
  name: string;
  objective: string;
  state: PuzzleState;
  /** Puzzles that must be solved before this one becomes reachable. Forms a DAG. */
  dependsOn: string[];
  clues: Clue[];
  /** Five escalating hints: observation → focus → connection → reasoning → solution. */
  hints: [string, string, string, string, string];
  /** The canonical answer. Never leaves the server. */
  solution: string;
  /** Objects that become visible once this puzzle is solved. */
  revealsObjects?: string[];
  /** Items granted on solve. */
  yieldsItems?: string[];
}

// ── NPC ────────────────────────────────────────────────────────────────────

export type TrustLevel = "hostile" | "suspicious" | "neutral" | "friendly" | "helpful" | "loyal";

export const TRUST_ORDER: TrustLevel[] = [
  "hostile",
  "suspicious",
  "neutral",
  "friendly",
  "helpful",
  "loyal",
];

export type Emotion =
  | "happy"
  | "afraid"
  | "angry"
  | "confused"
  | "hopeful"
  | "excited"
  | "relieved"
  | "panicked"
  | "embarrassed";

/** What an NPC is allowed to say, gated by how much the player has earned. */
export interface NpcKnowledge {
  id: string;
  text: string;
  /** Minimum trust before the NPC will share this. */
  minTrust: TrustLevel;
  /** Only shared once this puzzle is solved (prevents skipping the chain). */
  requiresPuzzle?: string;
  /** Never sayable — solutions, developer info (doc 4). */
  forbidden?: boolean;
}

export interface Npc {
  id: string;
  name: string;
  role: string;
  personality: string;
  speakingStyle: string;
  trust: TrustLevel;
  emotion: Emotion;
  knowledge: NpcKnowledge[];
  /** Lines used when the AI provider is unavailable (doc 12 offline fallback). */
  fallbackLines: string[];
}

// ── Room ───────────────────────────────────────────────────────────────────

export type Difficulty = "beginner" | "standard" | "advanced" | "expert" | "legendary";

export interface Room {
  id: string;
  /** UTC day number for daily rooms; null for evergreen practice rooms. */
  dayId: number | null;
  title: string;
  theme: string;
  /** Set the scene. Shown once on entry. */
  intro: string;
  difficulty: Difficulty;
  /** Seconds on the clock. */
  timeLimitSec: number;
  objects: GameObject[];
  items: Item[];
  puzzles: Puzzle[];
  npcs: Npc[];
  combinations: Combination[];
  /** Solving this puzzle ends the room. */
  escapePuzzleId: string;
  /** Shown on escape. */
  outro: string;
}

// ── Session ────────────────────────────────────────────────────────────────

export type SessionMode = "practice" | "ranked";

export interface SessionEvent {
  at: number; // ms since session start — server-measured, never client-supplied
  kind: "action" | "hint" | "solve" | "fail" | "talk" | "combine";
  detail: string;
}

export interface RoomSession {
  id: string;
  roomId: string;
  mode: SessionMode;
  /** Null in practice mode — practice needs no wallet. */
  player: string | null;
  startedAt: number;
  endedAt: number | null;
  escaped: boolean;

  objectStates: Record<string, ObjectState>;
  puzzleStates: Record<string, PuzzleState>;
  /** Item ids currently held. Capped at INVENTORY_LIMIT. */
  inventory: string[];
  /** Info items stay readable after use, so we track what's ever been seen. */
  seenItems: string[];
  npcTrust: Record<string, TrustLevel>;
  npcEmotion: Record<string, Emotion>;

  /** Highest hint level reached per puzzle, 0 = none. */
  hintLevels: Record<string, number>;
  wrongAttempts: number;
  secretsFound: string[];

  /** Full ordered log — powers scoring, anti-cheat, and future ghost replays. */
  events: SessionEvent[];
}

/** Doc 6: a deliberately small inventory keeps items memorable. */
export const INVENTORY_LIMIT = 8;
