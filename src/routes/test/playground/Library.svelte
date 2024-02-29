<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import type { OpenAPIV3_1 } from 'openapi-types';
	import ImportDialog, { type ImportEvent } from '../edit/ImportDialog.svelte';
	import { api } from '$lib/store/test';
	import ListButton from './ListButton.svelte';
	import MethodBadge from './MethodBadge.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { LibraryFile } from '$lib/store/editor';
	import { loadContent, storeContent } from '$lib/files';

	export let file: LibraryFile;

	let importModalOpen = false;

	const handleSyncClick = () => {
		importModalOpen = true;
	};

	const handleImport = (event: CustomEvent<ImportEvent>) => {
		if (!('openapi' in event.detail.api)) {
			return;
		}

		$api = event.detail.api as OpenAPIV3_1.Document;
	};

	onMount(() => {
		const content = loadContent(file);

		try {
			$api = JSON.parse(content);
		} catch (e) {
			console.error(e);
		}
	});

	onDestroy(() => {
		storeContent(file, JSON.stringify($api));
	});
</script>

<div class="flex h-full flex-col">
	<div class="flex flex-auto">
		<div class="h-full min-w-80 bg-accent">
			<ul class="list-none">
				{#each Object.entries($api.paths ?? {}) as [path, value] (path)}
					{#if value?.get}
						<ListButton
							><MethodBadge class="bg-green-500">GET</MethodBadge>
							{value.get.summary ?? path}
						</ListButton>
					{/if}
					{#if value?.head}
						<ListButton>
							<MethodBadge class="bg-green-500">HEAD</MethodBadge>
							{value.head.summary ?? path}
						</ListButton>
					{/if}
					{#if value?.options}
						<ListButton>
							<MethodBadge class="bg-green-500">OPTIONS</MethodBadge>
							{value.options.summary ?? path}
						</ListButton>
					{/if}
					{#if value?.put}
						<ListButton
							><MethodBadge class="bg-green-500">PUT</MethodBadge>
							{value.put.summary ?? path}
						</ListButton>
					{/if}
					{#if value?.post}
						<ListButton>
							<MethodBadge class="bg-green-500">POST</MethodBadge>
							{value.post.summary ?? path}
						</ListButton>
					{/if}
					{#if value?.patch}
						<ListButton>
							<MethodBadge class="bg-green-500">PATCH</MethodBadge>
							{value.patch.summary ?? path}
						</ListButton>
					{/if}
					{#if value?.delete}
						<ListButton>
							<MethodBadge class="bg-red-500">DELETE</MethodBadge>
							{value.delete.summary ?? path}
						</ListButton>
					{/if}
				{/each}
			</ul>
		</div>
		<div class="flex flex-auto flex-col">
			<div class="flex w-full justify-end p-2">
				<Button on:click={handleSyncClick}>Sync</Button>
			</div>
		</div>
	</div>
</div>

<ImportDialog bind:open={importModalOpen} on:imported={handleImport} />
