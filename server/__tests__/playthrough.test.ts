import { describe, it, expect } from "vitest";
import { performAction, submitCode, talkTo } from "../gamemaster";
import { newSession, redactRoom, timeRemainingSec } from "../room";
import { scoreSession } from "../scoring";
import { nextHint } from "../hints";
import { cartographersStudy } from "../rooms/cartographers-study";

const room = cartographersStudy;

/**
 * The playthrough test. If this ever fails, players are paying entry fees for a
 * room that cannot be escaped — the worst failure mode in the product.
 */
describe("full playthrough", () => {
  it("can be escaped by playing it the intended way", () => {
    const s = newSession(room, "ranked", "0xplayer", "p1", 0);

    // Open the desk to reveal the locked drawer.
    const desk = performAction(room, s, "desk", "open", 1_000);
    expect(desk.ok).toBe(true);
    expect(desk.objectsRevealed).toContain("drawer");

    // Take the letter-opener from the tray.
    const opener = performAction(room, s, "letter-tray", "take", 2_000);
    expect(opener.itemsGained).toContain("letter-opener");

    // Use it on the drawer to get the ledger.
    const drawer = performAction(room, s, "drawer", "unlock", 3_000);
    expect(drawer.ok).toBe(true);
    expect(drawer.itemsGained).toContain("ledger");
    expect(drawer.puzzleSolved).toBe("open-drawer");

    // Rotate the globe to expose the latitude.
    const globe = performAction(room, s, "globe", "rotate", 4_000);
    expect(globe.puzzleSolved).toBe("read-globe");
    expect(globe.text).toContain("47");

    // 47 (latitude) + 12 (the day she sailed, from the ledger) = 4712.
    const safe = submitCode(room, s, "safe", "4712", 5_000);
    expect(safe.ok).toBe(true);
    expect(safe.itemsGained).toContain("brass-key");

    // Out.
    const door = performAction(room, s, "door", "unlock", 6_000);
    expect(door.escaped).toBe(true);
    expect(s.escaped).toBe(true);
    expect(s.endedAt).toBe(6_000);

    // Fast, clean, no hints — should score near the top.
    const score = scoreSession(room, s);
    expect(score.total).toBeGreaterThan(900);
    expect(score.hintsUsed).toBe(0);
    expect(score.wrongAttempts).toBe(0);
  });

  it("can be escaped by a player who leans on hints", () => {
    const s = newSession(room, "practice", null, "p2", 0);

    // Take every hint available, then still solve it.
    for (let i = 0; i < 10; i++) nextHint(room, s, "practice");

    performAction(room, s, "desk", "open", 1_000);
    performAction(room, s, "letter-tray", "take", 2_000);
    performAction(room, s, "drawer", "unlock", 3_000);
    performAction(room, s, "globe", "rotate", 4_000);
    submitCode(room, s, "safe", "4712", 5_000);
    const door = performAction(room, s, "door", "unlock", 300_000);

    expect(door.escaped).toBe(true);
    // Slower and hint-heavy, so a much lower score than a clean run.
    expect(scoreSession(room, s).total).toBeLessThan(700);
  });

  it("blocks the safe until both prerequisite puzzles are solved", () => {
    const s = newSession(room, "ranked", "0xplayer", "p3", 0);
    // Knowing the code is not enough — the room still gates on the globe.
    const early = submitCode(room, s, "safe", "4712", 1_000);
    expect(early.ok).toBe(false);
    expect(early.effect).toBe("refused");
  });

  it("blocks the door until the key is in hand", () => {
    const s = newSession(room, "ranked", "0xplayer", "p4", 0);
    const door = performAction(room, s, "door", "unlock", 1_000);
    expect(door.ok).toBe(false);
    expect(s.escaped).toBe(false);
  });

  it("counts a wrong code as a wrong attempt without ending the run", () => {
    const s = newSession(room, "ranked", "0xplayer", "p5", 0);
    performAction(room, s, "globe", "rotate", 1_000);

    const wrong = submitCode(room, s, "safe", "0000", 2_000);
    expect(wrong.ok).toBe(false);
    expect(wrong.effect).toBe("wrong_code");
    expect(s.wrongAttempts).toBe(1);
    expect(s.endedAt).toBeNull();
  });

  it("ends the run when the clock expires and refuses further actions", () => {
    const s = newSession(room, "ranked", "0xplayer", "p6", 0);
    const late = performAction(room, s, "desk", "open", 481_000);

    expect(late.effect).toBe("expired");
    expect(s.endedAt).not.toBeNull();
    expect(s.escaped).toBe(false);

    // No sneaking an action in after time.
    expect(performAction(room, s, "desk", "open", 482_000).ok).toBe(false);
  });

  it("uses server time for the clock, not anything the client sends", () => {
    const s = newSession(room, "ranked", "0xplayer", "p7", 0);
    expect(timeRemainingSec(room, s, 60_000)).toBe(420);
    expect(timeRemainingSec(room, s, 480_000)).toBe(0);
  });

  it("records an ordered event log for scoring and replay", () => {
    const s = newSession(room, "ranked", "0xplayer", "p8", 0);
    performAction(room, s, "desk", "open", 1_000);
    performAction(room, s, "letter-tray", "take", 2_500);
    talkTo(room, s, "parrot", "hello there", 3_000);

    expect(s.events).toHaveLength(3);
    expect(s.events.map((e) => e.at)).toEqual([1_000, 2_500, 3_000]);
    expect(s.events[2].kind).toBe("talk");
  });

  it("keeps the client view free of the answer at every step", () => {
    const s = newSession(room, "ranked", "0xplayer", "p9", 0);
    performAction(room, s, "desk", "open", 1_000);
    performAction(room, s, "letter-tray", "take", 2_000);
    performAction(room, s, "drawer", "unlock", 3_000);

    // The ledger is now held and readable, but the code itself is never sent.
    const view = JSON.stringify(redactRoom(room, s, 4_000));
    expect(view).not.toContain("4712");
  });
});
