<script lang="ts" generics="TTarget extends Block">
  import { toBlockColorStyle, type BlockColor } from "./types";

  import { isTemplate, type Block } from "$lib/stores/blocks/model/loose";
  import { isBlock } from "$lib/stores/blocks/utils";
  import type { BottomConnection } from "./connections/types";
  import { dropzone, type DroppedEvent, type DroppingEvent } from "./dnd2";

  export let owner: Block;
  export let color: BlockColor;
  export let connection: BottomConnection<TTarget>;

  let dropping = false;

  function handleDropped(ev: CustomEvent<DroppedEvent<TTarget, {}>>) {
    console.log("dropped");
    connection.onDrop(ev.detail.data.dropped);

    dropping = false;
  }

  function handleDropping(ev: CustomEvent<DroppingEvent<unknown>>) {
    console.log("dropping");
    dropping = ev.detail.dropping;
  }

  function accepts(value: unknown): value is TTarget {
    console.log("accepts", value);
    return !isTemplate(owner) && isBlock(value) && connection.accepts(value);
  }
</script>

<div class="inline-block flex-auto" style={toBlockColorStyle(color)}>
  <div
    class="block-inset min-h-8 min-w-16 border-2 bg-white"
    class:bg-slate-400={dropping}
    class:connected={connection.block !== null}
    class:dropping
    use:dropzone={{ accepts, data: owner }}
    on:dropped={handleDropped}
    on:dropping={handleDropping}
  >
    <slot child={connection.block} />
  </div>
</div>

<style>
  :global(.block-inset) {
    opacity: 0.5;
    border-color: var(--block-bg-primary);
  }

  .connected {
    border: none;
  }

  .connected,
  .dropping {
    opacity: 1;
  }
</style>
