import type { Room, RoomSession, Npc, NpcKnowledge, TrustLevel, Emotion } from "./types";
import { TRUST_ORDER } from "./types";

/**
 * NPC state.
 *
 * Doc 4's two hard rules, both enforced here rather than left to the AI:
 *   1. Emotion colours dialogue but NEVER gates information — only trust does.
 *   2. Every NPC has knowledge boundaries. No NPC knows everything, and nothing
 *      marked forbidden is ever disclosed regardless of trust.
 */

export function npcById(room: Room, id: string): Npc | undefined {
  return room.npcs.find((n) => n.id === id);
}

export function trustRank(level: TrustLevel): number {
  return TRUST_ORDER.indexOf(level);
}

export function meetsTrust(current: TrustLevel, required: TrustLevel): boolean {
  return trustRank(current) >= trustRank(required);
}

/** Move trust by `steps`, clamped to the ends of the scale. */
export function adjustTrust(
  session: RoomSession,
  npcId: string,
  steps: number
): TrustLevel {
  const current = session.npcTrust[npcId] ?? "neutral";
  const next = Math.min(
    TRUST_ORDER.length - 1,
    Math.max(0, trustRank(current) + steps)
  );
  session.npcTrust[npcId] = TRUST_ORDER[next];
  return TRUST_ORDER[next];
}

export function setEmotion(session: RoomSession, npcId: string, emotion: Emotion): void {
  session.npcEmotion[npcId] = emotion;
}

/**
 * Everything this NPC may currently say.
 *
 * This is the allow-list handed to the AI layer — the model may only rephrase
 * what appears here. It can never volunteer knowledge the player hasn't earned.
 */
export function disclosableKnowledge(
  room: Room,
  session: RoomSession,
  npcId: string
): NpcKnowledge[] {
  const npc = npcById(room, npcId);
  if (!npc) return [];

  const trust = session.npcTrust[npcId] ?? npc.trust;

  return npc.knowledge.filter((k) => {
    if (k.forbidden) return false;
    if (!meetsTrust(trust, k.minTrust)) return false;
    if (k.requiresPuzzle && session.puzzleStates[k.requiresPuzzle] !== "solved") {
      return false;
    }
    return true;
  });
}

// ── Trust signals ──────────────────────────────────────────────────────────

/**
 * Doc 4 lists what moves trust. We classify the player's message server-side and
 * apply the delta — trust is game state, so the model must not control it.
 */
const RUDE = /\b(shut up|stupid|idiot|useless|liar|hate you|kill|threat)\b/i;
const POLITE = /\b(please|thank you|thanks|sorry|appreciate|kindly)\b/i;

export function trustDelta(message: string): number {
  if (RUDE.test(message)) return -1;
  if (POLITE.test(message)) return 1;
  return 0;
}

/** Apply a message's social effect. Returns the resulting trust level. */
export function applySocialEffect(
  session: RoomSession,
  npcId: string,
  message: string
): TrustLevel {
  const delta = trustDelta(message);
  if (delta === 0) return session.npcTrust[npcId] ?? "neutral";

  const next = adjustTrust(session, npcId, delta);
  setEmotion(session, npcId, delta > 0 ? "hopeful" : "angry");
  return next;
}
