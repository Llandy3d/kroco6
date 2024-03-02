<script lang="ts">
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api';
	import { PlayCircle, UploadCloud, Settings } from 'lucide-svelte';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { saveToken } from '$lib/backend-client';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Content } from '$lib/components/ui/accordion';

	let token = '';
	let projectId = '';
	let modalOpen = false;

	$: canRunTestsInCloud = token !== '' && projectId !== '';

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
	<Button size="sm" variant="secondary" on:click={runTest}>
		<PlayCircle size={14} class="mr-2 h-4 w-4" />
		Run
	</Button>

	<Tooltip.Root open={canRunTestsInCloud ? false : undefined}>
		<Tooltip.Trigger>
			<Button
				size="sm"
				variant="secondary"
				on:click={() => runTestInCloud(projectId)}
				disabled={!canRunTestsInCloud}
			>
				<UploadCloud size={14} class="mr-2 h-4 w-4" />
				Run in Cloud
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content side="bottom">
			You need to configure a token and project id to run tests in the cloud.
		</Tooltip.Content>
	</Tooltip.Root>

	<Button
		class="rounded-full"
		size="sm"
		variant="ghost"
		on:click={() => {
			modalOpen = true;
		}}
	>
		<Settings size={16} />
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
