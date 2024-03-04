<script lang="ts">
  import { isStepBlock, type HttpRequestBlock, type StepBlock } from "$lib/stores/test/types";
  import Field from "./primitives/Field.svelte";
  import Block from "./primitives/Block.svelte";
  import StringInput from "./inputs/StringInput.svelte";
  import { STEP_COLOR } from "./colors";
  import AnyBlock from "./AnyBlock.svelte";
  import { derived } from "svelte/store";
  import { byBlockParent, steps } from "$lib/stores/test";

  export let block: HttpRequestBlock;

  const next = derived(steps, byBlockParent(block.id));
</script>

<Block {block} color={STEP_COLOR} top={true} bottom={isStepBlock}>
  <svelte:fragment>
    <Field>
      {block.name}
    </Field>
    {#each Object.entries(block.parameters) as [key, param] (key)}
      {#if param.type === "string"}
        <Field>
          {key}: <StringInput value={param.value} />
        </Field>
      {/if}
    {/each}
  </svelte:fragment>
  <svelte:fragment slot="next">
    {#if $next !== null}
      <AnyBlock block={$next} />
    {/if}
  </svelte:fragment>
</Block>
