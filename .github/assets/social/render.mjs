// Renders the social preview: the card drawn by svelte-words in Chromium,
// captured at 2x and downscaled to 1280x640 so the type stays crisp.
// node render.mjs [variant ...]   (stream, source, pair; default: all)
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { chromium } from "playwright";
import { createServer } from "vite";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../../..");
const variants = process.argv.slice(2).length ? process.argv.slice(2) : ["stream", "source", "pair"];

const server = await createServer({
  configFile: false,
  root: here,
  logLevel: "warn",
  plugins: [
    svelte({ configFile: false, compilerOptions: { runes: true } }),
    {
      // Words' highlights entry imports @pierre/highlights, installed here only:
      // resolve it from this folder, whoever imports it.
      name: "highlights-from-here",
      enforce: "pre",
      resolveId(source, importer, options) {
        if (source.startsWith("@pierre/highlights") && !importer?.startsWith(here + "/node_modules")) {
          return this.resolve(source, resolve(here, "main.ts"), { ...options, skipSelf: true });
        }
      },
    },
  ],
  resolve: {
    alias: [
      { find: "svelte-words", replacement: resolve(repo, "src/index.ts") },
    ],
  },
  // Served as published, so their WebAssembly loads from beside their modules.
  optimizeDeps: { exclude: ["@pierre/words", "@pierre/highlights"] },
  server: { port: 0, fs: { allow: [repo] } },
});
await server.listen();
const base = server.resolvedUrls.local[0];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 2 });
const out = resolve(here, "out");
await mkdir(out, { recursive: true });
try {
  for (const variant of variants) {
    await page.goto(`${base}?variant=${variant}`);
    await page.waitForSelector("[data-markdown=code-block] pre span[style]");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const shot = await page.locator(".card").screenshot({ animations: "disabled" });
    // Downscale in the browser: one high-quality resample, no image library.
    const png = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, 1280, 640);
      return canvas.toDataURL("image/png").split(",")[1];
    }, shot.toString("base64"));
    const file = resolve(out, `${variant}.png`);
    await writeFile(file, Buffer.from(png, "base64"));
    console.log(file);
  }
} finally {
  await browser.close();
  await server.close();
}
