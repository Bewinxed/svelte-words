import { flushSync, hydrate, mount, unmount } from "svelte";
import { afterEach, describe, expect, inject, test, vi } from "vitest";
import { markdown } from "../src/index.js";
import Host, { type HostInput } from "./fixtures/Host.svelte";
import { blocks } from "./fixtures/registry.js";
import { REPLY } from "./fixtures/source.js";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) {
    cleanup();
  }
  document.body.innerHTML = "";
  vi.useRealTimers();
});

/** The fixture mounted with reactive input, and its root. */
function host(start: HostInput) {
  const input = $state(start);
  const target = document.createElement("div");
  document.body.append(target);
  const app = mount(Host, { target, props: { input } });
  flushSync();
  cleanups.push(() => unmount(app));
  const root = (): HTMLElement => {
    const found = target.querySelector<HTMLElement>('[data-testid="root"]');
    if (!found) {
      throw new Error("no root");
    }
    return found;
  };
  return { input, root, app };
}

const blockIds = (root: HTMLElement): string[] =>
  [...root.querySelectorAll("[data-block]")].map(
    (block) => block.getAttribute("data-block") ?? ""
  );

const faded = (root: HTMLElement): (string | null)[] =>
  [...root.querySelectorAll('[data-animated="true"]')].map(
    (span) => span.textContent
  );

describe("streaming", () => {
  test("a reply streamed in chunks mounts each snippet once", () => {
    const { input, root } = host({ source: "", streaming: true });
    const ids = new Set<string>();
    for (let end = 1; end <= REPLY.length; end += 4) {
      input.source = REPLY.slice(0, end);
      flushSync();
      for (const id of blockIds(root())) {
        ids.add(id);
      }
    }
    input.source = REPLY;
    flushSync();
    // One code block, mounted once from its first line to the stream's end.
    expect(ids.size).toBe(1);
    expect(root().querySelectorAll("a.chip")).toHaveLength(2);
    expect(root().querySelector("kbd")?.textContent).toBe("/skill");
    expect(root().hasAttribute("data-streaming")).toBe(true);
  });

  test("a snippet in the block being written stays the same element as words arrive", () => {
    const { input, root } = host({
      source: "See [a chip](app:user/1) here",
      streaming: true,
    });
    const chip = root().querySelector("a.chip");
    input.source = "See [a chip](app:user/1) here and more";
    flushSync();
    input.source = "See [a chip](app:user/1) here and more words";
    flushSync();
    expect(root().querySelector("a.chip")).toBe(chip);
    input.source = "See [a chip](app:user/2) here and more words";
    flushSync();
    expect(root().querySelector("a.chip")).toBe(chip);
    expect(chip?.getAttribute("data-href")).toBe("app:user/2");
  });

  test("an open fence is incomplete until it closes", () => {
    const { input, root } = host({ source: "```ts\nconst a", streaming: true });
    const block = (): Element | null => root().querySelector("[data-block]");
    expect(block()?.getAttribute("data-open")).toBe("true");
    expect(block()?.getAttribute("data-language")).toBe("ts");
    input.source = "```ts\nconst a = 1;\n```\n";
    flushSync();
    expect(block()?.getAttribute("data-open")).toBe("false");
    expect(block()?.textContent).toBe("const a = 1;\n");
  });

  test("unfinished syntax is completed while streaming, and not once settled", () => {
    const { input, root } = host({ source: "Some **bold te", streaming: true });
    expect(root().querySelector("strong")?.textContent).toBe("bold te");
    input.streaming = false;
    flushSync();
    expect(root().querySelector("strong")).toBeNull();
  });
});

describe("settle", () => {
  test("the settled reply renders as written, its snippets kept", () => {
    const { input, root } = host({ source: REPLY, streaming: true });
    const before = blockIds(root());
    const mounted = blocks.mounted;
    input.streaming = false;
    flushSync();
    expect(blockIds(root())).toEqual(before);
    expect(blocks.mounted).toBe(mounted);
    expect(root().hasAttribute("data-streaming")).toBe(false);
  });

  test("the last words fade in as the stream ends, and the stream stops once they have", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const { input, root } = host({
      source: "First words",
      streaming: true,
      animated: { duration: 120 },
    });
    // Text on screen when the element first renders never fades.
    expect(faded(root())).toEqual([]);
    input.source = "First words and more";
    flushSync();
    expect(faded(root())).toEqual([" and more"]);
    input.source = "First words and more, last";
    input.streaming = false;
    flushSync();
    expect(faded(root())).toEqual([" and more", ", last"]);
    expect(root().hasAttribute("data-streaming")).toBe(true);
    vi.advanceTimersByTime(300);
    flushSync();
    expect(faded(root())).toEqual([]);
    expect(root().hasAttribute("data-streaming")).toBe(false);
    expect(root().textContent?.trim()).toBe("First words and more, last");
  });

  test("a snippet stays whole when a fade around it ends", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const { input, root } = host({
      source: "See [x](app:user/1) and",
      streaming: true,
      animated: { duration: 30 },
    });
    input.source = "See [x](app:user/1) and more words";
    flushSync();
    input.source = "See [](app:user/2) and more words";
    flushSync();
    expect(root().querySelector("a.chip")?.textContent).toBe("");
    input.source = "See [](app:user/2) and more words again";
    flushSync();
    vi.advanceTimersByTime(100);
    // Words merges the paragraph's text as its fade ends, the chip's empty
    // text node included; the chip is mounted again, and draws what comes.
    await Promise.resolve();
    input.source = "See [back](app:user/3) and more words again";
    flushSync();
    expect(root().querySelector("a.chip")?.textContent).toBe("back");
  });
});

