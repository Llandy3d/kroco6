<script lang="ts">
	import Block from './Block.svelte';
	import type { ScenarioBlock } from '$lib/store/test/types';
	import { Input } from '$lib/components/ui/input';
	import Field from './Field.svelte';
	import Collection, { type AppendBlockEvent, type InsertBlockEvent } from './Collection.svelte';
	import { derived } from 'svelte/store';
	import { appendBlock, blocks, insertBefore } from '$lib/store/test';
	import AnyBlock from './AnyBlock.svelte';
	import StringInput from './StringInput.svelte';

	export let block: ScenarioBlock;

	const children = derived(blocks, ($blocks) => {
		return $blocks.filter((b) => b.parent.type === 'collection' && b.parent.id === block.id);
	});

	const executors = derived(children, ($children) => {
		return $children.filter((b) => b.type === 'executor');
	});

	const steps = derived(children, ($children) => {
		return $children.filter((b) => b.type !== 'executor');
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
		<Field class="bg-white"
			>Run <StringInput placeholder="Scenario name" bind:value={block.name} /> using
		</Field>
		<Collection items={$executors} on:append={append} on:insert={insert} let:item>
			<AnyBlock block={item} />
		</Collection>
		<Field class="bg-white">by doing the following:</Field>
		<Collection items={$steps} on:append={append} on:insert={insert} let:item>
			<AnyBlock block={item} />
		</Collection>
	</svelte:fragment>
</Block>
