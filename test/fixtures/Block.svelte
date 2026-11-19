<script lang="ts">
  import { onDestroy } from "svelte";
  import type { CodeOptions } from "../../src/index.js";
  import { blocks } from "./registry.js";

  let { code, language, isIncomplete }: CodeOptions = $props();
  const id = ++blocks.mounted;
  blocks.live.add(id);
  onDestroy(() => blocks.live.delete(id));
</script>

<pre data-block={id} data-language={language} data-open={isIncomplete}>{code}</pre>
