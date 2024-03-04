<script lang="ts">
  import {
    isStepBlock,
    type CheckBlock,
    type CheckExpression,
    isHttpRequestBlock,
  } from "$lib/stores/test/types";
  import AnyBlock from "./AnyBlock.svelte";
  import Block from "./primitives/Block.svelte";
  import BlockInset from "./primitives/BlockInset.svelte";
  import Field from "./primitives/Field.svelte";
  import { updateBlock } from "$lib/stores/test";
  import CheckInput from "./CheckInput.svelte";
  import { PlusSquare } from "lucide-svelte";
  import { nanoid } from "nanoid";
  import { STEP_COLOR } from "./colors";

  export let block: CheckBlock;

  function handleCheckChange(event: CustomEvent<CheckExpression>) {
    updateBlock({
      ...block,
      checks: block.checks.map((check) => (check.id === event.detail.id ? event.detail : check)),
    });
  }

  function handleAddCheck() {
    const newCheck: CheckExpression = {
      id: nanoid(),
      type: "has-status",
      status: 200,
    };

    updateBlock({
      ...block,
      checks: [...block.checks, newCheck],
    });
  }

  function handleRemoveCheck(event: CustomEvent<CheckExpression>) {
    updateBlock({
      ...block,
      checks: block.checks.filter((check) => check.id !== event.detail.id),
    });
  }
</script>

<Block {block} color={STEP_COLOR} top={true} bottom={isStepBlock}>
  <svelte:fragment>
    <Field>
      Check that <BlockInset owner={block} accepts={isHttpRequestBlock} let:block>
        {#if block !== undefined}
          <AnyBlock {block} />
        {/if}
      </BlockInset>
    </Field>
    {#each block.checks as check (check.id)}
      <CheckInput {check} on:change={handleCheckChange} on:remove={handleRemoveCheck} />
    {/each}
    <Field>
      <button on:click={handleAddCheck}><PlusSquare size={14} /></button>
    </Field>
  </svelte:fragment>
  <svelte:fragment slot="next" let:child>
    {#if child !== null}
      <AnyBlock block={child} />
    {/if}
  </svelte:fragment>
</Block>
