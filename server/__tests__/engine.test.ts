import { describe, it, expect } from "vitest";
import { nextHint, hintsUsed, maxHintLevel, MAX_HINT_LEVEL, MAX_RANKED_HINT_LEVEL } from "../hints";
import { disclosableKnowledge, adjustTrust, applySocialEffect, meetsTrust } from "../npc";
import { newSession, validateAction, redactRoom } from "../room";
import { solvePuzzle } from "../puzzle";
import { cartographersStudy } from "../rooms/cartographers-study";

const room = cartographersStudy;

describe("hints", () => {
  it("escalates through the five levels in practice", () => {
    const s = newSession(room, "practice", null, "h1");
    const levels: number[] = [];

    for (let i = 0; i < 5; i++) {
      const r = nextHint(room, s, "practice");
      if (r.ok) levels.push(r.level);
    }
    expect(levels).toEqual([1, 2, 3, 4, 5]);
  });

  it("never reaches the solution level in ranked", () => {
    // Level 5 is the outright answer — handing it out would destroy the leaderboard.
    expect(maxHintLevel("ranked")).toBe(MAX_RANKED_HINT_LEVEL);
    expect(maxHintLevel("practice")).toBe(MAX_HINT_LEVEL);

    const s = newSession(room, "ranked", "0xabc", "h2");
    let highest = 0;
    for (let i = 0; i < 30; i++) {
      const r = nextHint(room, s, "ranked");
      if (r.ok) highest = Math.max(highest, r.level);
    }
    expect(highest).toBe(4);
  });

  it("never returns text from the solution hint in ranked", () => {
    const s = newSession(room, "ranked", "0xabc", "h3");
    const solutionTexts = room.puzzles.map((p) => p.hints[4]);

    for (let i = 0; i < 30; i++) {
      const r = nextHint(room, s, "ranked");
      if (r.ok) expect(solutionTexts).not.toContain(r.text);
    }
  });

  it("only hints at puzzles the player can actually act on", () => {
    const s = newSession(room, "practice", null, "h4");
    // The safe is gated behind the drawer and globe, so it must not be hinted yet.
    for (let i = 0; i < 10; i++) {
      const r = nextHint(room, s, "practice");
      if (r.ok) expect(["open-drawer", "read-globe"]).toContain(r.puzzleId);
    }
  });

  it("deepens help on the same puzzle rather than bouncing between them", () => {
    const s = newSession(room, "practice", null, "h5");
    const first = nextHint(room, s, "practice");
    const second = nextHint(room, s, "practice");

    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.puzzleId).toBe(first.puzzleId);
      expect(second.level).toBe(2);
    }
  });

  it("reports nothing active once every puzzle is solved", () => {
    const s = newSession(room, "practice", null, "h6");
    for (const p of room.puzzles) solvePuzzle(room, s, p.id);
    expect(nextHint(room, s, "practice")).toEqual({ ok: false, reason: "nothing_active" });
  });

  it("counts total hints taken for scoring", () => {
    const s = newSession(room, "practice", null, "h7");
    nextHint(room, s, "practice");
    nextHint(room, s, "practice");
    nextHint(room, s, "practice");
    expect(hintsUsed(s)).toBe(3);
  });
});

describe("npc knowledge boundaries", () => {
  it("withholds higher-trust knowledge at neutral", () => {
    const s = newSession(room, "practice", null, "n1");
    const ids = disclosableKnowledge(room, s, "parrot").map((k) => k.id);

    expect(ids).toContain("k1");
    expect(ids).not.toContain("k3"); // needs friendly
  });

  it("unlocks knowledge as trust rises", () => {
    const s = newSession(room, "practice", null, "n2");
    adjustTrust(s, "parrot", 1); // neutral -> friendly

    expect(disclosableKnowledge(room, s, "parrot").map((k) => k.id)).toContain("k3");
  });

  it("never discloses forbidden knowledge, even at maximum trust", () => {
    // k6 is the safe code. No trust level may ever unlock it.
    const s = newSession(room, "practice", null, "n3");
    adjustTrust(s, "parrot", 10);

    expect(s.npcTrust.parrot).toBe("loyal");
    expect(disclosableKnowledge(room, s, "parrot").map((k) => k.id)).not.toContain("k6");
  });

  it("gates knowledge behind puzzle progress as well as trust", () => {
    const s = newSession(room, "practice", null, "n4");
    adjustTrust(s, "parrot", 2); // -> helpful

    expect(disclosableKnowledge(room, s, "parrot").map((k) => k.id)).not.toContain("k5");

    solvePuzzle(room, s, "read-globe");
    expect(disclosableKnowledge(room, s, "parrot").map((k) => k.id)).toContain("k5");
  });

  it("clamps trust at both ends of the scale", () => {
    const s = newSession(room, "practice", null, "n5");
    adjustTrust(s, "parrot", -99);
    expect(s.npcTrust.parrot).toBe("hostile");

    adjustTrust(s, "parrot", 99);
    expect(s.npcTrust.parrot).toBe("loyal");
  });

  it("moves trust from how the player speaks", () => {
    const s = newSession(room, "practice", null, "n6");
    applySocialEffect(s, "parrot", "please, could you help me?");
    expect(s.npcTrust.parrot).toBe("friendly");

    applySocialEffect(s, "parrot", "you are useless, shut up");
    expect(s.npcTrust.parrot).toBe("neutral");
  });

  it("compares trust levels by rank", () => {
    expect(meetsTrust("helpful", "friendly")).toBe(true);
    expect(meetsTrust("suspicious", "friendly")).toBe(false);
    expect(meetsTrust("neutral", "neutral")).toBe(true);
  });
});

