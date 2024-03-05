<script lang="ts">
  import Block from "./primitives/Block.svelte";
  import { isStepBlock, type ScenarioBlock } from "$lib/stores/test/types";
  import Field from "./primitives/Field.svelte";
  import Collection from "./primitives/Collection.svelte";
  import { updateBlock } from "$lib/stores/test";
  import AnyBlock from "./AnyBlock.svelte";
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import { STEP_COLOR } from "./colors";

  export let block: ScenarioBlock;

  function handleNameChange(ev: CustomEvent<StringInputChangeEvent>) {
    updateBlock({ ...block, name: ev.detail.value });
  }
</script>

<Block color={{ primary: "rgb(129 140 248)", secondary: "white" }} {block}>
  <Field
    >Run <StringInput placeholder="Scenario name" value={block.name} on:change={handleNameChange} />
    with
  </Field>
  <Field>and do the following:</Field>
  <Collection name="steps" owner={block} color={STEP_COLOR} accepts={isStepBlock} let:child>
    {#if child !== null}
      <AnyBlock block={child} />
    {/if}
  </Collection>
</Block>

<style>
</style>
