/** A reply cut mid-stream, partway through its code fence. */
export const REPLY = `### Debouncing the search box

Run the handler **once typing stops**, not on every key:

- keep one timer outside the handler
- clear it on each call, then start it again

\`\`\`ts
export function debounce(fn, ms = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

input.oninput = debounce((e) => sea`;

/** The component that draws it, as a reader would write it. */
export const SOURCE = `\`\`\`svelte
<script lang="ts">
  import { Markdown } from "svelte-words";

  let { reply } = $props();
</script>

<Markdown
  source={reply.text}
  streaming={reply.open}
  caret="block"
  animated
/>
\`\`\``;

/** The one call, as the pair variant shows it above its output. */
export const CALL = "```svelte\n<Markdown source={text} streaming />\n```";
