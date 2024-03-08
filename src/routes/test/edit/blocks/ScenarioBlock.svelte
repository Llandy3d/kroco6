<script lang="ts">
  import { detachBlock, insertStep, updateBlock } from "$lib/stores/blocks";
  import { type Block as BlockType, type ScenarioBlock } from "$lib/stores/blocks/model/loose";
  import { detach } from "$lib/stores/blocks/model/utils";
  import { isExecutorBlock, isStepBlock } from "$lib/stores/blocks/utils";
  import { getCurrentTest } from "../blockEditorContext";
  import AnyBlock from "./AnyBlock.svelte";
  import { EXECUTOR_COLOR, STEP_COLOR } from "./colors";
  import StringInput from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import BlockInset from "./primitives/BlockInset.svelte";
  import Collection from "./primitives/Collection.svelte";
  import Field from "./primitives/Field";

  export let block: ScenarioBlock;

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

  function handleExecutorDrop(executor: BlockType) {
    if (!isExecutorBlock(executor)) {
      return;
    }

    test.update((test) =>
      updateBlock(detachBlock(test, executor), {
        ...detach(block, executor),
        executor,
      }),
    );
  }
</script>

<Block color={{ primary: "rgb(129 140 248)", secondary: "white" }} {block}>
  <Field
    >Run <StringInput placeholder="Scenario name" value={block.name} onChange={handleNameChange} />
    with <BlockInset
      owner={block}
      color={EXECUTOR_COLOR}
      connection={{ block: block.executor, accepts: isExecutorBlock, onDrop: handleExecutorDrop }}
      let:child
    >
      {#if child !== null}
        <AnyBlock block={child} />
      {/if}
    </BlockInset>
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
