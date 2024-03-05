<script lang="ts">
  import { insertStep, test, updateBlock } from "$lib/stores/blocks";
  import { type Block as BlockType, type ScenarioBlock } from "$lib/stores/blocks/model/loose";
  import { isStepBlock } from "$lib/stores/blocks/utils";
  import AnyBlock from "./AnyBlock.svelte";
  import { STEP_COLOR } from "./colors";
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import Collection from "./primitives/Collection.svelte";
  import Field from "./primitives/Field.svelte";

  export let block: ScenarioBlock;

  function handleNameChange(ev: CustomEvent<StringInputChangeEvent>) {
    test.update((test) =>
      updateBlock(test, {
        ...block,
        name: ev.detail.value,
      }),
    );
  }

  function handleDropStep(step: BlockType) {
    if (!isStepBlock(step)) {
      return;
    }

    test.update((test) => insertStep(test, block, step));
  }
</script>

<Block color={{ primary: "rgb(129 140 248)", secondary: "white" }} {block}>
  <Field
    >Run <StringInput placeholder="Scenario name" value={block.name} on:change={handleNameChange} />
    with
  </Field>
  <Field>and do the following:</Field>
  <Collection
    owner={block}
    color={STEP_COLOR}
    connection={{ block: block.step, accepts: isStepBlock, onDrop: handleDropStep }}
    let:child
  >
    {#if child !== null}
      <AnyBlock block={child} />
    {/if}
  </Collection>
</Block>
