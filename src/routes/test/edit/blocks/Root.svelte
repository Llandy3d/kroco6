<script lang="ts">
  import type { Root } from "$lib/stores/blocks/model/loose";

  export let root: Root;
</script>

<div class="absolute" style="left: {Math.round(root.left)}px; top: {Math.round(root.top)}px;">
  <slot />
</div>
