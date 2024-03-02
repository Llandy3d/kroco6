<script context="module">
	import { setMode } from 'mode-watcher';

	setMode('light');
</script>

<script>
	import '../app.pcss';
	import { Toaster } from '$lib/components/ui/sonner';
	import { onMount } from 'svelte';

	import { projects } from '$lib/stores/projects';
	import { listProjects } from '$lib/backend-client';
	import Sidebar from './Sidebar.svelte';

	onMount(async () => {
		const projectsList = await listProjects();

		projects.update(() => projectsList);
	});
</script>

<Toaster />

<div class="flex">
	<div class="w-72">
		<Sidebar />
	</div>

	<div class="flex flex-auto flex-col">
		<slot />
	</div>
</div>
