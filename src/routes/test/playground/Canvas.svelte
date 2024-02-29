<script lang="ts">
	import type { Block as BlockType } from '$lib/store/test/types';

	import Root from './blocks/Root.svelte';
	import { dropzone, type DroppedEvent } from './blocks/primitives/dnd';
	import { blocks, instantiateBlock, roots, selected } from '$lib/store/test';
	import AnyBlock from './blocks/AnyBlock.svelte';
	import Toolbox from './Toolbox.svelte';

	const handleDrop = ({ detail }: CustomEvent<DroppedEvent<BlockType, {}>>) => {
		const dropped = detail.data.dropped;

		const parent = {
			type: 'canvas',
			top: detail.top,
			left: detail.left
		} as const;

		if (dropped.parent.type === 'toolbox') {
			const newBlock = instantiateBlock(dropped);

			$blocks = [...$blocks, { ...newBlock, parent }];

			return;
		}

		$blocks = $blocks.map((block) => (dropped.id === block.id ? { ...block, parent } : block));
	};

	const handleClick = () => {
		selected.set(null);
	};
</script>

<div class="relative flex h-full w-full" use:dropzone={{ data: {} }} on:dropped={handleDrop}>
	<Toolbox />
	<div class="flex-auto" on:click={handleClick}>
		{#each $roots as root (root.id)}
			<Root {root}>
				<AnyBlock block={root} />
			</Root>
		{/each}
	</div>
</div>
