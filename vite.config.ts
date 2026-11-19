import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Compiled as an app ships it, so the server render the hydration test
  // hydrates (test/server-render.ts) matches the browser's build.
  plugins: [svelte({ compilerOptions: { dev: false } })],
  test: {
    projects: [
      {
        extends: true,
        // The browser's build of Svelte, in a simulated DOM.
        resolve: { conditions: ["browser", "production"] },
        test: {
          name: "browser",
          environment: "jsdom",
          include: ["test/**/*.svelte.test.ts"],
          globalSetup: ["test/server-render.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "server",
          environment: "node",
          include: ["test/**/*.server.test.ts"],
        },
      },
    ],
  },
});
