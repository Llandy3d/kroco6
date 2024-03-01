<script lang="ts">
	import type { ExecutorBlock } from '$lib/store/test/types';
	import Block from './primitives/Block.svelte';
	import Field from './primitives/Field.svelte';
	import StringInput from '../inputs/StringInput.svelte';

	export let block: ExecutorBlock;
</script>

<Block type="executor" handleClass={'bg-green-500'} {block}>
	{#if block.executor.type === 'constant-vus'}
		<Field class="bg-green-200"
			><StringInput size={3} value={block.executor.vus} /> VUs for <StringInput
				size={3}
				value={block.executor.duration}
			/></Field
		>
	{/if}
</Block>
