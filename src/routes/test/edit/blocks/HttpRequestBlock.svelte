<script lang="ts">
  import type { HttpRequestBlock } from "$lib/stores/test/types";
  import Field from "./primitives/Field.svelte";
  import Block from "./primitives/Block.svelte";
  import StringInput from "./inputs/StringInput.svelte";

  export let block: HttpRequestBlock;
</script>

<Block type="http-request" handleClass="bg-orange-500" class="bg-orange-200" {block}>
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
</Block>
