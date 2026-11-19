/**
 * The snippets mounted into a render's placeholders (render.ts).
 *
 * Words patches its DOM to match each new render, and a placeholder holds
 * nothing in that render, so whatever a snippet drew inside one would be
 * patched away. Around each update the snippets of the block still being
 * written (the root's last, the only one a stream's update reaches) are held
 * aside and put back, keeping their state and DOM; when an update reaches
 * further (a settle, an edit, a new option), all are. A mounted snippet
 * whose placeholder is patched anyway is mounted again, one whose
 * placeholder is gone is unmounted, and one whose value changed is given it.
 *
 * When a fade ends, Words merges the text of the element it faded in
 * (`Node.normalize()`), which reaches into the snippets there: a text node
 * Svelte holds that is empty, or that follows another, is taken out of the
 * page, and what Svelte later writes into it is never seen. A snippet that
 * loses a text node that way is mounted again.
 */
import { mount, unmount } from "svelte";
import { SLOT, VALUE } from "./render.js";
import Slot from "./Slot.svelte";
const KINDS = [
    "link",
    "image",
    "inlineCode",
    "code",
];
const isKind = (kind) => KINDS.some((known) => known === kind);
/** The snippets alone, out of everything the attachment reads. */
const snippetsOf = ({ link, image, inlineCode, code, }) => ({ link, image, inlineCode, code });
/** What a placeholder carries: its kind, and its value as JSON. */
function slottedIn(placeholder) {
    const kind = placeholder.getAttribute(SLOT);
    return isKind(kind)
        ? { kind, value: JSON.parse(placeholder.getAttribute(VALUE) ?? "null") }
        : null;
}
const PLACEHOLDER = `[${SLOT}]`;
const CARET = '[data-markdown="caret"]';
/** The root's last block: the one a stream's next update rewrites. */
function lastBlock(root) {
    let block = root.lastElementChild;
    while (block?.matches(CARET)) {
        block = block.previousElementSibling;
    }
    return block;
}
/** Whether `record` took out a text node the way `normalize()` does: an empty one, or one merged into the text before it. */
const merged = (record) => [...record.removedNodes].some((node) => node instanceof Text &&
    (node.data === "" ||
        (record.previousSibling instanceof Text &&
            record.previousSibling.data.endsWith(node.data))));
export class Mounts {
    #root;
    #context;
    #mounted = new Map();
    #merges = new MutationObserver((records) => this.#repair(records));
    constructor(root, context) {
        this.#root = root;
        this.#context = context;
    }
    /** Before an update: hold aside what it may patch, everything when `all`. */
    hold(all) {
        const last = all ? null : lastBlock(this.#root);
        for (const [placeholder, mounted] of this.#mounted) {
            if (all || last?.contains(placeholder)) {
                const held = document.createDocumentFragment();
                held.append(...placeholder.childNodes);
                mounted.held = held;
            }
        }
        this.#merges.takeRecords();
    }
    /** After an update: put back what was held, and mount and unmount to match the placeholders. */
    settle(snippets) {
        for (const [placeholder, mounted] of this.#mounted) {
            this.#keep(placeholder, mounted, snippets);
        }
        for (const placeholder of this.#root.querySelectorAll(PLACEHOLDER)) {
            if (this.#mounted.has(placeholder) ||
                placeholder.parentElement?.closest(PLACEHOLDER)) {
                continue;
            }
            const slotted = slottedIn(placeholder);
            if (slotted && snippets[slotted.kind]) {
                this.#mount(placeholder, slotted, snippets);
            }
        }
        // What was moved and mounted here is no merge.
        this.#merges.takeRecords();
    }
    destroy() {
        this.#merges.disconnect();
        for (const [placeholder, mounted] of this.#mounted) {
            this.#unmount(placeholder, mounted);
        }
    }
    /** Mount again each snippet a merge took a text node out of. */
    #repair(records) {
        const hit = new Set();
        for (const record of records) {
            const placeholder = record.target instanceof Element
                ? record.target.closest(PLACEHOLDER)
                : null;
            if (placeholder && this.#mounted.has(placeholder) && merged(record)) {
                hit.add(placeholder);
            }
        }
        for (const placeholder of hit) {
            const mounted = this.#mounted.get(placeholder);
            if (mounted && !mounted.held) {
                this.#unmount(placeholder, mounted);
                this.#mount(placeholder, mounted.props.slotted, mounted.props.snippets);
            }
        }
        this.#merges.takeRecords();
    }
    /** Keep a mounted snippet after an update, given what its placeholder now carries; unmount it when it can't stay. */
    #keep(placeholder, mounted, snippets) {
        const slotted = this.#root.contains(placeholder)
            ? slottedIn(placeholder)
            : null;
        if (!(slotted && snippets[slotted.kind])) {
            this.#unmount(placeholder, mounted);
            return;
        }
        if (mounted.held) {
            placeholder.replaceChildren(mounted.held);
            mounted.held = null;
        }
        else if (mounted.marker.parentNode !== placeholder) {
            // Patched anyway: mounted again, as a new placeholder is.
            this.#unmount(placeholder, mounted);
            return;
        }
        if (KINDS.some((kind) => mounted.props.snippets[kind] !== snippets[kind])) {
            mounted.props.snippets = snippetsOf(snippets);
        }
        const raw = placeholder.getAttribute(VALUE);
        if (raw !== mounted.raw) {
            mounted.raw = raw;
            mounted.props.slotted = slotted;
        }
    }
    #mount(placeholder, slotted, snippets) {
        const marker = document.createComment("");
        // What the server wrote in the placeholder gives way to the snippet.
        placeholder.replaceChildren(marker);
        const props = $state({ slotted, snippets: snippetsOf(snippets) });
        const instance = mount(Slot, {
            target: placeholder,
            props,
            context: this.#context,
        });
        this.#merges.observe(placeholder, { childList: true, subtree: true });
        this.#mounted.set(placeholder, {
            held: null,
            instance,
            marker,
            props,
            raw: placeholder.getAttribute(VALUE),
        });
    }
    #unmount(placeholder, mounted) {
        this.#mounted.delete(placeholder);
        unmount(mounted.instance);
        mounted.marker.remove();
    }
}
