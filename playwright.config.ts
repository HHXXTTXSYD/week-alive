import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: "http://localhost:3000", headless: true, channel: "msedge" },
  outputDir: "tmp/playwright",
  reporter: "list",
});
