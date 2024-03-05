<script lang="ts">
  import { cn } from "$lib/utils";

  let className = "";

  export { className as class };
</script>

<div
  class={cn(
    "field relative flex items-center gap-2 whitespace-nowrap border-slate-400 p-1 text-xs text-black last:shadow-md",
    className,
  )}
>
  <slot />
</div>

<style>
  .field {
    background-color: var(--block-bg-secondary);
  }
</style>
