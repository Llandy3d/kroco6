<script lang="ts">
	import type { Block as BlockType } from '$lib/store/test/types';

	import Block from './Block.svelte';
	import Root from './Root.svelte';
	import { dropzone, type DroppedEvent } from './dnd';
	import { blocks, roots } from '$lib/store/test';
	import { onMount } from 'svelte';
	import ScenarioBlock from './ScenarioBlock.svelte';

	const handleDrop = (ev: CustomEvent<DroppedEvent<BlockType, {}>>) => {
		const parent = {
			type: 'canvas',
			top: ev.detail.top,
			left: ev.detail.left
		} as const;

		$blocks = $blocks.map((block) =>
			ev.detail.data.dropped.id === block.id ? { ...block, parent } : block
		);

		console.log('dropped', ev.detail);
	};

	onMount(() => {
		blocks.set([
			{ id: '0', text: 'First', parent: { type: 'canvas', top: 100, left: 100 } },
			{ id: '1', text: 'Second', parent: { type: 'canvas', top: 400, left: 100 } },
			{ id: '2', text: 'Third', parent: { type: 'collection', id: '1' } },
			{ id: '3', text: 'Fourth', parent: { type: 'collection', id: '1' } },
			{ id: '4', text: 'Fifth', parent: { type: 'collection', id: '2' } },
			{ id: '5', text: 'This one is a bit longer', parent: { type: 'collection', id: '2' } }
		]);
	});
</script>

<div class="relative h-full w-full" use:dropzone={{ data: {} }} on:dropped={handleDrop}>
	{#each $roots as root}
		{#key root.id}
			<Root {root}>
				<ScenarioBlock block={root} />
			</Root>
		{/key}
	{/each}
</div>
