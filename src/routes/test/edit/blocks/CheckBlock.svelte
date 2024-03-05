<script lang="ts">
  import { detachBlock, insertNext, test, updateBlock } from "$lib/stores/blocks";
  import {
    instantiate,
    type Block as BlockType,
    type CheckBlock,
  } from "$lib/stores/blocks/model/loose";
  import type { Check } from "$lib/stores/blocks/model/strict";
  import { isHttpRequestBlock, isStepBlock } from "$lib/stores/blocks/utils";
  import { PlusSquare } from "lucide-svelte";
  import { nanoid } from "nanoid";
  import AnyBlock from "./AnyBlock.svelte";
  import CheckInput from "./CheckInput.svelte";
  import { STEP_COLOR } from "./colors";
  import Block from "./primitives/Block.svelte";
  import BlockInset from "./primitives/BlockInset.svelte";
  import Field from "./primitives/Field.svelte";

  export let block: CheckBlock;

  function handleCheckChange(target: Check) {
    test.update((test) =>
      updateBlock(test, {
        ...block,
        checks: block.checks.map((check) => (check.id === target.id ? target : check)),
      }),
    );
  }

  function handleAddCheck() {
    const newCheck: Check = {
      type: "status",
      id: nanoid(),
      value: 200,
    };

    test.update((test) =>
      updateBlock(test, {
        ...block,
        checks: [...block.checks, newCheck],
      }),
    );
  }

  function handleRemoveCheck(target: Check) {
    test.update((test) =>
      updateBlock(test, {
        ...block,
        checks: block.checks.filter((check) => check.id !== target.id),
      }),
    );
  }

  function handleTargetDrop(target: BlockType) {
    if (isHttpRequestBlock(target)) {
      return;
    }

    test.update((test) => {
      return updateBlock(detachBlock(test, target), {
        ...block,
        target: instantiate(target),
      });
    });
  }

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
      Check that <BlockInset
        owner={block}
        connection={{ block: block.target, accepts: isHttpRequestBlock, onDrop: handleTargetDrop }}
        let:child
      >
        {#if child !== null}
          <AnyBlock block={child} />
        {/if}
      </BlockInset>
    </Field>
    {#each block.checks as check (check.id)}
      <CheckInput {check} onChange={handleCheckChange} onRemove={handleRemoveCheck} />
    {/each}
    <Field>
      <button on:click={handleAddCheck}><PlusSquare size={14} /></button>
    </Field>
  </svelte:fragment>
  <svelte:fragment slot="next" let:next>
    {#if next !== null}
      <AnyBlock block={next} />
    {/if}
  </svelte:fragment>
</Block>
