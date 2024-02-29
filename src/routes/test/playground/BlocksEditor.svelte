<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import type { BlockFile } from '$lib/store/editor';
	import { onDestroy, onMount } from 'svelte';
	import Canvas from './Canvas.svelte';
	import ScriptPreview from './ScriptPreview.svelte';
	import { blocks, loadBlocks } from '$lib/store/test';
	import { storeContent } from '$lib/files';

	let tab = 'build';

	export let file: BlockFile;

	onMount(() => {
		let document = sessionStorage.getItem(file.handle);

		if (document === null) {
			if (file.path.type === 'new') {
				loadBlocks([]);

				return;
			}

			document = file.path.original;

			return;
		}

		try {
			const { blocks } = JSON.parse(document);

			loadBlocks(blocks);
		} catch (e) {
			loadBlocks([]);

			console.error(e);
		}
	});

	onDestroy(() => {
		storeContent(file, {
			version: 0,
			blocks: $blocks
		});
	});
</script>

<Tabs.Root class="flex flex-auto flex-col" bind:value={tab}>
	<Tabs.List class="w-full">
		<Tabs.Trigger value="build">Build</Tabs.Trigger>
		<Tabs.Trigger value="script">Script</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="build" class="flex-auto">
		<Canvas />
	</Tabs.Content>
	<Tabs.Content value="script" class="flex-auto">
		<ScriptPreview />
	</Tabs.Content>
</Tabs.Root>
