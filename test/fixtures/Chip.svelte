<script lang="ts">
  import Dot from "./Dot.svelte";
  import { toggle } from "./toggle.svelte.js";

  let { href }: { href: string } = $props();
  toggle.mounts += 1;
</script>

<a class="chip" href="#{href}">{#if toggle.dot}<Dot />{/if}label</a>
