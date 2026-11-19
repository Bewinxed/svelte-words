<script lang="ts">
  import { Markdown } from "svelte-words";
  import { createHighlightsPlugin } from "@pierre/words/highlights";
  import pierreDark from "@pierre/highlights/themes/pierre-dark";
  import { REPLY } from "./content.js";

  /**
   * The left side's headline. words: "Words for Svelte" leads. package: Pierre's
   * package name leads. credit: the credit to Pierre is the headline.
   * The right side is always the reply rendered mid-stream by svelte-words.
   */
  let { variant }: { variant: string } = $props();

  const options = { plugins: { code: createHighlightsPlugin({ theme: pierreDark }) } };
</script>

<main class="card {variant}">
  <section class="side">
    <p class="kicker">Unofficial Svelte port</p>
    {#if variant === "package"}
      <h1 class="pkg">@pierre/words</h1>
      <p class="for">for Svelte&nbsp;5</p>
    {:else if variant === "credit"}
      <h1 class="credit-head">Words, by The Pierre Computer Company.</h1>
      <p class="sub">Their streaming Markdown renderer, ported to Svelte&nbsp;5.</p>
    {:else}
      <h1>Words for Svelte</h1>
      <p class="sub">A Svelte&nbsp;5 port of @pierre/words by The Pierre Computer Company.</p>
    {/if}
    <footer>
      <code class="install">npm i svelte-words</code>
      <p class="byline">Words by The Pierre Computer Company<br />diffs.com/words</p>
    </footer>
  </section>

  <section class="panel">
    <header>
      <span class="dot"></span><span class="file">assistant</span><span class="live">streaming</span>
    </header>
    <div class="reply">
      <Markdown source={REPLY} streaming caret="block" {options} />
    </div>
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
    display: flex;
    flex-direction: column;
    padding: 72px 64px 60px 85px;
  }
  .kicker {
    margin: 0;
    font: 500 22px/1 "Inter Variable", sans-serif;
    color: #a3a3a3;
  }
  h1 {
    margin: 60px 0 0;
    font-size: 72px;
    font-weight: 700;
    letter-spacing: -0.035em;
    line-height: 1.02;
  }
  .pkg {
    font: 600 60px/1 "Geist Mono Variable", monospace;
    letter-spacing: -0.04em;
  }
  .for {
    margin: 14px 0 0;
    font-size: 60px;
    font-weight: 400;
    letter-spacing: -0.03em;
    line-height: 1;
    color: #c4c4c4;
  }
  .credit-head {
    margin-top: 64px;
    font-size: 54px;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }
  .sub {
    margin: 22px 0 0;
    max-width: 24ch;
    font-size: 27px;
    line-height: 1.4;
    letter-spacing: -0.01em;
    color: #c4c4c4;
  }
  footer {
    margin-top: auto;
  }
  .install {
    display: block;
    font: 400 28px/1 "Geist Mono Variable", monospace;
    color: #e5e5e5;
  }
  .byline {
    margin: 18px 0 0;
    font-size: 19px;
    line-height: 1.4;
    color: #8a8a8a;
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
  .reply :global([data-markdown="code-block"] pre) {
    font-size: 20px;
    padding-top: 4px;
  }
  :global([data-markdown="caret"])::after {
    background: #ff3e00 !important;
  }
</style>
