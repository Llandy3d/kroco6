<script lang="ts">
  import { updateBlock } from "$lib/stores/test";
  import { type GroupBlock, isStepBlock } from "$lib/stores/test/types";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import Collection from "./primitives/Collection.svelte";
  import { STEP_COLOR } from "./colors";
  import AnyBlock from "./AnyBlock.svelte";

  export let block: GroupBlock;

  const handleNameChange = (ev: CustomEvent<StringInputChangeEvent>) => {
    updateBlock({
      ...block,
      name: ev.detail.value,
    });
  };
</script>

<Block {block} top={true} bottom={isStepBlock} color={STEP_COLOR}>
  <svelte:fragment>
    <Field>Grouped as <StringInput value={block.name} on:change={handleNameChange} /></Field>
    <Field>do the following:</Field>
    <Collection name="steps" owner={block} accepts={isStepBlock} color={STEP_COLOR} let:child>
      {#if child !== null}
        <AnyBlock block={child} />
      {/if}
    </Collection>
  </svelte:fragment>
  <svelte:fragment slot="next" let:child>
    {#if child !== null}
      <AnyBlock block={child} />
    {/if}
  </svelte:fragment>
</Block>
