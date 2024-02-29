<script>
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { cn } from '$lib/utils';

	let className = '';
	export { className as class };
</script>

<Badge class={cn('w-14 justify-center text-white', className)}><slot /></Badge>
