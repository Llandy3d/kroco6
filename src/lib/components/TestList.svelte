<script lang="ts">
  import type { Test } from "$lib/backend-client";

  export let tests: Test[] = [];
  $: tests, console.log(`tests changed in test list:`, tests);
</script>

<div class="overflow-hidden shadow sm:rounded-md">
  <ul role="list">
    {#each tests as test}
      <li class="px-4 py-1 sm:px-6">{test.name}</li>
    {/each}
  </ul>
</div>
