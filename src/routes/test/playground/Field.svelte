<script lang="ts">
	import { cn } from '$lib/utils';

	let className = '';

	export { className as class };
</script>

<div
	class={cn(
		className,
		'relative whitespace-nowrap border-slate-400 p-1 text-sm text-black last:shadow-md'
	)}
>
	<slot />
</div>
