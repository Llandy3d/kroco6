<script lang="ts">
  import { detachBlock, updateBlock } from "$lib/stores/blocks";
  import {
    instantiate,
    type Block as BlockType,
    type GroupBlock,
  } from "$lib/stores/blocks/model/loose";
  import { isStepBlock } from "$lib/stores/blocks/utils";
  import AnyBlock from "./AnyBlock.svelte";
  import { STEP_COLOR } from "./colors";
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import Collection from "./primitives/Collection.svelte";
  import Field from "./primitives/Field.svelte";

  export let block: GroupBlock;

  function handleNameChange(ev: CustomEvent<StringInputChangeEvent>) {
    updateBlock({
      ...block,
      name: ev.detail.value,
    });
  }

  function handleDropStep(step: BlockType) {
    if (!isStepBlock(step)) {
      return;
    }

    detachBlock(step);
    updateBlock({
      ...block,
      step: {
        ...instantiate(step),
        next: block.step,
      },
    });
  }

  function handleDropNext(next: BlockType) {
    if (!isStepBlock(next)) {
      return;
    }

    detachBlock(next);
    updateBlock({
      ...block,
      next: {
        ...instantiate(next),
        next: block.next,
      },
    });
  }
</script>

<Block
  {block}
  top={true}
  color={STEP_COLOR}
  bottom={{ block: block.next, accepts: isStepBlock, onDrop: handleDropNext }}
>
  <svelte:fragment>
    <Field>Grouped as <StringInput value={block.name} on:change={handleNameChange} /></Field>
    <Field>do the following:</Field>
    <Collection
      owner={block}
      connection={{ block: block.step, accepts: isStepBlock, onDrop: handleDropStep }}
      color={STEP_COLOR}
      let:child
    >
      {#if child !== null}
        <AnyBlock block={child} />
      {/if}
    </Collection>
  </svelte:fragment>
  <svelte:fragment slot="next" let:next>
    {#if next !== null}
      <AnyBlock block={next} />
    {/if}
  </svelte:fragment>
</Block>
