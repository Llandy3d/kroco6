<script lang="ts">
  import { insertNext, test, updateBlock } from "$lib/stores/blocks";
  import type { Block as BlockType, SleepBlock } from "$lib/stores/blocks/model/loose";
  import { isStepBlock } from "$lib/stores/blocks/utils";
  import AnyBlock from "./AnyBlock.svelte";
  import { STEP_COLOR } from "./colors";
  import StringInput from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";

  export let block: SleepBlock;

  function handleSecondsChange(value: string) {
    test.update((test) => {
      return updateBlock(test, {
        ...block,
        seconds: +value,
      });
    });
  }

  function handleNextDrop(next: BlockType) {
    if (!isStepBlock(next)) {
      return;
    }

    test.update((test) => insertNext(test, block, next));
  }
</script>

<Block
  {block}
  color={STEP_COLOR}
  top={true}
  bottom={{ block: block.next, accepts: isStepBlock, onDrop: handleNextDrop }}
>
  <svelte:fragment>
    <Field
      >Wait for <StringInput size={3} value={block.seconds} onChange={handleSecondsChange} /> seconds</Field
    >
  </svelte:fragment>
  <svelte:fragment slot="next" let:next>
    {#if next !== null}
      <AnyBlock block={next} />
    {/if}
  </svelte:fragment>
</Block>
