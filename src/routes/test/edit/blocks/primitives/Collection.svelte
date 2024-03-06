<script lang="ts" generics="TBottom extends Block">
  import { isBlock } from "$lib/stores/blocks/utils";

  import { isTemplate, type Block } from "$lib/stores/blocks/model/loose";

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
    return !isTemplate(owner) && isBlock(value) && connection.accepts(value);
  }
</script>

<div class="collection-root">
  <div class="select-none">
    <div class="flex rounded-l-md py-2">
      <div
        class="collection-container relative mb-4 flex w-6 flex-auto list-none flex-col border-t-4"
        style={toBlockColorStyle(color)}
      >
        <Bottom
          accepts={acceptsBlock}
          data={owner}
          connected={connection.block !== null}
          collection={true}
          onDrop={handleDropped}
        />
        <slot child={connection.block} />
      </div>
    </div>
  </div>
</div>

<style>
  .collection-container {
    border-color: var(--block-bg-primary);
  }
</style>
