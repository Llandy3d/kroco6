<script lang="ts">
	import type { Block } from '$lib/store/test/types';
	import { GripVertical } from 'lucide-svelte';
	import { draggable, type DragChangeEvent, dropmask } from './dnd';
	import { cn } from '$lib/utils';

	export let block: Block;

	let dragging = false;
	let className = '';

	const handleDragChange = (ev: CustomEvent<DragChangeEvent>) => {
		dragging = ev.detail.dragging;
	};

	export { className as class };
</script>

<div
	use:dropmask
	use:draggable={{ enabled: true, data: block }}
	class={cn('block-root flex w-min items-center rounded-r-md', className)}
	class:dragging
	on:dragchange={handleDragChange}
>
	<div
		class="drag-handle flex cursor-pointer select-none items-center self-stretch bg-indigo-400 p-1 text-white shadow-md shadow-slate-400"
		role="presentation"
		data-drag-handle
	>
		<GripVertical size={18} />
	</div>
	<div class="flex flex-col">
		<slot />
	</div>
</div>

<style>
	.dragging {
		opacity: 0.5;
	}

	.dragging * {
		pointer-events: none;
	}
</style>
