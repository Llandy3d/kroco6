<script lang="ts">
  import type { ExecutorBlock } from "$lib/stores/test/types";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import { updateBlock } from "$lib/stores/test";

  export let block: ExecutorBlock;

  function handleVUsChange(ev: CustomEvent<StringInputChangeEvent>) {
    updateBlock({
      ...block,
      executor: {
        ...block.executor,
        vus: +ev.detail.value,
      },
    });
  }

  function handleDurationChange(ev: CustomEvent<StringInputChangeEvent>) {
    updateBlock({
      ...block,
      executor: {
        ...block.executor,
        duration: ev.detail.value,
      },
    });
  }
</script>

<Block {block} color={{ primary: "rgb(34 197 94)", secondary: "rgb(187 247 208)" }}>
  {#if block.executor.type === "constant-vus"}
    <Field
      ><StringInput size={3} value={block.executor.vus} on:change={handleVUsChange} /> VUs for <StringInput
        size={3}
        value={block.executor.duration}
        on:change={handleDurationChange}
      /></Field
    >
  {/if}
</Block>
