<script lang="ts">
	import type { Block as BlockType } from '$lib/store/test/types';
	import Block from './Block.svelte';
	import { type DroppedEvent } from './dnd';
	import { derived } from 'svelte/store';
	import { blocks } from '$lib/store/test';
	import DropZone from './DropZone.svelte';

	export let owner: BlockType;

	const children = derived(blocks, ($blocks) => {
		return $blocks.filter((current) => {
			return current.parent.type === 'collection' && current.parent.id === owner.id;
		});
	});

	const handleDropped = (ev: CustomEvent<DroppedEvent<BlockType, BlockType | null>>) => {
		const { dropped, target } = ev.detail.data;

		// If we are dropping an item before itself, then we don't need to do anything.
		if (dropped.id === target?.id) {
			return;
		}

		const newBlock: BlockType = {
			...dropped,
			parent: {
				type: 'collection',
				id: owner.id
			}
		};

		if (target === null) {
			$blocks = [...$blocks.filter((block) => block.id !== dropped.id), newBlock];

			return;
		}

		$blocks = $blocks.flatMap((block) => {
			// Remove the old version of the block
			if (block.id === dropped.id) {
				return [];
			}

			return target?.id === block.id ? [newBlock, block] : [block];
		});
	};
</script>

<ul class="block-collection list-none p-0">
	{#each $children as child}
		<li class="relative border-b-2 border-slate-200">
			<DropZone data={child} on:dropped={handleDropped} />
			{#key child.id}
				<Block block={child} />
			{/key}
		</li>
	{/each}
	<li class="relative">
		<DropZone data={null} on:dropped={handleDropped} />
	</li>
</ul>

<style>
</style>
