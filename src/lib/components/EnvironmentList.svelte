<script lang="ts">
  import type { Environment as IEnvironment } from "$lib/backend-client";
  import { cubicInOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import Environment from "./Environment.svelte";

  export let environments: IEnvironment[];

  const [send, receive] = crossfade({
    duration: 250,
    easing: cubicInOut,
  });
</script>

<nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
  {#each environments as environment}
    <Environment bind:environment />
  {/each}
</nav>
