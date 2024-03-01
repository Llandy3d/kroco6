<script lang="ts">
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api';
	import { PlayCircle, UploadCloud, Settings } from 'lucide-svelte';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { saveToken } from '$lib/backend-client';

	let token = '';
	let projectId = '';
	let modalOpen = false;

	$: canRunTestsInCloud = !!token && !!projectId;

	onMount(async () => {
		token = await invoke('get_cloud_token');
	});

	function onSaveSettings() {
		saveToken(token);
		modalOpen = false;
	}

	export let runTest: () => void;
	export let runTestInCloud: (projectId: string) => void;
</script>

<div class="my-2 flex gap-2 p-2">
	<Button class="rounded-full" variant="secondary" on:click={runTest}>
		<PlayCircle class="mr-2 h-4 w-4" />
		Run
	</Button>

	<Button
		class="rounded-full"
		variant="secondary"
		on:click={() => runTestInCloud(projectId)}
		disabled={!canRunTestsInCloud}
	>
		<UploadCloud class="mr-2 h-4 w-4" />
		Run in Cloud
	</Button>

	<Button
		class="ml-auto rounded-full"
		variant="secondary"
		on:click={() => {
			modalOpen = true;
		}}
	>
		<Settings class="mr-2" />
		Settings
	</Button>
</div>

<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content class="overflow-hidden shadow-lg">
		<Dialog.Header>
			<Dialog.Title>Enter k6 cloud token</Dialog.Title>
			<Dialog.Description>Authenticate with k6 Cloud to run tests in the cloud.</Dialog.Description>
		</Dialog.Header>
		<Label for="k6-cloud-token">Cloud token</Label>
		<Input id="k6-cloud-token" bind:value={token} />

		<Label for="k6-cloud-project-id">Project Id</Label>
		<Input id="k6-cloud-project-id" bind:value={projectId} />

		<Dialog.Footer>
			<Button type="submit" on:click={onSaveSettings}>Submit</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
