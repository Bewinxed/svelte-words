/**
 * The server's render of the test fixture, made once before the browser
 * tests run, for the hydration test to hydrate: the component compiled for
 * the server by the same Vite pipeline an app's server uses.
 */
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createServer } from "vite";
import type { TestProject } from "vitest/node";
import { REPLY } from "./fixtures/source.js";

declare module "vitest" {
  export interface ProvidedContext {
    serverHtml: string;
  }
}

export default async function setup(project: TestProject): Promise<void> {
  // Svelte's server runtime as an app's server runs it, in production, as
  // the browser tests run the browser's (vite.config.ts): its development
  // build marks each `{@html}` for a check the production build skips.
  const environment = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const server = await createServer({
    configFile: false,
    root: import.meta.dirname,
    plugins: [svelte({ compilerOptions: { dev: false } })],
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const { render } = await server.ssrLoadModule("svelte/server");
    const { default: Host } = await server.ssrLoadModule("./fixtures/Host.svelte");
    const { body } = await render(Host, { props: { input: { source: REPLY } } });
    project.provide("serverHtml", body);
  } finally {
    await server.close();
    process.env.NODE_ENV = environment;
  }
}
