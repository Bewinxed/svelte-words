<div align="center">

<img src=".github/assets/social-preview.png" alt="@pierre/words for Svelte 5: an unofficial Svelte port of Words by The Pierre Computer Company" width="640">

# Words for Svelte

A Svelte 5 port of Pierre's [Words](https://diffs.com/words) ([`@pierre/words`](https://github.com/pierrecomputer/pierre/tree/main/packages/words)),
the streaming Markdown renderer by The Pierre Computer Company.

Unofficial; not affiliated with or endorsed by Pierre.

[![CI](https://img.shields.io/github/actions/workflow/status/Bewinxed/svelte-words/ci.yml?branch=main&style=flat-square&labelColor=171717&label=ci)](https://github.com/Bewinxed/svelte-words/actions/workflows/ci.yml)
[![Upstream Words](https://img.shields.io/github/actions/workflow/status/Bewinxed/svelte-words/upstream.yml?branch=main&style=flat-square&labelColor=171717&label=%40pierre%2Fwords%40latest)](https://github.com/Bewinxed/svelte-words/actions/workflows/upstream.yml)
[![npm](https://img.shields.io/npm/v/svelte-words?style=flat-square&labelColor=171717&color=ff3e00&label=npm)](https://www.npmjs.com/package/svelte-words)
[![Downloads](https://img.shields.io/npm/dm/svelte-words?style=flat-square&labelColor=171717&color=404040&label=downloads)](https://www.npmjs.com/package/svelte-words)
[![Size](https://img.shields.io/npm/unpacked-size/svelte-words?style=flat-square&labelColor=171717&color=404040&label=size)](https://www.npmjs.com/package/svelte-words?activeTab=code)
[![MIT](https://img.shields.io/github/license/Bewinxed/svelte-words?style=flat-square&labelColor=171717&color=404040)](https://github.com/Bewinxed/svelte-words/blob/main/LICENSE)
[![Svelte 5](https://img.shields.io/badge/svelte-5-ff3e00?style=flat-square&labelColor=171717&logo=svelte&logoColor=ff3e00)](https://svelte.dev)
[![Built on @pierre/words](https://img.shields.io/badge/built%20on-%40pierre%2Fwords-fafafa?style=flat-square&labelColor=171717)](https://diffs.com/words)

</div>

This package adds a `<Markdown>` component and a `markdown` attachment on top
of Words. You can pass Svelte snippets for links, images, code spans and code
blocks; each one mounts in place and keeps its state while the text around it
streams. Words' own options, plugins, styles, Mermaid and math are covered in
[its docs](https://diffs.com/docs#words).

```sh
bun add svelte-words @pierre/words
```

| svelte-words | @pierre/words | svelte  |
| ------------ | ------------- | ------- |
| 0.1.x        | 0.2.x         | ≥ 5.40  |

## Credits

Words is the work of [The Pierre Computer Company](https://github.com/pierrecomputer/pierre)
(Apache-2.0): the parser, the renderer, streaming, highlighting, Mermaid and
math are theirs. Ours is only the Svelte glue: the component, the attachment,
snippets, context defaults, and server rendering with hydration. Words is a
peer dependency you install yourself; none of its source is copied here.

## A message

```svelte
<script lang="ts">
  import { Markdown } from "svelte-words";

  let { text, streaming }: { text: string; streaming: boolean } = $props();
</script>

<Markdown source={text} {streaming} animated class="prose" />
```

Pass the whole text so far as `source` on every update, and `streaming` while
more of it is coming.

Every other attribute (`class` with Svelte's arrays and objects, `id`,
`aria-*`, an `{@attach}`) goes on the root, a `<div data-markdown="root">`.

## Your markup in the output

Give a snippet for a kind of element and it is drawn in that element's place:
`link`, `image`, `inlineCode`, or `code` for a fenced block. `when` narrows a
snippet to some of its elements; Words draws the rest.

```svelte
<script lang="ts">
  import { Markdown, type CodeOptions, type MarkdownLink } from "svelte-words";
  import CodeBlock from "./CodeBlock.svelte";
  import UserChip from "./UserChip.svelte";

  let { text, streaming } = $props();

  const urlTransform = (url: string) =>
    url.startsWith("app:user/") || /^https?:/.test(url) || !url.includes(":") ? url : null;
</script>

{#snippet code({ code, language, isIncomplete }: CodeOptions)}
  <CodeBlock {code} {language} live={isIncomplete} />
{/snippet}

{#snippet link({ href, text }: MarkdownLink)}
  <UserChip id={href?.slice("app:user/".length)} label={text} />
{/snippet}

<Markdown
  source={text}
  {streaming}
  {code}
  {link}
  when={{ link: ({ href }) => !!href?.startsWith("app:user/") }}
  options={{ urlTransform }}
/>
```

| Snippet      | Receives                                                                     |
| ------------ | ---------------------------------------------------------------------------- |
| `link`       | `{ href: string \| null, title: string \| null, html: string, text: string }` |
| `image`      | `{ src: string, alt: string, title: string \| null }`                        |
| `inlineCode` | `{ code: string }`                                                           |
| `code`       | Words' `CodeOptions`: `{ code: string, language: string, isIncomplete: boolean }` |

- A snippet is mounted once for its element and given new values as the
  element changes: a code block streaming line by line keeps one mounted
  component from its first line to the end of the stream. It is unmounted
  when its element goes away, and when the markdown is destroyed.
- Snippets are drawn in the context of the component that renders
  `<Markdown>`, so components inside them read its context.
- `html` is the link's content as the escaped HTML Words wrote, safe for
  `{@html}`.
- A link or image snippet receives the URL your `urlTransform` returned, even
  one Words' own check refuses (an app's own scheme, as above). Check or
  escape it as you draw it. Words draws every other link, and checks it.
- A code block's `code` is its lines, each ending in a line feed, and its
  `language` is `text` for a fence that names none, as Words gives them.

## Props

| Prop                                  | Default | What it does                                                                                  |
| ------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `source`                              |         | The whole markdown so far.                                                                    |
| `streaming`                           | `false` | More of the source is coming.                                                                 |
| `repair`                              | `true`  | Complete unfinished syntax while streaming.                                                   |
| `animated`                            | `false` | Words' fade of the text a stream adds: `true` or `{ duration }`.                               |
| `caret`                               |         | Words' `'block'` or `'circle'` caret at the end while streaming.                              |
| `options`                             |         | Words' renderer options (`HtmlOptions`), passed to Words as they are.                         |
| `link`, `image`, `inlineCode`, `code` |         | Snippets, above.                                                                              |
| `when`                                |         | Per snippet, which elements it takes.                                                         |

`options` is Words' own `HtmlOptions`, passed through as is, so an option a
later Words adds works here unchanged. Each `<Markdown>` gets its own
`idPrefix` unless you give one.

Everything is read reactively: change a prop and the output follows, rendered
again only when a value changed. Nothing needs to be memoized. A new hook
function applies to the output written after it, as in Words.

Text already on screen when the element first renders never fades. When the
stream ends, its last words fade in too, and the fades still running finish
before the stream is marked as stopped.

## Mermaid diagrams

Pass Words' Mermaid plugin, built from your own [Pele](https://pele.run), as
`options.plugins.mermaid` ([Words' Mermaid docs](https://diffs.com/docs#words-mermaid-diagrams)).
This package imports neither, so markdown without diagrams ships none of it.
Create the plugin once: Words redraws every diagram when it changes identity.
To load `pele/lazy` only when a diagram appears, keep the plugin in `$state`
and set it once Pele has loaded.

One difference from Words: a closed fence that does not parse goes to your
`code` snippet like any other fence, and your `code` snippet never receives a
diagram Pele draws.

## Defaults for a subtree

```svelte
<script lang="ts">
  import { setMarkdownDefaults } from "svelte-words";
  import { highlighting } from "./highlighting";

  setMarkdownDefaults({ options: { plugins: highlighting, controls: false }, animated: true });
</script>
```

Every `<Markdown>` under this component starts from these (snippets included),
each prop it is given overriding them, its `options` merged over theirs. A
nested call merges over its ancestor's.

## The attachment

`<Markdown>` is a `<div>` with the `markdown` attachment on it. Put the
attachment on an element of your own:

```svelte
<script lang="ts">
  import { getAllContexts } from "svelte";
  import { markdown } from "svelte-words";

  let { text, streaming } = $props();
  const context = getAllContexts();
</script>

<article {@attach markdown(() => ({ source: text, streaming, animated: true, context }))}></article>
```

The function is read in an effect, so whatever it reads is tracked. Pass
`context` when snippets read context.

## Server rendering

`<Markdown>` writes its HTML on the server, and on hydration the attachment
adopts it: the server's nodes stay, and the snippets mount in their places.
Until then each snippet's element reads as Words writes it.
`renderMarkdown(input)` returns that HTML on its own, for an element the
attachment takes over later.

## Updating Words

`@pierre/words` is a 0.x release, so each of our releases names the Words
minor it supports (above) and the peer range holds to it (`^0.2.2` is 0.2.x).

- `src/words.ts` is the only module that imports `@pierre/words`, and only its
  public `@pierre/words/html` entry. A Words release that moves something is
  fixed there.
- Words' options are its own types (`HtmlOptions`, `CodeOptions`,
  `AnimateOptions`), passed through untouched: an option a new Words adds
  works with no release of ours.
- The snippets ride on Words' documented hooks: `components` for links,
  images and code spans, `plugins.renderers` for fenced blocks, your
  `plugins.mermaid` for a diagram it shows as code, and `urlTransform`.
- CI runs the build, `svelte-check`, `publint` and the tests on every push,
  and daily against `@pierre/words@latest`, so a Words release that breaks
  something shows up before anyone upgrades. Dependabot opens the bump.

To move to a new Words: bump the dev dependency and the peer range, run
`bun run verify`, fix `src/words.ts` if it fails, and add the row to the table
above.

## Development

```sh
bun install
bun run verify   # build, svelte-check, publint, tests
```

## Releasing

CI publishes to npm. Bump `version` in
`package.json`, add its `CHANGELOG.md` entry, commit, then tag and push:

```sh
git tag v0.1.1 && git push origin main v0.1.1
```

The `Publish` workflow checks that the tag matches the version, runs
`bun run verify`, and publishes through npm's trusted publishing (OIDC, no
token), with a provenance attestation.

## License

MIT
