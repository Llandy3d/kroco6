<script lang="ts">
  import type { Test } from "$lib/backend-client";

  export let tests: Test[] = [];
  $: tests, console.log(`tests changed in test list:`, tests);
</script>

<div>
  <ul role="list" class="text-left">
    {#each tests as test}
      <li class="px-4 py-1 sm:px-6">{test.name}</li>
    {/each}
  </ul>
</div>
