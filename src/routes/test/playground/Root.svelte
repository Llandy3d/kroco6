<script lang="ts">
	import type { RootBlock } from '$lib/store/test/types';

	export let root: RootBlock;
</script>

<div class="absolute" style="left: {root.parent.left}px; top: {root.parent.top}px;">
	<slot />
</div>
