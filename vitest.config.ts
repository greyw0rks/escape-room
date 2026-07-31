import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Scoped to first-party source. Without this, vitest walks
    // contracts/celo/lib/ and tries to run OpenZeppelin's Hardhat suite.
    include: ["{app,lib,server}/**/*.test.{ts,tsx}"],
  },
});
