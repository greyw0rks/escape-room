import { describe, it, expect } from "vitest";
import { normalizeHost, classifyHost, routeForHost } from "./hostRouting";

// The apex/game hosts default to escape-room.uno / game.escape-room.uno; these
// tests assume the defaults (no env override in the test runner).

describe("normalizeHost", () => {
  it("strips port and lowercases", () => {
    expect(normalizeHost("Game.Escape-Room.UNO:443")).toBe("game.escape-room.uno");
  });
  it("handles null/undefined", () => {
    expect(normalizeHost(null)).toBe("");
    expect(normalizeHost(undefined)).toBe("");
  });
});

describe("classifyHost", () => {
  it("apex and www are marketing", () => {
    expect(classifyHost("escape-room.uno")).toBe("marketing");
    expect(classifyHost("www.escape-room.uno")).toBe("marketing");
  });
  it("game/app/celo subdomains are the game", () => {
    expect(classifyHost("game.escape-room.uno")).toBe("game");
    expect(classifyHost("app.escape-room.uno")).toBe("game");
    expect(classifyHost("celo.escape-room.uno")).toBe("game");
  });
  it("the current Vercel URL and localhost pass through untouched", () => {
    expect(classifyHost("escape-room-chi-five.vercel.app")).toBe("passthrough");
    expect(classifyHost("localhost")).toBe("passthrough");
    expect(classifyHost("127.0.0.1")).toBe("passthrough");
  });
});

describe("routeForHost — marketing (apex)", () => {
  const H = "escape-room.uno";
  it("serves the landing at /", () => {
    expect(routeForHost(H, "/")).toEqual({ action: "next" });
  });
  it("keeps /legal on the apex (footer link)", () => {
    expect(routeForHost(H, "/legal")).toEqual({ action: "next" });
  });
  it("redirects game routes to the canonical game host, preserving path+query", () => {
    expect(routeForHost(H, "/play")).toEqual({
      action: "redirect",
      url: "https://game.escape-room.uno/play",
    });
    expect(routeForHost(H, "/play/practice", "?x=1")).toEqual({
      action: "redirect",
      url: "https://game.escape-room.uno/play/practice?x=1",
    });
    expect(routeForHost(H, "/stats").action).toBe("redirect");
    expect(routeForHost(H, "/leaderboard").action).toBe("redirect");
  });
  it("does not treat /playful as a game route (prefix must be a segment)", () => {
    expect(routeForHost(H, "/playful")).toEqual({ action: "next" });
  });
});

describe("routeForHost — game subdomain", () => {
  const H = "game.escape-room.uno";
  it("rewrites the subdomain root to the Today feed", () => {
    expect(routeForHost(H, "/")).toEqual({ action: "rewrite", pathname: "/play" });
  });
  it("leaves game paths untouched", () => {
    expect(routeForHost(H, "/play/practice")).toEqual({ action: "next" });
    expect(routeForHost(H, "/leaderboard")).toEqual({ action: "next" });
  });
  it("app. and celo. behave identically", () => {
    expect(routeForHost("app.escape-room.uno", "/")).toEqual({
      action: "rewrite",
      pathname: "/play",
    });
    expect(routeForHost("celo.escape-room.uno", "/")).toEqual({
      action: "rewrite",
      pathname: "/play",
    });
  });
});

describe("routeForHost — passthrough hosts never change behaviour", () => {
  for (const host of ["escape-room-chi-five.vercel.app", "localhost", "127.0.0.1"]) {
    it(`${host} / → next`, () => {
      expect(routeForHost(host, "/")).toEqual({ action: "next" });
    });
    it(`${host} /play → next`, () => {
      expect(routeForHost(host, "/play")).toEqual({ action: "next" });
    });
  }
});
