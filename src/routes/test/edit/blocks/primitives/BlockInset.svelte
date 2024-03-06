<script lang="ts" generics="TTarget extends Block">
  import { isTemplate, type Block } from "$lib/stores/blocks/model/loose";
  import { isBlock } from "$lib/stores/blocks/utils";
  import type { BottomConnection } from "./connections/types";
  import { dropzone, type DroppedEvent, type DroppingEvent } from "./dnd";

  export let owner: Block;
  export let connection: BottomConnection<TTarget>;

  let dropping = false;

  function handleDropped(ev: CustomEvent<DroppedEvent<TTarget, {}>>) {
    connection.onDrop(ev.detail.data.dropped);

    dropping = false;
  }

  function handleDropping(ev: CustomEvent<DroppingEvent<unknown>>) {
    dropping = ev.detail.dropping;
  }

  function accepts(value: unknown): value is TTarget {
    return !isTemplate(owner) && isBlock(value) && connection.accepts(value);
  }
</script>

<div
  class="inline-block min-h-6 min-w-16 border-2 border-slate-300 bg-white"
  class:bg-slate-400={dropping}
  use:dropzone={{ accepts, data: owner }}
  on:dropped={handleDropped}
  on:dropping={handleDropping}
>
  <slot child={connection.block} />
</div>
