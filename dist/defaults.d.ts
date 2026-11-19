import type { MarkdownOptions } from "./types.js";
/** The options inherited here: none outside any provider. */
export declare const markdownDefaults: () => MarkdownOptions;
/**
 * Provide `defaults` to every `<Markdown>` under this component, over those
 * an ancestor provides. Call it while the component initialises.
 */
export declare const setMarkdownDefaults: (defaults: MarkdownOptions) => MarkdownOptions;
