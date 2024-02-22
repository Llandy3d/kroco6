<script lang="ts">
	import { blocks } from '$lib/store/test';
	import type { Block } from '$lib/store/test/types';
	import { GripVertical } from 'lucide-svelte';
	import { draggable } from './dnd';
	import { derived } from 'svelte/store';
	import BlockCollection from './BlockCollection.svelte';
	import type { InsertBlockEvent } from './types';

	export let block: Block;

	const children = derived(blocks, ($blocks) => {
		return $blocks.filter((current) => {
			return current.parent.type === 'collection' && current.parent.id === block.id;
		});
	});

	const handleInsert = (ev: CustomEvent<InsertBlockEvent>) => {
		console.log('insert', ev.detail);
	};
</script>

<div
	use:draggable={{ enabled: true, data: block }}
	class="flex items-center bg-white text-black shadow-md"
>
	<div
		class="flex cursor-pointer items-center self-stretch bg-indigo-400 p-2 text-white"
		role="presentation"
		data-drag-handle
	>
		<GripVertical />
	</div>
	<div class="flex flex-col p-2">
		<div>
			{block.text}
		</div>
		<BlockCollection children={$children} on:insert={handleInsert} />
	</div>
</div>

<style>
	[data-dragging] {
		opacity: 0.5;
	}
</style>
