<script lang="ts">
  import { detachBlock, updateBlock } from "$lib/stores/blocks";
  import {
    instantiate,
    type Block as BlockType,
    type HttpRequestBlock,
  } from "$lib/stores/blocks/model/loose";
  import { isStepBlock } from "$lib/stores/blocks/utils";
  import AnyBlock from "./AnyBlock.svelte";
  import { STEP_COLOR } from "./colors";
  import StringInput from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";

  export let block: HttpRequestBlock;

  function handleNextDrop(next: BlockType) {
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
  color={STEP_COLOR}
  top={true}
  bottom={{ block: block.next, accepts: isStepBlock, onDrop: handleNextDrop }}
>
  <svelte:fragment>
    <Field>
      {block.name}
    </Field>
    {#each Object.entries(block.parameters) as [key, param] (key)}
      {#if param.type === "string"}
        <Field>
          {key}: <StringInput value={param.value} />
        </Field>
      {/if}
    {/each}
  </svelte:fragment>
  <svelte:fragment slot="next">
    {#if block.next !== null}
      <AnyBlock block={block.next} />
    {/if}
  </svelte:fragment>
</Block>
