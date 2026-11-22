<script lang="ts">
  import type { MarkdownLink } from "../../src/index.js";
  import { Markdown } from "../../src/index.js";
  import Chip from "./Chip.svelte";
</script>

{#snippet link({ href }: MarkdownLink)}<Chip href={href ?? ""} />{/snippet}

<Markdown
  source="See [x](app:pin/1) here"
  options={{ urlTransform: (url: string) => url }}
  {link}
  when={{ link: ({ href }) => !!href?.startsWith("app:") }}
/>
