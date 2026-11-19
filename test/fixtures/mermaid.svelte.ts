/**
 * The README's lazy Mermaid plugin: Pele's lazy entry is loaded the first
 * time a source holds a mermaid fence, and each diagram type the first time
 * a diagram of it is drawn. Words calls the plugin synchronously, so a
 * diagram whose type is still loading draws empty, and a new plugin, once
 * the type is in, has Words draw every diagram again.
 */
import { createMermaidPlugin } from "@pierre/words/mermaid";
import type { MermaidPlugin } from "../../src/index.js";

type Pele = typeof import("pele/lazy");

const MERMAID_FENCE = /^ {0,3}(?:`{3,}|~{3,})[ \t]*mermaid\b/mu;

let pele: Promise<Pele> | undefined;
let plugin = $state<MermaidPlugin>();
const asked = new Set<string>();

function pluginOf(lazy: Pele): MermaidPlugin {
  return createMermaidPlugin(
    {
      render(code, options) {
        let type: ReturnType<Pele["detectType"]> = null;
        try {
          type = lazy.detectType(code);
        } catch {}
        if (type !== null && !lazy.registered(type)) {
          if (!asked.has(type)) {
            asked.add(type);
            lazy.load(type).finally(() => {
              plugin = pluginOf(lazy);
            });
          }
          return { svg: "" };
        }
        return lazy.render(code, options);
      },
    },
    { links: false, images: false }
  );
}

/** The plugin for `source`: none until it holds a mermaid fence and Pele is in. */
export function mermaidFor(source: string): MermaidPlugin | undefined {
  if (pele === undefined && MERMAID_FENCE.test(source)) {
    pele = import("pele/lazy");
    pele.then((lazy) => {
      plugin = pluginOf(lazy);
    });
  }
  return plugin;
}
