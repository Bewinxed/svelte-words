/**
 * Words' options for a render, with the snippets' elements written as
 * placeholders: an element a snippet takes becomes a `display: contents`
 * element carrying its kind and its value as JSON, which the attachment
 * mounts the snippet into (mounts.svelte.ts). A placeholder holds nothing,
 * or, rendered for the server, what Words would have written there, so the
 * page reads whole before it hydrates.
 *
 * Every element comes through Words' documented hooks: a link, an image and
 * a code span through `components` (the element's HTML in, HTML out), a
 * fenced block through `plugins.renderers` (its code, language and state).
 */
import type { MarkdownInput } from "./types.js";
import { type HtmlOptions } from "./words.js";
/** The attribute naming a placeholder's snippet. */
export declare const SLOT = "data-words-snippet";
/** The attribute holding a placeholder's value, as JSON. */
export declare const VALUE = "data-words-value";
/**
 * The options one rendered element gives Words, for each input in turn.
 * `fallback` writes, inside each placeholder, what Words would have written
 * there: the server's render. Words keeps what it rendered while the
 * options it is given compare equal, so the fence renderer is one function
 * for the element's life, reading the latest input.
 */
export declare function wordsOptionsOf(fallback: boolean): (input: MarkdownInput) => HtmlOptions;
/**
 * `input` rendered once, as HTML: what Words writes, each element a snippet
 * takes written as Words writes it, inside the placeholder the snippet
 * mounts into once the `markdown` attachment runs on the element holding it.
 */
export declare function renderMarkdown(input: MarkdownInput): string;
