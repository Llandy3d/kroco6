<script lang="ts">
  import { dropzone, type DroppedEvent, type DroppingEvent, type AcceptsCallback } from "./dnd";
  import { type Block, type BlockParent } from "$lib/stores/test/types";
  import { derived } from "svelte/store";
  import { blocks, reparentBlock } from "$lib/stores/test";

  export let owner: Block;
  export let accepts: AcceptsCallback<Block>;

  let dropping = false;

  const current = derived(blocks, (blocks) => {
    return blocks.find((block) => block.parent.type === "block" && block.parent.id === owner.id);
  });

  const handleDropped = (ev: CustomEvent<DroppedEvent<Block, {}>>) => {
    // if ($current !== undefined) {
    //   return;
    // }
    // const { dropped } = ev.detail.data;
    // const parent: BlockParent = {
    //   type: "immediate",
    //   id: owner.id,
    // };
    // reparentBlock(parent, dropped);
  };

  const handleDropping = (ev: CustomEvent<DroppingEvent<unknown>>) => {
    dropping = ev.detail.dropping;
  };
</script>

<div
  class="inline-block min-h-8 min-w-10 border-2 border-slate-300 bg-white"
  class:bg-slate-400={dropping}
  use:dropzone={{ accepts, data: {} }}
  on:dropped={handleDropped}
  on:dropping={handleDropping}
>
  <slot block={$current} />
</div>
