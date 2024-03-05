<script lang="ts">
  import {
    isBlock,
    type Block,
    type BlockParent,
    type CollectionParent,
  } from "$lib/stores/test/types";
  import Bottom from "./connections/Bottom.svelte";
  import { type AcceptsCallback, type DroppedEvent } from "./dnd";
  import { toBlockColorStyle, type BlockColor } from "./types";
  import { derived } from "svelte/store";
  import { blocks, byCollectionParent, reparentBlock } from "$lib/stores/test";

  export let owner: Block;
  export let name: string;

  export let accepts: AcceptsCallback<Block>;

  const child = derived(blocks, byCollectionParent(owner.id, name));

  export let color: BlockColor;

  function handleDropped(ev: DroppedEvent<Block, Block | null>) {
    const parent: CollectionParent = {
      type: "collection",
      name,
      ownerId: owner.id,
    };

    reparentBlock(parent, ev.data.dropped);
  }

  function acceptsBlock(value: unknown): value is Block {
    return owner.parent.type !== "toolbox" && isBlock(value) && accepts(value);
  }
</script>

<div class="collection-root">
  <div class="header h-2 w-full"></div>
  <div class="select-none">
    <div class="flex rounded-l-md">
      <div class="padding w-2"></div>
      <div
        class="separator relative mb-4 flex w-6 flex-auto list-none flex-col"
        style={toBlockColorStyle(color)}
      >
        <Bottom
          accepts={acceptsBlock}
          data={owner}
          connected={child !== null}
          onDrop={handleDropped}
        />
        <slot child={$child} />
      </div>
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
