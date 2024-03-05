<script lang="ts" generics="TBlock extends Block, TBottom extends Block">
  import { derived } from "svelte/store";

  import { isBlock, type Block, type BlockParent } from "$lib/stores/test/types";
  import { GripVertical } from "lucide-svelte";
  import { draggable, type DragChangeEvent, type DroppedEvent, type AcceptsCallback } from "./dnd";
  import { cn } from "$lib/utils";
  import { blocks, byBlockParent, deleteBlock, reparentBlock, selected } from "$lib/stores/test";
  import Bottom from "./connections/Bottom.svelte";
  import Top from "./connections/Top.svelte";
  import { toBlockColorStyle, type BlockColor } from "./types";

  export let block: TBlock;

  export let top: AcceptsCallback | boolean = false;
  export let bottom: AcceptsCallback | null = null;

  export let color: BlockColor;

  const next = derived(blocks, byBlockParent(block.id));

  let dragging = false;

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

  function acceptsTop(value: unknown) {
    if (value === "canvas") {
      return true;
    }

    if (!isBlock(value) || value.id === block.id) {
      return false;
    }

    if (typeof top === "boolean") {
      return top;
    }

    return top(value);
  }

  function acceptsBottom(value: unknown): value is TBottom {
    if (bottom === null || block.parent.type === "toolbox" || !isBlock(value)) {
      return false;
    }

    return isBlock(value) && bottom(value);
  }

  function handleDrop(ev: DroppedEvent<TBottom, Block>) {
    const parent: BlockParent = {
      type: "block",
      id: block.id,
    };

    reparentBlock(parent, ev.data.dropped);
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  tabindex="0"
  id={block.id}
  class="block-root z-10 flex w-min flex-col rounded-r-md outline-2 outline-indigo-500 focus:outline"
  class:dragging
  use:draggable={{
    data: block,
    accepts: acceptsTop,
  }}
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
      {#if top}
        <Top />
      {/if}
      <slot />
    </div>
  </div>
  {#if bottom !== null}
    <Bottom data={block} accepts={acceptsBottom} onDrop={handleDrop} />
    <div>
      <slot name="next" child={$next} />
    </div>
  {/if}
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
