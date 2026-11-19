<script lang="ts" module>
  import type { AnimateOptions, HtmlOptions } from "../../src/index.js";

  export interface HostInput {
    animated?: boolean | AnimateOptions;
    options?: HtmlOptions;
    source: string;
    streaming?: boolean;
  }
</script>

<script lang="ts">
  import type {
    CodeOptions,
    MarkdownInlineCode,
    MarkdownLink,
  } from "../../src/index.js";
  import { Markdown } from "../../src/index.js";
  import Block from "./Block.svelte";

  let { input }: { input: HostInput } = $props();

  const urlTransform = (url: string) => (/^(?:javascript|data):/iu.test(url) ? null : url);
</script>

{#snippet link({ href, text }: MarkdownLink)}<a class="chip" href="#{href}" data-href={href}>{text}</a>{/snippet}
{#snippet code(block: CodeOptions)}<Block {...block} />{/snippet}
{#snippet inlineCode({ code: text }: MarkdownInlineCode)}<kbd>{text}</kbd>{/snippet}

<Markdown
  source={input.source}
  streaming={input.streaming}
  animated={input.animated}
  options={{ urlTransform, ...input.options }}
  {link}
  {code}
  {inlineCode}
  when={{
    link: ({ href }) => !!href?.startsWith("app:"),
    inlineCode: ({ code: text }) => text.startsWith("/"),
  }}
  class={["md", { streaming: input.streaming }]}
  data-testid="root"
/>
