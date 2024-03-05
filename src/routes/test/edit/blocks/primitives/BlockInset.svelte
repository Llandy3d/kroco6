<script lang="ts" generics="TBottom extends Block">
  import type { Block } from "$lib/stores/blocks/model/loose";
  import { isBlock } from "$lib/stores/blocks/utils";
  import type { BottomConnection } from "./connections/types";
  import { dropzone, type DroppedEvent, type DroppingEvent } from "./dnd";

  export let connection: BottomConnection<TBottom>;

  let dropping = false;

  function handleDropped(ev: CustomEvent<DroppedEvent<Block, {}>>) {
    // if ($current !== undefined) {
    //   return;
    // }
    // const { dropped } = ev.detail.data;
    // const parent: BlockParent = {
    //   type: "immediate",
    //   id: owner.id,
    // };
    // reparentBlock(parent, dropped);
  }

  function handleDropping(ev: CustomEvent<DroppingEvent<unknown>>) {
    dropping = ev.detail.dropping;
  }

  function accepts(value: unknown): value is TBottom {
    return isBlock(value) && connection.accepts(value);
  }
</script>

<div
  class="inline-block min-h-8 min-w-10 border-2 border-slate-300 bg-white"
  class:bg-slate-400={dropping}
  use:dropzone={{ accepts, data: {} }}
  on:dropped={handleDropped}
  on:dropping={handleDropping}
>
  <slot child={connection.block} />
</div>
