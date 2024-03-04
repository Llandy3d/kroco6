<script lang="ts" context="module">
  export interface InsertBlockEvent {
    target: BlockType;
    before: BlockType;
  }

  export interface AppendBlockEvent {
    target: BlockType;
  }
</script>

<script lang="ts">
  import type { Block as BlockType } from "$lib/stores/test/types";
  import { cn } from "$lib/utils";
  import Bottom from "./connections/Bottom.svelte";
  import { type DroppedEvent } from "./dnd";
  import DropZone from "./DropZone.svelte";
  import { createEventDispatcher } from "svelte";
  import { toBlockColorStyle, type BlockColor } from "./types";

  export let accepts: string[] | undefined;
  export let items: BlockType[];

  export let color: BlockColor;

  const dispatch = createEventDispatcher<{
    insert: InsertBlockEvent;
    append: AppendBlockEvent;
  }>();

  const handleDropped = (ev: CustomEvent<DroppedEvent<BlockType, BlockType | null>>) => {
    const { dropped, target } = ev.detail.data;

    // If we are dropping an item before itself, then we don't need to do anything.
    if (dropped.id === target?.id) {
      return;
    }

    if (target === null) {
      dispatch("append", {
        target: dropped,
      });

      return;
    }

    dispatch("insert", {
      target: dropped,
      before: target,
    });
  };
</script>

<div class="collection-root">
  <div class="header h-2 w-full"></div>
  <div class="select-none">
    <div class="flex rounded-l-md">
      <div class="padding w-2"></div>
      <ul
        class="separator relative flex w-6 flex-auto list-none flex-col"
        style={toBlockColorStyle(color)}
      >
        <Bottom collection />
        {#each items as item (item.id)}
          <li class="relative z-0 border-slate-200">
            <DropZone {accepts} data={item} on:dropped={handleDropped} />
            <slot {item} />
          </li>
        {/each}
        <li class="relative z-0 min-h-4">
          <DropZone {accepts} data={null} on:dropped={handleDropped} />
        </li>
      </ul>
    </div>
  </div>
  <div class="footer h-2 w-full rounded-tr-md"></div>
</div>

<style>
  .header,
  .footer,
  .padding {
    background-color: var(--block-bg-secondary);
  }

  .collection-root:last-child .footer {
    border-bottom-right-radius: 0.25rem;
  }

  .separator {
    gap: 1px;
  }
</style>
