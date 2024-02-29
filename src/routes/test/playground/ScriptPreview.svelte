<script lang="ts">
	import { blocks } from '$lib/store/test';
	import { derived } from 'svelte/store';
	import { blocksToTest } from '$lib/convert';
	import { emitScript } from '$lib/codegen';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import light from 'svelte-highlight/styles/github';
	import dark from 'svelte-highlight/styles/github-dark';
	import { mode } from 'mode-watcher';

	let script = derived(
		blocks,
		($blocks, set) => {
			const test = blocksToTest($blocks);

			emitScript(test).then((script) => {
				console.log('generated script', { script });

				set(script);
			});
		},
		''
	);
</script>

<svelte:head>
	{#if $mode === 'dark'}
		{@html dark}
	{:else}
		{@html light}
	{/if}
</svelte:head>

<div class="p-4">
	<Highlight language={typescript} code={$script} let:highlighted>
		<LineNumbers {highlighted} />
	</Highlight>
</div>
