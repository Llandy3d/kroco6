<script lang="ts">
  import { insertNext, test, updateBlock } from "$lib/stores/blocks";
  import type { Block as BlockType, SleepBlock } from "$lib/stores/blocks/model/loose";
  import { isStepBlock } from "$lib/stores/blocks/utils";
  import { STEP_COLOR } from "./colors";
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";

  export let block: SleepBlock;

  function handleSecondsChange(ev: CustomEvent<StringInputChangeEvent>) {
    test.update((test) => {
      return updateBlock(test, {
        ...block,
        seconds: +ev.detail.value,
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
  <Field>Wait for <StringInput size={3} on:change={handleSecondsChange} /> seconds</Field>
</Block>
