<script lang="ts">
	import type { Block } from '$lib/store/test/types';
	import ExecutorBlock from './ExecutorBlock.svelte';
	import HttpRequestBlock from './HttpRequestBlock.svelte';
	import ScenarioBlock from './ScenarioBlock.svelte';

	export let block: Block;
</script>

{#if block.type === 'scenario'}
	<ScenarioBlock {block} />
{/if}

{#if block.type === 'http-request'}
	<HttpRequestBlock {block} />
{/if}

{#if block.type === 'executor'}
	<ExecutorBlock {block} />
{/if}
