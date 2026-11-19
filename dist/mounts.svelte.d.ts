import type { MarkdownSnippets } from "./types.js";
export declare class Mounts {
    #private;
    constructor(root: HTMLElement, context?: Map<unknown, unknown>);
    /** Before an update: hold aside what it may patch, everything when `all`. */
    hold(all: boolean): void;
    /** After an update: put back what was held, and mount and unmount to match the placeholders. */
    settle(snippets: MarkdownSnippets): void;
    destroy(): void;
}
