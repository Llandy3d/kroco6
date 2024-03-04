<script lang="ts">
  import type { Block } from "$lib/stores/test/types";
  import { exhaustive } from "$lib/utils/typescript";
  import CheckBlock from "./CheckBlock.svelte";
  import ExecutorBlock from "./ExecutorBlock.svelte";
  import GroupBlock from "./GroupBlock.svelte";
  import HttpRequestBlock from "./HttpRequestBlock.svelte";
  import ScenarioBlock from "./ScenarioBlock.svelte";

  export let block: Block;
</script>

{#if block.type === "scenario"}
  <ScenarioBlock {block} />
{:else if block.type === "executor"}
  <ExecutorBlock {block} />
{:else if block.type === "http-request"}
  <HttpRequestBlock {block} />
{:else if block.type === "group"}
  <GroupBlock {block} />
{:else if block.type === "check"}
  <CheckBlock {block} />
{:else}
  <p>{exhaustive(block)}</p>
{/if}
