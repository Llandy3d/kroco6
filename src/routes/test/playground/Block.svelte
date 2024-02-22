<script lang="ts">
	import type { Block } from '$lib/store/test/types';
	import { GripVertical } from 'lucide-svelte';
	import { draggable, type DragChangeEvent, dropmask } from './dnd';
	import BlockCollection from './BlockCollection.svelte';

	export let block: Block;

	let dragging = false;

	const handleDragChange = (ev: CustomEvent<DragChangeEvent>) => {
		dragging = ev.detail.dragging;
	};
</script>

<div
	use:dropmask
	use:draggable={{ enabled: true, data: block }}
	on:dragchange={handleDragChange}
	class="flex items-center bg-white text-black shadow-md"
>
	<div
		class="flex cursor-pointer items-center self-stretch bg-indigo-400 p-2 text-white"
		class:dragging
		role="presentation"
		data-drag-handle
	>
		<GripVertical />
	</div>
	<div class="flex flex-col gap-2 p-2">
		<div>
			{block.text}
		</div>
		<BlockCollection owner={block} />
	</div>
</div>

<style>
	.dragging {
		opacity: 0.5;
	}
</style>
