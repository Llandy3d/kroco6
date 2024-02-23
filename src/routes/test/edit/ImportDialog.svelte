<script lang="ts">
	import type { OpenAPI } from 'openapi-types';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createEventDispatcher } from 'svelte';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { fetch, ResponseType } from '@tauri-apps/api/http';

	export let open = false;

	let url: string = '';

	const dispatch = createEventDispatcher<{
		imported: {
			api: OpenAPI.Document;
		};
	}>();

	const handleImportClick = () => {
		fetch<string>(url, {
			method: 'GET',
			responseType: ResponseType.Text
		}).then((response) => {
			const api = JSON.parse(response.data) as OpenAPI.Document;

			dispatch('imported', {
				api
			});

			open = false;
		});
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>Import from OpenAPI</Dialog.Header>
		<Dialog.Description>Import HTTP requests from your OpenAPI definition.</Dialog.Description>
		<div class="grid grid-cols-4 items-center gap-4">
			<Label class="text-right">URL</Label>
			<Input id="name" bind:value={url} class="col-span-3" />
		</div>
		<Dialog.Footer>
			<Button variant="default" on:click={handleImportClick}>Import</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
