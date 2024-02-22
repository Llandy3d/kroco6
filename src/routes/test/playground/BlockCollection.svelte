<script lang="ts">
	import type { Block as BlockType } from '$lib/store/test/types';
	import { createEventDispatcher } from 'svelte';
	import Block from './Block.svelte';
	import type { InsertBlockEvent } from './types';
	import { dropzone, type DroppedEvent } from './dnd';

	export let children: BlockType[];

	const dispatch = createEventDispatcher<{ insert: InsertBlockEvent }>();

	const handleDropped = (ev: DroppedEvent<BlockType>) => {
		dispatch('insert', {
			block: ev.detail.data,
			index: 0
		});
	};
</script>

<ul class="list-none p-0">
	{#each children as child}
		<li class="border-b-2 border-slate-200">
			<div use:dropzone on:dropped={handleDropped}></div>
			<Block block={child} />
		</li>
	{/each}
</ul>

<style>
	[data-drop-acceptable] {
		height: 8px;
	}
</style>
