<script lang="ts">
  import { cn } from "$lib/utils";

  let className = "";

  export { className as class };
</script>

<div
  class={cn(
    "relative flex items-center gap-2 whitespace-nowrap border-slate-400  p-1 text-xs text-black",
    className,
  )}
>
  <slot />
</div>
