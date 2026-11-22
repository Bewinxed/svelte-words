<script lang="ts">
  let { live = false }: { live?: boolean } = $props();
</script>

<!-- Starts with an {#if}, as a status dot does: Svelte anchors it with an empty text node. -->
{#if live}<span data-dot="live"></span>{:else}<span data-dot="unread"></span>{/if}
