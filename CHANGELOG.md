# Changelog

## 0.2.0

For `@pierre/words` 0.3.x (built and checked against 0.3.0).

- Words 0.3.0 joins only the text a fade moved when the fade ends, so it
  leaves a snippet's DOM alone (pierrecomputer/pierre#1308). The watch that
  mounted a snippet again when a text node left it is gone: it also fired
  when Svelte took out a text node of its own, such as the empty one a
  component starting with `{#if}` leaves behind it, and mounted the snippet
  again, losing its state.

## 0.1.1

First release published by CI, for `@pierre/words` 0.2.x (built and checked
against 0.2.2). The 0.1.0 on npm is an older build of the same work; use
0.1.1.

- `<Markdown>`: a streaming markdown component over Words' DOM renderer.
- The `markdown` attachment, for an element of your own.
- `link`, `image`, `inlineCode` and `code` snippets, with `when` to choose
  which elements they take; mounted once per element and kept while the text
  around them streams.
- `setMarkdownDefaults` for the options a subtree inherits.
- `renderMarkdown` for server HTML, which the attachment adopts on hydration.
- Mermaid through Words' own `plugins.mermaid`, with the Pele you pass in;
  a closed diagram that does not parse goes to the `code` snippet. The
  package imports neither Pele nor `@pierre/words/mermaid`.
