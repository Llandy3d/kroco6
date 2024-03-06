<script lang="ts" generics="TBlock extends Block, TBottom extends Block">
  import { detachBlock, test } from "$lib/stores/blocks";

  import { isBlock } from "$lib/stores/blocks/utils";

  import type { BottomConnection } from "./connections/types";

  import { isTemplate, type Block } from "$lib/stores/blocks/model/loose";
  import Bottom from "./connections/Bottom.svelte";
  import Top from "./connections/Top.svelte";
  import { draggable, type AcceptsCallback, type DragChangeEvent, type DroppedEvent } from "./dnd";
  import { toBlockColorStyle, type BlockColor } from "./types";

  export let block: TBlock;

  export let top: AcceptsCallback | boolean = false;
  export let bottom: BottomConnection<TBottom> | null = null;

  export let color: BlockColor;

  let dragging = false;

  function handleDragChange(ev: CustomEvent<DragChangeEvent>) {
    dragging = ev.detail.dragging;
  }

  function handleClick(ev: MouseEvent) {
    if (ev.target instanceof HTMLElement) {
      ev.stopPropagation();
      ev.preventDefault();

      ev.target.parentElement?.focus();
    }
  }

  function handleKeyPress(ev: KeyboardEvent) {
    if (ev.key === "Backspace") {
      ev.preventDefault();
      ev.stopPropagation();

      test.update((test) => {
        return detachBlock(test, block);
      });
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
    if (bottom === null) {
      return false;
    }

    return !isTemplate(block) && isBlock(value) && bottom.accepts(value);
  }

  function handleDropBottom(ev: DroppedEvent<TBottom, Block>) {
    bottom?.onDrop(ev.data.dropped);
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  tabindex="0"
  id={block.id}
  class="block-root z-10 flex w-min flex-col outline-2 outline-indigo-500 focus:outline"
  class:dragging
  use:draggable={{
    data: block,
    accepts: acceptsTop,
  }}
  on:keypress={handleKeyPress}
  on:dragchange={handleDragChange}
  style={toBlockColorStyle(color)}
>
  <div
    class:has-top={top !== false}
    class="block-body w-min cursor-grab rounded-l-sm border-[1px] border-l-8 bg-white shadow-sm shadow-slate-300"
  >
    <div class="relative flex flex-col">
      {#if top}
        <Top />
      {/if}
      <div class="px-2 py-1">
        <slot />
      </div>
    </div>
    {#if bottom !== null}
      <Bottom data={block} accepts={acceptsBottom} onDrop={handleDropBottom} />
    {/if}
  </div>
  <div>
    {#if bottom !== null}
      <slot name="next" next={bottom.block} />
    {/if}
  </div>
</div>

<style>
  .has-top {
    border-top: none;
  }

  :global(.block-inset) .block-root {
    margin-top: 0;
    border-width: 1px;
    border-style: solid;
  }

  .block-body {
    border-color: var(--block-bg-primary);
  }

  .dragging {
    opacity: 0.8;
  }

  .dragging * {
    pointer-events: none;
  }
</style>
