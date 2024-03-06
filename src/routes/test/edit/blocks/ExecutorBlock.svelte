<script lang="ts">
  import { test, updateBlock } from "$lib/stores/blocks";
  import type { ExecutorBlock } from "$lib/stores/blocks/model/loose";
  import { EXECUTOR_COLOR } from "./colors";
  import StringInput from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";

  export let block: ExecutorBlock;

  function handleVUsChange(value: string) {
    test.update((test) => {
      return updateBlock(test, {
        ...block,
        executor: {
          ...block.executor,
          vus: +value,
        },
      });
    });
  }

  function handleDurationChange(value: string) {
    test.update((test) => {
      return updateBlock(test, {
        ...block,
        executor: {
          ...block.executor,
          duration: value,
        },
      });
    });
  }
</script>

<Block {block} color={EXECUTOR_COLOR} top={true}>
  {#if block.executor.type === "constant-vus"}
    <Field
      ><StringInput size={3} value={block.executor.vus} onChange={handleVUsChange} /> VUs for <StringInput
        size={3}
        value={block.executor.duration}
        onChange={handleDurationChange}
      /></Field
    >
  {/if}
</Block>
