<script lang="ts">
	import type { Block as BlockType } from '$lib/store/test/types';

	import Library from './Library.svelte';
	import { type DroppedEvent } from './blocks/primitives/dnd';
	import { blocks, instantiateBlock, selected } from '$lib/store/test';
	import * as Tabs from '$lib/components/ui/tabs';
	import ScriptPreview from './ScriptPreview.svelte';
	import Canvas from './Canvas.svelte';

	let tab = 'build';

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

<Tabs.Root class="flex h-full flex-col" bind:value={tab}>
	<Tabs.List class="w-full">
		<Tabs.Trigger value="library">Library</Tabs.Trigger>
		<Tabs.Trigger value="build">Build</Tabs.Trigger>
		<Tabs.Trigger value="script">Script</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="library" class="flex-auto">
		<Library />
	</Tabs.Content>
	<Tabs.Content value="build" class="flex-auto">
		<Canvas />
	</Tabs.Content>
	<Tabs.Content value="script" class="flex-auto">
		<ScriptPreview />
	</Tabs.Content>
</Tabs.Root>
