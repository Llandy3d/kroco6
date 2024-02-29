<script>
	import '../app.pcss';
    import { Toaster } from "$lib/components/ui/sonner";
	import { ModeWatcher } from 'mode-watcher';
    import Sidebar from './Sidebar.svelte';
</script>

<ModeWatcher />
<Toaster />

<div class="flex">
    <div class="w-1/5">
        <Sidebar />
    </div>

    <div class="w-4/5 p-4">
        <slot />
    </div>
</div>
