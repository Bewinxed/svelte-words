# Changelog

## 0.1.0

First release, for `@pierre/words` 0.2.x (built and checked against 0.2.2).

- `<Markdown>`: a streaming markdown component over Words' DOM renderer.
- The `markdown` attachment, for an element of your own.
- `link`, `image`, `inlineCode` and `code` snippets, with `when` to choose
  which elements they take; mounted once per element and kept while the text
  around them streams.
- `setMarkdownDefaults` for the options a subtree inherits.
- `renderMarkdown` for server HTML, which the attachment adopts on hydration.
