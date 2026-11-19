import { createHtmlRenderer, defaultUrlTransform, escapeHtml, } from "./words.js";
/** The attribute naming a placeholder's snippet. */
export const SLOT = "data-words-snippet";
/** The attribute holding a placeholder's value, as JSON. */
export const VALUE = "data-words-value";
/**
 * Words checks every URL `urlTransform` returns, so a destination only a
 * snippet may draw (an app's own scheme) passes the check as a relative
 * URL, a fragment carrying it, and is read back from there.
 */
const CARRIED = "#words-svelte:";
const CARRIED_ATTRIBUTE = new RegExp(` (?:href|src)="${CARRIED}[^"]*"`, "gu");
const ENTITIES = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
};
const ENTITY = /&(?:amp|lt|gt|quot|#39|#x27);/gu;
/** Escaped HTML's text. */
const decodeHtml = (value) => value.replace(ENTITY, (entity) => ENTITIES[entity] ?? entity);
const ATTRIBUTE = /\s([\w:-]+)(?:="([^"]*)")?/gu;
const TAG = /<[^>]*>/gu;
/** An element's HTML read: its opening tag's attributes, and what it holds. */
function readElement(html) {
    const open = html.indexOf(">");
    const attributes = new Map();
    for (const [, name = "", value = ""] of html
        .slice(0, open)
        .matchAll(ATTRIBUTE)) {
        attributes.set(name, decodeHtml(value));
    }
    const close = html.lastIndexOf("</");
    return { attributes, inner: close > open ? html.slice(open + 1, close) : "" };
}
const textOf = (html) => decodeHtml(html.replace(TAG, ""));
/** A URL as `urlTransform` returned it, carried or not. */
const urlOf = (value) => {
    if (value === undefined) {
        return null;
    }
    return value.startsWith(CARRIED)
        ? decodeURIComponent(value.slice(CARRIED.length))
        : value;
};
/** What each kind's element holds, or null when the snippet leaves it to Words. */
const READ = {
    link: (html) => {
        const { attributes, inner } = readElement(html);
        // A footnote's reference and its way back stay Words'.
        if (attributes.has("data-footnote-ref") ||
            attributes.has("data-footnote-backref")) {
            return null;
        }
        return {
            href: urlOf(attributes.get("href")),
            title: attributes.get("title") ?? null,
            html: inner,
            text: textOf(inner),
        };
    },
    image: (html) => {
        const { attributes } = readElement(html);
        return {
            src: urlOf(attributes.get("src")) ?? "",
            alt: attributes.get("alt") ?? "",
            title: attributes.get("title") ?? null,
        };
    },
    inlineCode: (html) => ({ code: textOf(readElement(html).inner) }),
};
/** A placeholder for `kind`'s snippet, receiving `value`, holding `fallback`. */
function placeholder(kind, value, fallback) {
    const tag = kind === "code" ? "div" : "span";
    return `<${tag} ${SLOT}="${kind}" ${VALUE}="${escapeHtml(JSON.stringify(value))}" style="display:contents">${fallback}</${tag}>`;
}
/**
 * The Words hook that writes `kind`'s elements as its snippet's
 * placeholders: those `take` takes, every one when it is left out. `own`
 * is what Words writes of an element the snippet leaves.
 */
function hookOf(kind, take, own, fallback) {
    const read = READ[kind];
    return (html) => {
        const value = read(html);
        // A carried URL is a snippet's alone: Words draws a link without it,
        // and no image, as it does for a URL its check refuses.
        const bare = html.replace(CARRIED_ATTRIBUTE, "");
        const words = kind === "image" && bare !== html ? "" : own(bare);
        if (value === null || !(take?.(value) ?? true)) {
            return words;
        }
        return placeholder(kind, value, fallback ? words : "");
    };
}
/** The info string's first word of each fence in `source`: the languages Words hands a renderer. */
const FENCE_LANGUAGE = /(?:`{3,}|~{3,})[ \t]*([^\s`~]+)/gu;
function fenceLanguages(source) {
    const languages = new Set(["text"]);
    for (const [, language = ""] of source.matchAll(FENCE_LANGUAGE)) {
        languages.add(language);
    }
    return [...languages].sort();
}
/**
 * The options one rendered element gives Words, for each input in turn.
 * `fallback` writes, inside each placeholder, what Words would have written
 * there: the server's render. Words keeps what it rendered while the
 * options it is given compare equal, so the fence renderer is one function
 * for the element's life, reading the latest input.
 */
export function wordsOptionsOf(fallback) {
    let current;
    const fence = (block) => {
        if (!(current?.code && (current.when?.code?.(block) ?? true))) {
            return null;
        }
        return placeholder("code", block, fallback ? `<pre><code>${escapeHtml(block.code)}</code></pre>` : "");
    };
    return (input) => {
        current = input;
        const options = input.options ?? {};
        const { components = {}, plugins, urlTransform } = options;
        const when = input.when ?? {};
        /** What Words writes of an element no snippet takes: the consumer's own hook's, if any. */
        const own = (tag) => (html) => components[tag]?.(html) ?? html;
        const hooks = {};
        // In the order they run: a link's text is read before its code spans are.
        if (input.link) {
            hooks.a = hookOf("link", when.link, own("a"), fallback);
        }
        if (input.image) {
            hooks.img = hookOf("image", when.image, own("img"), fallback);
        }
        if (input.inlineCode) {
            hooks.inlineCode = hookOf("inlineCode", when.inlineCode, own("inlineCode"), fallback);
        }
        /** Whether a snippet may draw a `key` URL Words' check refuses. */
        const carries = (key) => key === "href" ? !!input.link : !!input.image;
        return {
            ...options,
            components: { ...hooks, ...components, ...hooks },
            plugins: input.code
                ? {
                    ...plugins,
                    renderers: [
                        ...(plugins?.renderers ?? []),
                        { language: fenceLanguages(input.source), render: fence },
                    ],
                }
                : plugins,
            urlTransform: urlTransform &&
                ((url, key) => {
                    const next = urlTransform(url, key);
                    return next === null ||
                        next === undefined ||
                        !carries(key) ||
                        defaultUrlTransform(next) !== undefined
                        ? next
                        : CARRIED + encodeURIComponent(next);
                }),
        };
    };
}
/**
 * `input` rendered once, as HTML: what Words writes, each element a snippet
 * takes written as Words writes it, inside the placeholder the snippet
 * mounts into once the `markdown` attachment runs on the element holding it.
 */
export function renderMarkdown(input) {
    const renderer = createHtmlRenderer(wordsOptionsOf(true)(input));
    try {
        const streaming = input.streaming ?? false;
        return renderer.render(input.source, streaming && (input.repair ?? true), streaming).html;
    }
    finally {
        renderer.dispose();
    }
}
