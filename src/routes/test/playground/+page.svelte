<script lang="ts">
	import type { Block as BlockType } from '$lib/store/test/types';

	import Block from './Block.svelte';
	import Root from './Root.svelte';
	import { dropzone, type DroppedEvent } from './dnd';
	import { blocks, instantiateBlock, roots } from '$lib/store/test';
	import { onMount } from 'svelte';
	import ScenarioBlock from './ScenarioBlock.svelte';
	import AnyBlock from './AnyBlock.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Content } from '$lib/components/ui/accordion';
	import Toolbox from './Toolbox.svelte';

	let tab = 'build';

	const handleDrop = ({ detail }: CustomEvent<DroppedEvent<BlockType, {}>>) => {
		const dropped = detail.data.dropped;

		const parent = {
			type: 'canvas',
			top: detail.top,
			left: detail.left
		} as const;

		if (dropped.parent.type === 'toolbox') {
			const newBlock = instantiateBlock(dropped);

			$blocks = [...$blocks, { ...newBlock, parent }];

			return;
		}

		$blocks = $blocks.map((block) => (dropped.id === block.id ? { ...block, parent } : block));
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

<Tabs.Root class="flex h-full flex-col" bind:value={tab}>
	<Tabs.List class="w-full">
		<Tabs.Trigger value="build">Build</Tabs.Trigger>
		<Tabs.Trigger value="script">Script</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="build" class="flex-auto">
		<div class="relative flex h-full w-full" use:dropzone={{ data: {} }} on:dropped={handleDrop}>
			<Toolbox />
			<div class="flex-auto">
				{#each $roots as root (root.id)}
					<Root {root}>
						<AnyBlock block={root} />
					</Root>
				{/each}
			</div>
		</div>
	</Tabs.Content>
	<Tabs.Content value="script" class="flex-auto">
		<p>Script</p>
	</Tabs.Content>
</Tabs.Root>
