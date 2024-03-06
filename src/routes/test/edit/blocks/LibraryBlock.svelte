<script lang="ts">
  import { insertNext, test } from "$lib/stores/blocks";
  import { type Block as BlockType, type LibraryBlock } from "$lib/stores/blocks/model/loose";
  import { isStepBlock } from "$lib/stores/blocks/utils";
  import AnyBlock from "./AnyBlock.svelte";
  import { STEP_COLOR } from "./colors";
  import StringInput from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";

  export let block: LibraryBlock;

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
    <Field>
      {block.name}
    </Field>
    {#each Object.entries(block.parameters) as [key, param] (key)}
      {#if param.type === "string"}
        <Field>
          {key}: <StringInput value={param.value} onChange={() => {}} />
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
