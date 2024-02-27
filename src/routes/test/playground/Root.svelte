<script lang="ts">
	import { isRootBlock, type Block } from '$lib/store/test/types';

	export let root: Block;
</script>

{#if isRootBlock(root)}
	<div class="absolute" style="left: {root.parent.left}px; top: {root.parent.top}px;">
		<slot />
	</div>
{/if}
