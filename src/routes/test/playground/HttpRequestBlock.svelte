<script lang="ts">
	import type { HttpRequestBlock } from '$lib/store/test/types';
	import Field from './Field.svelte';
	import Block from './Block.svelte';
	import StringInput from './StringInput.svelte';

	export let block: HttpRequestBlock;
</script>

<Block class="bg-orange-200" {block}>
	<Field>
		{block.name}
	</Field>
	{#each Object.entries(block.parameters) as [key, param] (key)}
		{#if param.type === 'string'}
			<Field>
				{key}: <StringInput bind:value={param.value} />
			</Field>
		{/if}
	{/each}
</Block>
