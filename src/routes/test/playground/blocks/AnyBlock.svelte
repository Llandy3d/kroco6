<script lang="ts">
	import type { Block } from '$lib/store/test/types';
	import ExecutorBlock from './ExecutorBlock.svelte';
	import GroupBlock from './GroupBlock.svelte';
	import HttpRequestBlock from './HttpRequestBlock.svelte';
	import ScenarioBlock from './ScenarioBlock.svelte';

	export let block: Block;

	function exhaustive(x: never): string {
		return `Unknown block type: ${block.type}`;
	}
</script>

{#if block.type === 'scenario'}
	<ScenarioBlock {block} />
{:else if block.type === 'http-request'}
	<HttpRequestBlock {block} />
{:else if block.type === 'executor'}
	<ExecutorBlock {block} />
{:else if block.type === 'group'}
	<GroupBlock {block} />
{:else}
	<p>{exhaustive(block)}</p>
{/if}
