<script lang="ts">
  import { insertNext, insertStep, updateBlock } from "$lib/stores/blocks";
  import { type Block as BlockType, type GroupBlock } from "$lib/stores/blocks/model/loose";
  import { isStepBlock } from "$lib/stores/blocks/utils";
  import { getCurrentTest } from "../blockEditorContext";
  import AnyBlock from "./AnyBlock.svelte";
  import { STEP_COLOR } from "./colors";
  import StringInput from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import Collection from "./primitives/Collection.svelte";
  import Field from "./primitives/Field.svelte";

  export let block: GroupBlock;

  const test = getCurrentTest();

  function handleNameChange(value: string) {
    test.update((test) =>
      updateBlock(test, {
        ...block,
        name: value,
      }),
    );
  }

  function handleDropStep(step: BlockType) {
    if (!isStepBlock(step)) {
      return;
    }

    test.update((test) => insertStep(test, block, step));
  }

  function handleDropNext(next: BlockType) {
    if (!isStepBlock(next)) {
      return;
    }

    test.update((test) => insertNext(test, block, next));
  }
</script>

<Block
  {block}
  top={true}
  color={STEP_COLOR}
  bottom={{ block: block.next, accepts: isStepBlock, onDrop: handleDropNext }}
>
  <svelte:fragment>
    <Field>Grouped as <StringInput value={block.name} onChange={handleNameChange} /></Field>
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
