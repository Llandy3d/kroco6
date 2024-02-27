<script lang="ts">
	import { appendBlock, blocks, insertBefore } from '$lib/store/test';
	import { type GroupBlock, STEPS } from '$lib/store/test/types';
	import { derived } from 'svelte/store';
	import Block from './Block.svelte';
	import Field from './Field.svelte';
	import StringInput, { type StringInputChangeEvent } from './StringInput.svelte';
	import Collection, { type AppendBlockEvent, type InsertBlockEvent } from './Collection.svelte';
	import AnyBlock from './AnyBlock.svelte';

	export let block: GroupBlock;

	const children = derived(blocks, ($blocks) => {
		return $blocks.filter((b) => b.parent.type === 'collection' && b.parent.id === block.id);
	});

	const append = ({ detail }: CustomEvent<AppendBlockEvent>) => {
		appendBlock(block, detail.target);
	};

	const insert = ({ detail }: CustomEvent<InsertBlockEvent>) => {
		insertBefore(block, detail.before, detail.target);
	};

	const handleNameChange = (ev: CustomEvent<StringInputChangeEvent>) => {
		block = {
			...block,
			name: ev.detail.value
		};
	};
</script>

<Block type="group" handleClass="bg-amber-500" {block}>
	<Field class="bg-amber-100"
		>Grouped as <StringInput value={block.name} change={handleNameChange} />
	</Field>
	<Field class="bg-amber-100">do the following:</Field>
	<Collection
		class="bg-amber-100"
		accepts={STEPS}
		items={$children}
		on:append={append}
		on:insert={insert}
		let:item
	>
		<AnyBlock block={item} />
	</Collection>
</Block>
