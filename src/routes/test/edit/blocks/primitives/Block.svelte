<script lang="ts" generics="TBlock extends Block">
  import type { Block } from "$lib/stores/test/types";
  import { GripVertical } from "lucide-svelte";
  import { draggable, type DragChangeEvent, type DroppedEvent } from "./dnd";
  import { cn } from "$lib/utils";
  import { deleteBlock, selected } from "$lib/stores/test";
  import Bottom from "./connections/Bottom.svelte";
  import Top from "./connections/Top.svelte";
  import { toBlockColorStyle, type BlockColor } from "./types";

  export let type: string;
  export let block: TBlock;

  export let connect: "top" | "bottom" | "both" | "none" = "none";

  export let color: BlockColor;

  let dragging = false;

  let className = "";

  function handleDragChange(ev: CustomEvent<DragChangeEvent>) {
    dragging = ev.detail.dragging;
  }

  function handleClick(ev: MouseEvent) {
    if (ev.target instanceof HTMLElement) {
      ev.stopPropagation();
      ev.preventDefault();

      ev.target.parentElement?.focus();

      selected.set(block);
    }
  }

  function handleKeyPress(ev: KeyboardEvent) {
    if (ev.key === "Backspace") {
      ev.preventDefault();
      ev.stopPropagation();

      deleteBlock(block);

      $selected = null;
    }
  }

  function handleDrop(ev: DroppedEvent<Block, Block>) {}

  export { className as class, handleClass };
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  tabindex="0"
  id={block.id}
  class={cn(
    "block-root z-10 flex w-min flex-col rounded-r-md outline-2 outline-indigo-500 focus:outline",
    className,
  )}
  class:dragging
  data-parent={block.parent.type === "canvas"
    ? "canvas"
    : block.parent.type === "toolbox"
      ? "toolbox"
      : block.parent.id}
  use:draggable={{ type, data: block }}
  on:keypress={handleKeyPress}
  on:dragchange={handleDragChange}
  style={toBlockColorStyle(color)}
>
  <div class="relative flex items-center">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="drag-handle relative flex cursor-pointer select-none items-center self-stretch p-1 text-white shadow-md shadow-slate-400"
      data-drag-handle
      on:click={handleClick}
    >
      <GripVertical size={18} />
    </div>
    <div class="block-content relative flex flex-col">
      {#if connect === "top" || connect === "both"}
        <Top />
      {/if}
      <slot />
    </div>
  </div>
  {#if connect === "bottom" || connect === "both"}
    <Bottom data={block} onDrop={handleDrop} />
  {/if}
</div>
<div>
  <slot name="next" />
</div>

<style>
  .block-content > :global(*:first-child) {
    border-top-right-radius: 0.25rem;
  }

  .block-content > :global(*:last-child) {
    border-bottom-right-radius: 0.25rem;
  }

  .drag-handle {
    background-color: var(--block-bg-primary);
  }

  .dragging {
    opacity: 0.8;
  }

  .dragging * {
    pointer-events: none;
  }
</style>
