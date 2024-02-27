<script lang="ts">
	import type { Block } from '$lib/store/test/types';
	import { GripVertical } from 'lucide-svelte';
	import { draggable, type DragChangeEvent, dropmask } from './dnd';
	import { cn } from '$lib/utils';

	export let type: string;
	export let block: Block;

	let dragging = false;

	let className = '';
	let handleClass = '';

	const handleDragChange = (ev: CustomEvent<DragChangeEvent>) => {
		dragging = ev.detail.dragging;
	};

	export { className as class, handleClass };
</script>

<div
	id={block.id}
	use:dropmask
	use:draggable={{ type, data: block }}
	class={cn('block-root flex w-min items-center rounded-r-md', className)}
	class:dragging
	on:dragchange={handleDragChange}
>
	<div
		class={cn(
			'drag-handle flex cursor-pointer select-none items-center self-stretch bg-indigo-400 p-1 text-white shadow-md shadow-slate-400',
			handleClass
		)}
		role="presentation"
		data-drag-handle
	>
		<GripVertical size={18} />
	</div>
	<div class="block-content flex flex-col">
		<slot />
	</div>
</div>

<style>
	.block-content > :global(*:first-child) {
		border-top-right-radius: 0.25rem;
	}

	.block-content > :global(*:last-child) {
		border-bottom-right-radius: 0.25rem;
	}

	.dragging {
		opacity: 0.8;
	}

	.dragging * {
		pointer-events: none;
	}
</style>
