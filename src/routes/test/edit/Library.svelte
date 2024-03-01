<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import ImportDialog, { type ImportEvent } from './ImportDialog.svelte';
	import { library, syncLibrary } from '$lib/store/test';
	import ListButton from './ListButton.svelte';
	import MethodBadge from './MethodBadge.svelte';

	let importModalOpen = false;

	const handleSyncClick = () => {
		importModalOpen = true;
	};

	const handleImport = (event: CustomEvent<ImportEvent>) => {
		// For now we only support V3
		if (!('openapi' in event.detail.api)) {
			return;
		}

		syncLibrary(event.detail.api);
	};
</script>

<div class="flex h-full flex-col">
	<div class="flex flex-auto">
		<div class="h-full min-w-80 bg-accent">
			<ul class="list-none">
				<h2 class="p-2 font-bold">{$library.info.title}</h2>
				{#each Object.entries($library.paths ?? {}) as [path, value] (path)}
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
							><MethodBadge class="bg-yellow-500">PUT</MethodBadge>
							{value.put.summary ?? path}
						</ListButton>
					{/if}
					{#if value?.post}
						<ListButton>
							<MethodBadge class="bg-yellow-500">POST</MethodBadge>
							{value.post.summary ?? path}
						</ListButton>
					{/if}
					{#if value?.patch}
						<ListButton>
							<MethodBadge class="bg-yellow-500">PATCH</MethodBadge>
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
