<script lang="ts">
  import type { Test } from "$lib/backend-client";
  import Button from "$lib/components/ui/button/button.svelte";
  import { currentFile, openTestAsFile } from "$lib/stores/editor";

  export let tests: Test[] = [];
  $: tests, console.log(`tests changed in test list:`, tests);
</script>

<div>
  <ul role="list" class="text-left">
    {#each tests as test (test.name)}
      <li>
        <button
          class="text-ellipsis py-1 hover:underline"
          on:click={() => {
            openTestAsFile(test);
          }}>{test.name}</button
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
