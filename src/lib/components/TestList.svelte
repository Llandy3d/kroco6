<script lang="ts">
  import type { Test } from "$lib/backend-client";
  import Button from "$lib/components/ui/button/button.svelte";
  import { currentFile, openTestAsFile } from "$lib/stores/editor";
  import { FileJson2, Layers } from "lucide-svelte";

  export let tests: Test[] = [];
  $: tests, console.log(`tests changed in test list:`, tests);
</script>

<div>
  <ul role="list" class="max-h-50 mb-2 mt-1 overflow-auto text-left">
    {#each tests as test (test.name)}
      <li>
        <button
          class="flex items-center gap-1 text-ellipsis py-1 text-sm hover:underline"
          on:click={() => {
            openTestAsFile(test);
          }}
        >
          {#if test.kind === "Javascript"}
            <FileJson2 size="12" />
          {:else}
            <Layers size="12" />
          {/if}

          {test.name}</button
        >
      </li>
    {/each}
  </ul>
  <Button
    class="w-full"
    on:click={() => {
      currentFile.set(null);
    }}>Create test</Button
  >
</div>
