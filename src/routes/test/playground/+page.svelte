<script lang="ts">
	import type { Block as BlockType } from '$lib/store/test/types';

	import Block from './Block.svelte';
	import Root from './Root.svelte';
	import { dropzone, type DroppedEvent } from './dnd';
	import { blocks, roots } from '$lib/store/test';
	import { onMount } from 'svelte';
	import ScenarioBlock from './ScenarioBlock.svelte';
	import AnyBlock from './AnyBlock.svelte';

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
			{
				type: 'scenario',
				id: '0',
				name: 'My simple scenario',
				parent: { type: 'canvas', top: 100, left: 100 }
			},
			{
				type: 'scenario',
				id: '1',
				name: 'Another scenario',
				parent: { type: 'canvas', top: 400, left: 100 }
			},
			{
				type: 'http-request',
				id: '2',
				name: 'Get something',
				method: 'GET',
				url: '/something',
				parameters: {},
				parent: { type: 'collection', id: '1' }
			},
			{
				type: 'http-request',
				id: '3',
				name: 'Get something with id',
				method: 'GET',
				url: '/something/1',
				parameters: {
					id: { type: 'string', value: '1' }
				},
				parent: { type: 'collection', id: '1' }
			},
			{
				type: 'executor',
				id: '4',
				executor: {
					type: 'constant-vus',
					vus: 1,
					duration: '1m'
				},
				parent: { type: 'collection', id: '0' }
			},
			{
				type: 'group',
				id: '5',
				name: 'My group',
				parent: { type: 'canvas', top: 200, left: 200 }
			}
		]);
	});
</script>

<div class="relative h-full w-full" use:dropzone={{ data: {} }} on:dropped={handleDrop}>
	{#each $roots as root (root.id)}
		<Root {root}>
			<AnyBlock block={root} />
		</Root>
	{/each}
</div>
