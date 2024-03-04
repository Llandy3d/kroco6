<script lang="ts">
  import type { HttpRequestBlock } from "$lib/stores/test/types";
  import Field from "./primitives/Field.svelte";
  import Block from "./primitives/Block.svelte";
  import StringInput from "./inputs/StringInput.svelte";
  import { STEP_COLOR } from "./colors";
  import AnyBlock from "./AnyBlock.svelte";

  export let block: HttpRequestBlock;
</script>

<Block type="http-request" connect="both" color={STEP_COLOR} {block}>
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
  {#if block.next !== null}
    <AnyBlock slot="next" block={block.next} />
  {/if}
</Block>
