import { describe, it, expect } from "vitest";
import { giveItem, dropItem, combine, holds, canRead, suggestedCombination } from "../inventory";
import { newSession } from "../room";
import { INVENTORY_LIMIT, type Room } from "../types";
import { cartographersStudy } from "../rooms/cartographers-study";

const room = cartographersStudy;

describe("inventory", () => {
  it("gives an item and records it as seen", () => {
    const s = newSession(room, "practice", null, "s1");
    const result = giveItem(room, s, "brass-key");

    expect(result.ok).toBe(true);
    expect(holds(s, "brass-key")).toBe(true);
    expect(s.seenItems).toContain("brass-key");
  });

  it("refuses an unknown item", () => {
    const s = newSession(room, "practice", null, "s2");
    const result = giveItem(room, s, "not-a-real-item");
    expect(result).toEqual({ ok: false, reason: "unknown" });
  });

  it("refuses a duplicate rather than stacking it", () => {
    const s = newSession(room, "practice", null, "s3");
    giveItem(room, s, "brass-key");
    expect(giveItem(room, s, "brass-key")).toEqual({ ok: false, reason: "duplicate" });
    expect(s.inventory).toHaveLength(1);
  });

  it("enforces the 8-slot cap", () => {
    // Doc 7 caps the bag deliberately, so the limit must actually bite.
    const big: Room = structuredClone(room);
    big.items = Array.from({ length: 12 }, (_, i) => ({
      id: `filler-${i}`,
      name: `Filler ${i}`,
      description: "",
      category: "puzzle" as const,
    }));

    const s = newSession(big, "practice", null, "s4");
    for (let i = 0; i < INVENTORY_LIMIT; i++) {
      expect(giveItem(big, s, `filler-${i}`).ok).toBe(true);
    }

    expect(giveItem(big, s, "filler-8")).toEqual({ ok: false, reason: "full" });
    expect(s.inventory).toHaveLength(INVENTORY_LIMIT);
  });

  it("frees a slot when an item is dropped", () => {
    const s = newSession(room, "practice", null, "s5");
    giveItem(room, s, "brass-key");
    expect(dropItem(s, "brass-key")).toBe(true);
    expect(holds(s, "brass-key")).toBe(false);
    expect(dropItem(s, "brass-key")).toBe(false);
  });

  it("keeps info items readable after they leave the bag", () => {
    // Doc 6: a full inventory must never cost the player knowledge.
    const s = newSession(room, "practice", null, "s6");
    giveItem(room, s, "ledger");
    dropItem(s, "ledger");

    expect(holds(s, "ledger")).toBe(false);
    expect(canRead(room, s, "ledger")).toBe(true);
  });

  it("does not treat a non-info item as readable", () => {
    const s = newSession(room, "practice", null, "s7");
    giveItem(room, s, "brass-key");
    expect(canRead(room, s, "brass-key")).toBe(false);
  });
});

describe("combining", () => {
  // The seed room has no combinations, so exercise the rules on a fixture.
  const withRecipes: Room = {
    ...structuredClone(room),
    items: [
      { id: "torch", name: "Torch", description: "", category: "tool" },
      { id: "battery", name: "Battery", description: "", category: "puzzle" },
      { id: "lit-torch", name: "Working torch", description: "", category: "tool" },
      { id: "rope", name: "Rope", description: "", category: "tool" },
    ],
    combinations: [
      { inputs: ["torch", "battery"], output: "lit-torch", consumesInputs: true },
    ],
  };

  it("combines an authored pair and consumes the inputs", () => {
    const s = newSession(withRecipes, "practice", null, "c1");
    giveItem(withRecipes, s, "torch");
    giveItem(withRecipes, s, "battery");

    const result = combine(withRecipes, s, "torch", "battery");
    expect(result.ok).toBe(true);
    expect(holds(s, "lit-torch")).toBe(true);
    expect(holds(s, "torch")).toBe(false);
    expect(holds(s, "battery")).toBe(false);
  });

  it("works regardless of the order the items are given in", () => {
    const s = newSession(withRecipes, "practice", null, "c2");
    giveItem(withRecipes, s, "torch");
    giveItem(withRecipes, s, "battery");
    expect(combine(withRecipes, s, "battery", "torch").ok).toBe(true);
  });

  it("refuses a pair that was never authored", () => {
    // Doc 7: combining must be reasoning, not brute-force experimentation.
    const s = newSession(withRecipes, "practice", null, "c3");
    giveItem(withRecipes, s, "torch");
    giveItem(withRecipes, s, "rope");

    expect(combine(withRecipes, s, "torch", "rope")).toEqual({
      ok: false,
      reason: "no_such_combination",
    });
  });

  it("refuses when the player does not hold both items", () => {
    const s = newSession(withRecipes, "practice", null, "c4");
    giveItem(withRecipes, s, "torch");
    expect(combine(withRecipes, s, "torch", "battery")).toEqual({
      ok: false,
      reason: "missing_item",
    });
  });

  it("suggests the combination only when exactly one is possible", () => {
    const s = newSession(withRecipes, "practice", null, "c5");
    expect(suggestedCombination(withRecipes, s)).toBeNull();

    giveItem(withRecipes, s, "torch");
    giveItem(withRecipes, s, "battery");
    expect(suggestedCombination(withRecipes, s)?.output).toBe("lit-torch");
  });
});
