<script lang="ts">
	import Block from './Block.svelte';
	import { type Block as BlockType } from '$lib/store/test/types';
	import { Input } from '$lib/components/ui/input';
	import Field from './Field.svelte';
	import Collection, { type AppendBlockEvent, type InsertBlockEvent } from './Collection.svelte';
	import { derived } from 'svelte/store';
	import { appendBlock, blocks, insertBefore } from '$lib/store/test';

	export let block: BlockType;

	const children = derived(blocks, ($blocks) => {
		return $blocks.filter((b) => b.parent.type === 'collection' && b.parent.id === block.id);
	});

	const append = ({ detail }: CustomEvent<AppendBlockEvent>) => {
		appendBlock(block, detail.target);
	};

	const insert = ({ detail }: CustomEvent<InsertBlockEvent>) => {
		insertBefore(block, detail.before, detail.target);
	};
</script>

<Block {block}>
	<svelte:fragment>
		<Field class="bg-white">Run <Input class="w-auto" placeholder="Scenario name" /> using</Field>
		<Collection items={$children} on:append={append} on:insert={insert} let:item>
			<svelte:self block={item} />
		</Collection>
	</svelte:fragment>
</Block>
