import { createRawSnippet } from "svelte";
import { render } from "svelte/server";
import { describe, expect, test } from "vitest";
import { renderMarkdown } from "../src/index.js";
import Host from "./fixtures/Host.svelte";
import Pair from "./fixtures/Pair.svelte";
import { REPLY } from "./fixtures/source.js";

describe("server render", () => {
  test("renderMarkdown writes Words' HTML, each snippet's element inside its placeholder", () => {
    const html = renderMarkdown({
      source: "A [chip](app:user/1) and `code`.\n\n```ts\nx\n```",
      options: { urlTransform: (url) => url },
      link: createRawSnippet(() => ({ render: () => "<a></a>" })),
      inlineCode: createRawSnippet(() => ({ render: () => "<kbd></kbd>" })),
      code: createRawSnippet(() => ({ render: () => "<pre></pre>" })),
      when: { link: ({ href }) => !!href?.startsWith("app:") },
    });
    expect(html).toContain('<span data-words-snippet="link"');
    expect(html).toContain('<span data-words-snippet="inlineCode"');
    expect(html).toContain('<div data-words-snippet="code"');
    // Inside each, what Words writes, for a page read before it hydrates.
    expect(html).toMatch(/data-words-snippet="link"[^>]*><a data-markdown="a">chip<\/a>/u);
    expect(html).toMatch(/data-words-snippet="code"[^>]*><pre><code>x\n<\/code><\/pre>/u);
  });

  test("the component renders on the server, each instance with its own footnote ids", async () => {
    const page = await render(Host, { props: { input: { source: REPLY } } });
    expect(page.body).toContain('data-markdown="root"');
    expect(page.body).toContain('class="md"');
    const pair = await render(Pair, {
      props: { source: "A note[^1].\n\n[^1]: The note." },
    });
    const ids = [...pair.body.matchAll(/id="([^"]*fnref[^"]*)"/gu)].map(
      ([, id]) => id
    );
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  test("links Words refuses lose their destination on the server too", () => {
    const html = renderMarkdown({
      source: "[a](javascript:alert(1)) [b](https://example.com)",
    });
    expect(html).toContain('<a data-markdown="a">a</a>');
    expect(html).toContain('href="https://example.com"');
  });
});