describe("options", () => {
  test("a changed option renders again, the snippets staying mounted", () => {
    const { input, root } = host({ source: `${REPLY}\n\nMath $x^2$ here.` });
    expect(root().querySelector("svg")).toBeNull();
    expect(root().textContent).toContain("$x^2$");
    expect(root().textContent).toContain("$5 and $10");
    const live = blocks.live.size;
    input.options = { math: true };
    flushSync();
    expect(root().querySelector("svg")).not.toBeNull();
    expect(root().textContent).toContain("$5 and $10");
    expect(blocks.live.size).toBe(live);
  });

  test("an option Words takes reaches it as given", () => {
    const { input, root } = host({ source: "```ts\nx\n```" });
    input.options = { components: { h1: (html) => html } };
    flushSync();
    input.source = "# Title";
    input.options = {
      components: { h1: (html) => html.replace("<h1 ", '<h1 class="big" ') },
    };
    flushSync();
    expect(root().querySelector("h1.big")?.textContent).toBe("Title");
  });

  test("class takes Svelte's arrays and objects, and other attributes reach the root", () => {
    const { input, root } = host({ source: "x", streaming: true });
    expect(root().className).toBe("md streaming");
    input.streaming = false;
    flushSync();
    expect(root().className).toBe("md");
    expect(root().getAttribute("data-markdown")).toBe("root");
  });
});

describe("URLs", () => {
  test("a link a snippet takes gets its own scheme; Words checks the rest", () => {
    const { root } = host({ source: REPLY });
    const links = [...root().querySelectorAll("a")].map((a) => ({
      chip: a.classList.contains("chip"),
      href: a.getAttribute("href"),
      app: a.getAttribute("data-href"),
      text: a.textContent,
    }));
    expect(links).toEqual([
      { chip: true, href: "#app:user/42", app: "app:user/42", text: "a chip" },
      { chip: false, href: "https://example.com", app: null, text: "the web" },
      { chip: false, href: null, app: null, text: "a script" },
      { chip: true, href: "#app:user/7", app: "app:user/7", text: "another chip" },
    ]);
  });

  test("a scheme Words refuses and no snippet takes loses its destination", () => {
    const { root } = host({ source: "[x](other:thing) and [y](app:user/1)" });
    const plain = root().querySelector("a:not(.chip)");
    expect(plain?.textContent).toBe("x");
    expect(plain?.hasAttribute("href")).toBe(false);
  });
});

describe("mounting", () => {
  test("snippets unmount when their element goes and when the markdown is destroyed", () => {
    const { input, app } = host({ source: "```js\na\n```\n\n```py\nb\n```" });
    expect(blocks.live.size).toBe(2);
    input.source = "```js\na\n```";
    flushSync();
    expect(blocks.live.size).toBe(1);
    cleanups.length = 0;
    unmount(app);
    flushSync();
    expect(blocks.live.size).toBe(0);
  });

  test("the attachment renders into an element of your own", () => {
    const target = document.createElement("article");
    document.body.append(target);
    const input = $state({ source: "# Title\n\nBody" });
    const cleanup = $effect.root(() => {
      $effect(() => markdown(() => ({ source: input.source }))(target));
    });
    flushSync();
    cleanups.push(cleanup);
    expect(target.querySelector("h1")?.textContent).toBe("Title");
    input.source = "# Title\n\nBody, longer";
    flushSync();
    expect(target.querySelector("p")?.textContent).toBe("Body, longer");
  });
});

describe("hydration", () => {
  test("the server's HTML is adopted, and the snippets mount in their places", () => {
    const target = document.createElement("div");
    target.innerHTML = inject("serverHtml");
    document.body.append(target);
    const paragraph = target.querySelector("p");
    // Before hydration the server's HTML reads whole: Words' own link.
    expect(
      target.querySelector('[data-words-snippet="link"] a')?.textContent
    ).toBe("a chip");
    const input = $state({ source: REPLY });
    const app = hydrate(Host, { target, props: { input } });
    flushSync();
    cleanups.push(() => unmount(app));
    expect(target.querySelector("p")).toBe(paragraph);
    expect(target.querySelectorAll("a.chip")).toHaveLength(2);
    expect(target.querySelectorAll("[data-block]")).toHaveLength(1);
  });
});
