<script lang="ts">
  import type { ExecutorBlock } from "$lib/stores/test/types";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";
  import StringInput from "./inputs/StringInput.svelte";

  export let block: ExecutorBlock;
</script>

<Block
  {block}
  type="executor"
  connect="both"
  color={{ primary: "rgb(34 197 94)", secondary: "rgb(187 247 208)" }}
>
  {#if block.executor.type === "constant-vus"}
    <Field
      ><StringInput size={3} value={block.executor.vus} /> VUs for <StringInput
        size={3}
        value={block.executor.duration}
      /></Field
    >
  {/if}
</Block>
