<script lang="ts">
	import type { ExecutorBlock } from '$lib/store/test/types';
	import Block from './Block.svelte';
	import Field from './Field.svelte';

	export let block: ExecutorBlock;
</script>

<Block type="executor" {block}>
	<Field class="bg-white">{block.executor.type}</Field>
</Block>
