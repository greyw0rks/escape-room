import type { Room, RoomSession, Item, Combination } from "./types";
import { INVENTORY_LIMIT } from "./types";

/**
 * Inventory.
 *
 * Doc 7 caps the inventory at 8 deliberately — a small inventory keeps every item
 * memorable. Info items (maps, notes, codes) stay readable forever once seen, even
 * after they leave the bag, so a full inventory can never cost a player knowledge.
 */

export function itemById(room: Room, id: string): Item | undefined {
  return room.items.find((i) => i.id === id);
}

export function holds(session: RoomSession, itemId: string): boolean {
  return session.inventory.includes(itemId);
}

export type GiveResult =
  | { ok: true; item: Item }
  | { ok: false; reason: "unknown" | "duplicate" | "full" };

export function giveItem(room: Room, session: RoomSession, itemId: string): GiveResult {
  const item = itemById(room, itemId);
  if (!item) return { ok: false, reason: "unknown" };
  if (holds(session, itemId)) return { ok: false, reason: "duplicate" };
  if (session.inventory.length >= INVENTORY_LIMIT) return { ok: false, reason: "full" };

  session.inventory.push(itemId);
  if (!session.seenItems.includes(itemId)) session.seenItems.push(itemId);
  return { ok: true, item };
}

/** Remove an item — used when a consumable is spent, or to make room. */
export function dropItem(session: RoomSession, itemId: string): boolean {
  const at = session.inventory.indexOf(itemId);
  if (at === -1) return false;
  session.inventory.splice(at, 1);
  return true;
}

/** Info items remain readable after they leave the bag (doc 6). */
export function canRead(room: Room, session: RoomSession, itemId: string): boolean {
  const item = itemById(room, itemId);
  if (!item?.readableText) return false;
  return session.seenItems.includes(itemId);
}

// ── Combining ──────────────────────────────────────────────────────────────

export function findCombination(
  room: Room,
  a: string,
  b: string
): Combination | undefined {
  return room.combinations.find(
    (c) =>
      (c.inputs[0] === a && c.inputs[1] === b) || (c.inputs[0] === b && c.inputs[1] === a)
  );
}

export type CombineResult =
  | { ok: true; output: Item }
  | { ok: false; reason: "missing_item" | "no_such_combination" | "full" };

/**
 * Doc 7: combining must follow logical reasoning, never random experimentation.
 * Only authored pairs work; everything else is refused without penalty.
 */
export function combine(
  room: Room,
  session: RoomSession,
  a: string,
  b: string
): CombineResult {
  if (!holds(session, a) || !holds(session, b)) {
    return { ok: false, reason: "missing_item" };
  }

  const recipe = findCombination(room, a, b);
  if (!recipe) return { ok: false, reason: "no_such_combination" };

  const output = itemById(room, recipe.output);
  if (!output) return { ok: false, reason: "no_such_combination" };

  if (recipe.consumesInputs) {
    dropItem(session, a);
    dropItem(session, b);
  } else if (session.inventory.length >= INVENTORY_LIMIT) {
    // Only a non-consuming recipe can overflow the bag.
    return { ok: false, reason: "full" };
  }

  session.inventory.push(output.id);
  if (!session.seenItems.includes(output.id)) session.seenItems.push(output.id);
  return { ok: true, output };
}

/**
 * The single valid combination available right now, if there is exactly one.
 * Doc 6 allows suggesting it (the player still confirms) — this is what stops
 * combining from degenerating into brute force.
 */
export function suggestedCombination(
  room: Room,
  session: RoomSession
): Combination | null {
  const available = room.combinations.filter(
    (c) => holds(session, c.inputs[0]) && holds(session, c.inputs[1])
  );
  return available.length === 1 ? available[0] : null;
}
