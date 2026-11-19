<script lang="ts">
  import { Markdown } from "../../src/index.js";

  let { source }: { source: string } = $props();
</script>

<Markdown {source} />
<Markdown {source} />
