<script lang="ts">
  import { appendBlock, blocks, insertBlock, updateBlock } from "$lib/stores/test";
  import { type GroupBlock, STEPS } from "$lib/stores/test/types";
  import { derived } from "svelte/store";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import Collection, {
    type AppendBlockEvent,
    type InsertBlockEvent,
  } from "./primitives/Collection.svelte";
  import AnyBlock from "./AnyBlock.svelte";
  import { STEP_COLOR } from "./colors";

  export let block: GroupBlock;

  const children = derived(blocks, ($blocks) => {
    return $blocks.filter((b) => b.parent.type === "collection" && b.parent.id === block.id);
  });

  const append = ({ detail }: CustomEvent<AppendBlockEvent>) => {
    appendBlock(block, detail.target);
  };

  const insert = ({ detail }: CustomEvent<InsertBlockEvent>) => {
    insertBlock(block, detail.before, detail.target);
  };

  const handleNameChange = (ev: CustomEvent<StringInputChangeEvent>) => {
    updateBlock({
      ...block,
      name: ev.detail.value,
    });
  };
</script>

<Block {block} type="group" connect="both" color={STEP_COLOR}>
  <Field>Grouped as <StringInput value={block.name} on:change={handleNameChange} /></Field>
  <Field>do the following:</Field>
  <Collection
    accepts={STEPS}
    items={$children}
    color={STEP_COLOR}
    on:append={append}
    on:insert={insert}
    let:item
  >
    <AnyBlock block={item} />
  </Collection>
</Block>
