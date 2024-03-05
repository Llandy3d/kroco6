<script lang="ts">
  import type { Root } from "$lib/stores/blocks/model/loose";

  export let root: Root;
</script>

<div class="absolute" style="left: {root.left}px; top: {root.top}px;">
  <slot />
</div>
