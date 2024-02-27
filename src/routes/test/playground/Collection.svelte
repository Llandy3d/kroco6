<script lang="ts" context="module">
	export interface InsertBlockEvent {
		target: BlockType;
		before: BlockType;
	}

	export interface AppendBlockEvent {
		target: BlockType;
	}
</script>

<script lang="ts">
	import type { Block as BlockType } from '$lib/store/test/types';
	import { type DroppedEvent } from './dnd';
	import DropZone from './DropZone.svelte';
	import { createEventDispatcher } from 'svelte';

	export let items: BlockType[];

	const dispatch = createEventDispatcher<{
		insert: InsertBlockEvent;
		append: AppendBlockEvent;
	}>();

	const handleDropped = (ev: CustomEvent<DroppedEvent<BlockType, BlockType | null>>) => {
		const { dropped, target } = ev.detail.data;

		// If we are dropping an item before itself, then we don't need to do anything.
		if (dropped.id === target?.id) {
			return;
		}

		if (target === null) {
			dispatch('append', {
				target: dropped
			});

			return;
		}

		dispatch('insert', {
			target: dropped,
			before: target
		});
	};
</script>

<div>
	<div class="h-2 w-full rounded-br-md bg-white shadow-md shadow-slate-400"></div>
	<div class="select-none">
		<div class="flex rounded-l-md">
			<div class="w-2 bg-white"></div>
			<ul class="separator flex min-h-2 w-6 flex-auto list-none flex-col">
				{#each items as item}
					<li class="relative border-slate-200">
						<DropZone data={item} on:dropped={handleDropped} />
						{#key item.id}
							<slot {item} />
						{/key}
					</li>
				{/each}
				<li class="relative">
					<DropZone data={null} on:dropped={handleDropped} />
				</li>
			</ul>
		</div>
	</div>
	<div class="h-2 w-full rounded-tr-md bg-white shadow-md shadow-slate-400"></div>
</div>

<style>
	.separator {
		gap: 1px;
	}
</style>
