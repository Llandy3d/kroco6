<script lang="ts">
  import type { CheckBlock, CheckExpression } from "$lib/stores/test/types";
  import AnyBlock from "./AnyBlock.svelte";
  import Block from "./primitives/Block.svelte";
  import BlockInset from "./primitives/BlockInset.svelte";
  import Field from "./primitives/Field.svelte";
  import { updateBlock } from "$lib/stores/test";
  import CheckInput from "./CheckInput.svelte";
  import { PlusSquare } from "lucide-svelte";
  import { nanoid } from "nanoid";

  export let block: CheckBlock;

  const handleCheckChange = (event: CustomEvent<CheckExpression>) => {
    updateBlock({
      ...block,
      checks: block.checks.map((check) => (check.id === event.detail.id ? event.detail : check)),
    });
  };

  const handleAddCheck = () => {
    const newCheck: CheckExpression = {
      id: nanoid(),
      type: "has-status",
      status: 200,
    };

    updateBlock({
      ...block,
      checks: [...block.checks, newCheck],
    });
  };

  const handleRemoveCheck = (event: CustomEvent<CheckExpression>) => {
    updateBlock({
      ...block,
      checks: block.checks.filter((check) => check.id !== event.detail.id),
    });
  };
</script>

<Block
  type="check"
  connect="both"
  {block}
  color={{ primary: "rgb(249 115 22)", secondary: "rgb(254 215 170)" }}
>
  <Field>
    Check that <BlockInset accepts={["http-request"]} owner={block} let:block>
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
</Block>
