<script lang="ts" generics="TBottom extends Block">
  import { isBlock } from "$lib/stores/blocks/utils";

  import type { Block } from "$lib/stores/blocks/model/loose";

  import Bottom from "./connections/Bottom.svelte";
  import type { BottomConnection } from "./connections/types";
  import { type DroppedEvent } from "./dnd";
  import { toBlockColorStyle, type BlockColor } from "./types";

  export let owner: Block;
  export let color: BlockColor;
  export let connection: BottomConnection<TBottom>;

  function handleDropped(ev: DroppedEvent<TBottom, Block | null>) {
    connection.onDrop(ev.data.dropped);
  }

  function acceptsBlock(value: unknown): value is TBottom {
    return isBlock(value) && connection.accepts(value);
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
          connected={connection.block !== null}
          onDrop={handleDropped}
        />
        <slot child={connection.block} />
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
