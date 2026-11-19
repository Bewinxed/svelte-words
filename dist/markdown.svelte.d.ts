import type { Attachment } from "svelte/attachments";
import type { MarkdownInput } from "./types.js";
/**
 * Render markdown into the element this is attached to, and patch it as
 * `read()` changes: each update rewrites only what changed. `read` is read
 * in an effect, so whatever it reads is tracked; nothing needs to be kept
 * stable or memoized, and options that compare equal render nothing again.
 *
 * The element may already hold the render (`renderMarkdown`, or the
 * server's): the first update adopts it, and fades none of it.
 */
export declare function markdown(read: () => MarkdownInput): Attachment<HTMLElement>;
