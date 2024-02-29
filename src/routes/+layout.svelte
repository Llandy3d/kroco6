<script context="module">
	import { setMode } from 'mode-watcher';

	setMode('light');
</script>

<script>
	import '../app.pcss';
	import { Toaster } from '$lib/components/ui/sonner';
</script>

<Toaster />

<div class="flex h-full w-full flex-col">
	<slot />
</div>
<!-- <div class="flex">
	<div class="w-1/5">
		<Sidebar />
	</div>

	<div class=" w-4/5 p-4">
		<slot />
	</div>
</div> -->