describe("action validation", () => {
  it("refuses an action on a hidden object", () => {
    const s = newSession(room, "practice", null, "a1");
    expect(validateAction(room, s, "drawer", "open")).toMatchObject({
      allowed: false,
      reason: "not_visible",
    });
  });

  it("refuses an action the object does not support", () => {
    const s = newSession(room, "practice", null, "a2");
    expect(validateAction(room, s, "desk", "listen")).toMatchObject({
      allowed: false,
      reason: "impossible_action",
    });
  });

  it("reports the item the player is still missing", () => {
    const s = newSession(room, "practice", null, "a3");
    s.objectStates.drawer = "visible";

    expect(validateAction(room, s, "drawer", "unlock")).toMatchObject({
      allowed: false,
      reason: "requires_item",
      missing: "letter-opener",
    });
  });

  it("allows the action once the required item is held", () => {
    const s = newSession(room, "practice", null, "a4");
    s.objectStates.drawer = "visible";
    s.inventory.push("letter-opener");

    expect(validateAction(room, s, "drawer", "unlock").allowed).toBe(true);
  });

  it("refuses an unknown object", () => {
    const s = newSession(room, "practice", null, "a5");
    expect(validateAction(room, s, "teleporter", "use")).toMatchObject({
      allowed: false,
      reason: "unknown_object",
    });
  });
});

describe("redaction", () => {
  it("never leaks code answers, hint text or the puzzle graph to the client", () => {
    const s = newSession(room, "practice", null, "r1");
    const view = JSON.stringify(redactRoom(room, s));

    // Code-style answers must never appear. (Item-name answers like "letter-opener"
    // legitimately appear in prose — spotting the item IS the puzzle.)
    for (const p of room.puzzles) {
      if (/^\d+$/.test(p.solution)) expect(view).not.toContain(p.solution);
    }
    expect(view).not.toContain("4712"); // the safe code

    for (const p of room.puzzles) {
      for (const hint of p.hints) {
        if (hint) expect(view).not.toContain(hint);
      }
    }

    // The dependency graph would hand the player the whole structure.
    expect(view).not.toContain("dependsOn");
    expect(view).not.toContain("requiresPuzzle");
    expect(view).not.toContain("redHerring");
  });

  it("never leaks NPC secrets", () => {
    const s = newSession(room, "practice", null, "r2");
    const view = JSON.stringify(redactRoom(room, s));

    for (const npc of room.npcs) {
      for (const k of npc.knowledge) {
        expect(view).not.toContain(k.text);
      }
    }
  });

  it("hides objects the player has not discovered", () => {
    const s = newSession(room, "practice", null, "r3");
    const view = redactRoom(room, s);
    expect(view.objects.map((o) => o.id)).not.toContain("drawer");
  });

  it("reveals an object once it becomes visible", () => {
    const s = newSession(room, "practice", null, "r4");
    s.objectStates.drawer = "visible";
    expect(redactRoom(room, s).objects.map((o) => o.id)).toContain("drawer");
  });

  it("swaps in the changed description after an object is modified", () => {
    const s = newSession(room, "practice", null, "r5");
    s.objectStates.globe = "modified";

    const globe = redactRoom(room, s).objects.find((o) => o.id === "globe");
    expect(globe?.description).toContain("47");
  });
});
