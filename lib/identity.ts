/**
 * MiniPay forbids showing a raw `0x…` address as a user's primary identifier.
 * We derive a stable, readable alias from the address instead — deterministic, so
 * the same wallet is always the same name on the leaderboard, with no account setup.
 */

const ADJECTIVES = [
  "Quiet", "Clever", "Restless", "Patient", "Careful", "Curious", "Silent", "Steady",
  "Sharp", "Bright", "Hidden", "Distant", "Golden", "Iron", "Velvet", "Hollow",
  "Amber", "Crimson", "Midnight", "Rapid", "Bold", "Cunning", "Watchful", "Nimble",
  "Ember", "Frozen", "Lucky", "Solemn", "Swift", "Wary", "Wandering", "Wild",
];

const NOUNS = [
  "Locksmith", "Archivist", "Cartographer", "Detective", "Engineer", "Botanist",
  "Curator", "Watchmaker", "Navigator", "Librarian", "Alchemist", "Courier",
  "Inspector", "Keeper", "Analyst", "Scholar", "Tinkerer", "Signalman",
  "Custodian", "Draughtsman", "Escapist", "Forager", "Geologist", "Historian",
  "Linguist", "Machinist", "Observer", "Puzzler", "Surveyor", "Translator",
  "Locksmith", "Codebreaker",
];

/**
 * Stable alias for a wallet, e.g. "Quiet Locksmith 4417".
 * Uses distinct nibble groups of the address for each part so visually similar
 * addresses don't collapse to the same name.
 */
export function aliasFor(address: string): string {
  const hex = address.toLowerCase().replace(/^0x/, "");
  if (hex.length < 40) return "Unknown Player";

  const adjective = ADJECTIVES[parseInt(hex.slice(0, 4), 16) % ADJECTIVES.length];
  const noun = NOUNS[parseInt(hex.slice(4, 8), 16) % NOUNS.length];
  // Last 4 hex chars as decimal — disambiguates collisions without exposing the address.
  const tag = (parseInt(hex.slice(36, 40), 16) % 10000).toString().padStart(4, "0");

  return `${adjective} ${noun} ${tag}`;
}

/** Two-letter monogram for avatar chips. */
export function initialsFor(address: string): string {
  const alias = aliasFor(address);
  const [first, second] = alias.split(" ");
  return `${first[0] ?? "?"}${second?.[0] ?? ""}`;
}
