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
  import { STEP_COLOR } from "./colors";

  export let block: ScenarioBlock;

  const children = derived(blocks, ($blocks) => {
    return $blocks.filter((b) => b.parent.type === "collection" && b.parent.id === block.id);
  });

  const executors = derived(children, ($children) => {
    return $children.filter((b) => b.type === "executor");
  });

  const steps = derived(children, ($children) => {
    return $children.filter((b) => b.type !== "executor");
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
    accepts={["executor"]}
    items={$executors}
    color={{ primary: "rgb(34 197 94)", secondary: "rgb(187 247 208)" }}
    on:append={append}
    on:insert={insert}
    let:item
  >
    <AnyBlock block={item} />
  </Collection>
  <Field>and do the following:</Field>
  <Collection
    accepts={STEPS}
    items={$steps}
    color={STEP_COLOR}
    on:append={append}
    on:insert={insert}
    let:item
  >
    <AnyBlock block={item} />
  </Collection>
</Block>

<style>
</style>
