import type { HTMLAttributes } from "svelte/elements";
import type { MarkdownOptions } from "./types.js";
export interface MarkdownProps extends MarkdownOptions, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The whole markdown so far. */
    source: string;
    /** More of the source is still coming. */
    streaming?: boolean;
}
declare const Markdown: import("svelte").Component<MarkdownProps, {}, "">;
type Markdown = ReturnType<typeof Markdown>;
export default Markdown;
