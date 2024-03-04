<script lang="ts">
  import type { Block } from "$lib/stores/test/types";
  import { GripVertical, Key } from "lucide-svelte";
  import { draggable, type DragChangeEvent } from "./dnd";
  import { cn } from "$lib/utils";
  import { deleteBlock, selected } from "$lib/stores/test";

  export let type: string;
  export let block: Block;

  let dragging = false;

  let className = "";
  let handleClass = "";

  const handleDragChange = (ev: CustomEvent<DragChangeEvent>) => {
    dragging = ev.detail.dragging;
  };

  const handleClick = (ev: MouseEvent) => {
    if (ev.target instanceof HTMLElement) {
      ev.stopPropagation();
      ev.preventDefault();

      ev.target.parentElement?.focus();

      selected.set(block);
    }
  };

  const handleKeyPress = (ev: KeyboardEvent) => {
    if (ev.key === "Backspace") {
      ev.preventDefault();
      ev.stopPropagation();

      deleteBlock(block);

      $selected = null;
    }
  };

  export { className as class, handleClass };
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  tabindex="0"
  id={block.id}
  use:draggable={{ type, data: block }}
  class={cn(
    "block-root z-10 flex w-min items-center rounded-r-md outline-2 outline-indigo-500 focus:outline",
    className,
  )}
  class:dragging
  data-parent={block.parent.type === "canvas"
    ? "canvas"
    : block.parent.type === "toolbox"
      ? "toolbox"
      : block.parent.id}
  on:keypress={handleKeyPress}
  on:dragchange={handleDragChange}
>
  <div
    class={cn(
      "drag-handle flex cursor-pointer select-none items-center self-stretch bg-indigo-400 p-1 text-white shadow-md shadow-slate-400",
      handleClass,
    )}
    role="presentation"
    data-drag-handle
    on:click={handleClick}
  >
    <GripVertical size={18} />
  </div>
  <div class="block-content flex flex-col">
    <slot />
  </div>
</div>

<style>
  .block-content > :global(*:first-child) {
    border-top-right-radius: 0.25rem;
  }

  .block-content > :global(*:last-child) {
    border-bottom-right-radius: 0.25rem;
  }

  .dragging {
    opacity: 0.8;
  }

  .dragging * {
    pointer-events: none;
  }
</style>
