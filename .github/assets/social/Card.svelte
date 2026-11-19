<script lang="ts">
  import { Markdown } from "svelte-words";
  import { createHighlightsPlugin } from "@pierre/words/highlights";
  import pierreDark from "@pierre/highlights/themes/pierre-dark";
  import { CALL, REPLY, SOURCE } from "./content.js";

  /** stream: the reply rendered mid-stream. source: the component that draws it. pair: the call above its output. */
  let { variant }: { variant: string } = $props();

  const options = { plugins: { code: createHighlightsPlugin({ theme: pierreDark }) } };
</script>

{#snippet mark()}
  <div class="mark" aria-hidden="true">
    <span class="tile hash">#</span><span class="tile caret"><i></i></span>
  </div>
{/snippet}

<main class="card {variant}">
  <section class="side">
    {@render mark()}
    <h1><span class="thin">svelte-</span>words</h1>
    <p class="tagline">Streaming markdown for Svelte&nbsp;5, on @pierre/words.</p>
    <code class="install">npm i svelte-words</code>
  </section>

  <section class="panel">
    {#if variant === "source"}
      <header><span class="file">Reply.svelte</span></header>
      <div class="source">
        <Markdown source={SOURCE} {options} />
      </div>
    {:else}
      <header>
        {#if variant === "pair"}
          <span class="file">Reply.svelte</span>
        {:else}
          <span class="dot"></span><span class="file">assistant</span><span class="live">streaming</span>
        {/if}
      </header>
      {#if variant === "pair"}
        <div class="call"><Markdown source={CALL} {options} /></div>
      {/if}
      <div class="reply">
        <!-- Under the call there is room for less of the reply: cut it a few lines sooner. -->
        <Markdown
          source={variant === "pair" ? REPLY.slice(0, REPLY.indexOf(", ms);") + 4) : REPLY}
          streaming
          caret="block"
          {options}
        />
      </div>
    {/if}
  </section>
</main>

<style>
  :global(html, body) {
    margin: 0;
    background: #171717;
  }
  .card {
    width: 1280px;
    height: 640px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 640px;
    background: #171717;
    color: #fafafa;
    font-family: "Inter Variable", sans-serif;
    overflow: hidden;
  }
  .side {
    position: relative;
    padding: 72px 64px 0 85px;
  }
  .mark {
    display: flex;
    gap: 3px;
  }
  .tile {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
  }
  .hash {
    background: #fafafa;
    color: #171717;
    border-radius: 8px 0 0 8px;
    font: 700 34px/1 "Inter Variable", sans-serif;
  }
  .caret {
    background: #ff3e00;
    border-radius: 0 8px 8px 0;
  }
  .caret i {
    width: 14px;
    height: 26px;
    background: #fafafa;
  }
  h1 {
    margin: 118px 0 0;
    font-size: 76px;
    font-weight: 700;
    letter-spacing: -0.035em;
    line-height: 1;
  }
  .thin {
    font-weight: 400;
  }
  .tagline {
    margin: 22px 0 0;
    max-width: 22ch;
    font-size: 31px;
    line-height: 1.45;
    letter-spacing: -0.01em;
    color: #c4c4c4;
  }
  .install {
    position: absolute;
    left: 85px;
    bottom: 64px;
    font: 400 32px/1 "Geist Mono Variable", monospace;
    color: #a3a3a3;
  }

  .panel {
    background: #0a0a0a;
    border-left: 1px solid #262626;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  header {
    height: 76px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 40px;
    font: 500 22px/1 "Inter Variable", sans-serif;
    color: #a3a3a3;
  }
  .file {
    color: #fafafa;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ff3e00;
  }
  .live {
    margin-left: auto;
    font: 400 18px/1 "Geist Mono Variable", monospace;
    color: #737373;
  }
  .call {
    border-bottom: 1px solid #262626;
    padding-bottom: 14px;
  }
  .call :global([data-markdown="code-block"]) {
    border: 0;
    border-radius: 0;
    margin: 0;
  }
  .call :global([data-markdown="code-header"]) {
    display: none;
  }
  .call :global([data-markdown="code-block"] pre) {
    padding: 0 40px 0 28px;
    font: 400 21px/1.75 "Geist Mono Variable", monospace;
    gap: 28px;
  }
  .pair .reply {
    padding-top: 28px;
  }

  .reply {
    padding: 8px 40px 0;
    font-size: 21px;
    color: #e5e5e5;
  }
  .reply :global([data-markdown="root"]) {
    line-height: 1.6;
  }
  .reply :global(h3) {
    margin-block: 0 0.5em;
    font-size: 1.45em;
    letter-spacing: -0.02em;
    color: #fafafa;
  }
  .reply :global(strong) {
    color: #fafafa;
  }
  .reply :global(:is(p, ul)) {
    margin-block: 0.7em;
  }
  .reply :global([data-markdown="code"]) {
    font-family: "Geist Mono Variable", monospace;
  }
  .reply :global([data-markdown="code-block"]) {
    margin: 22px -40px 0;
    border: 0;
    border-top: 1px solid #262626;
    border-radius: 0;
    background: #0a0a0a;
  }
  .reply :global([data-markdown="code-header"]) {
    display: none;
  }
  .reply :global([data-markdown="code-block"] pre),
  .source :global([data-markdown="code-block"] pre) {
    padding: 18px 40px 0 28px;
    font: 400 19px/1.75 "Geist Mono Variable", monospace;
    max-height: none;
    gap: 28px;
    overflow: hidden;
  }
  .source :global([data-markdown="code-block"]) {
    border: 0;
    border-radius: 0;
    margin: 0;
  }
  .source :global([data-markdown="code-header"]) {
    display: none;
  }
  .source :global([data-markdown="code-block"] pre) {
    font-size: 20px;
    padding-top: 4px;
  }
  :global([data-markdown="caret"])::after {
    background: #ff3e00 !important;
  }
</style>
