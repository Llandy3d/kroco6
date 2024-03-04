<script lang="ts">
  import Block from "./primitives/Block.svelte";
  import { STEPS, type ScenarioBlock } from "$lib/stores/test/types";
  import Field from "./primitives/Field.svelte";
  import Collection, {
    type AppendBlockEvent,
    type InsertBlockEvent,
  } from "./primitives/Collection.svelte";
  import { derived } from "svelte/store";
  import { appendBlock, blocks, insertBlock, updateBlock } from "$lib/stores/test";
  import AnyBlock from "./AnyBlock.svelte";
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import { EXECUTOR_COLOR, STEP_COLOR } from "./colors";

  export let block: ScenarioBlock;

  const executor = derived(blocks, ($children) => {
    return (
      $children.find(
        (b) => b.type === "executor" && b.parent.type === "collection" && b.parent.id === block.id,
      ) ?? null
    );
  });

  const append = ({ detail }: CustomEvent<AppendBlockEvent>) => {
    appendBlock(block, detail.target);
  };

  const insert = ({ detail }: CustomEvent<InsertBlockEvent>) => {
    insertBlock(block, detail.before, detail.target);
  };

  const handleNameChange = (ev: CustomEvent<StringInputChangeEvent>) => {
    updateBlock({ ...block, name: ev.detail.value });
  };
</script>

<Block type="scenario" color={{ primary: "rgb(129 140 248)", secondary: "white" }} {block}>
  <Field
    >Run <StringInput placeholder="Scenario name" value={block.name} on:change={handleNameChange} />
    with
  </Field>
  <Collection
    owner={block}
    child={$executor}
    accepts={["executor"]}
    color={EXECUTOR_COLOR}
    on:append={append}
    on:insert={insert}
    let:item
  >
    {#if item !== null}
      <AnyBlock block={item} />
    {/if}
  </Collection>
  <Field>and do the following:</Field>
  <Collection
    owner={block}
    child={null}
    accepts={STEPS}
    color={STEP_COLOR}
    on:append={append}
    on:insert={insert}
    let:item
  >
    {#if item !== null}
      <AnyBlock block={item} />
    {/if}
  </Collection>
</Block>

<style>
</style>
