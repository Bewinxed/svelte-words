/**
 * The one module that imports @pierre/words: everything this package uses
 * of it, through its public entry (`@pierre/words/html`) alone. A Words
 * release that moves something is fixed here.
 */
import {
  type AnimateOptions,
  type CodeOptions,
  type Components,
  createDomRenderer,
  createHtmlRenderer,
  defaultUrlTransform,
  escapeHtml,
  type HtmlOptions,
} from "@pierre/words/html";

/** Words' DOM renderer: what patches an element as its markdown grows. */
export type DomRenderer = ReturnType<typeof createDomRenderer>;

/** The caret Words draws at a stream's end. */
export type Caret = Parameters<DomRenderer["update"]>[4];

export {
  type AnimateOptions,
  type CodeOptions,
  type Components,
  createDomRenderer,
  createHtmlRenderer,
  defaultUrlTransform,
  escapeHtml,
  type HtmlOptions,
};
