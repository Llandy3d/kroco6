<script lang="ts">
  import { dropzone, type DroppedEvent, type DroppingEvent } from "./dnd";
  import { type Block as BlockType, type ImmediateParent } from "$lib/store/test/types";
  import { derived } from "svelte/store";
  import { blocks, reparentBlock } from "$lib/store/test";

  export let accepts: string[] | undefined = undefined;
  export let owner: BlockType;

  let dropping = false;

  const current = derived(blocks, (blocks) => {
    return blocks.find(
      (block) => block.parent.type === "immediate" && block.parent.id === owner.id,
    );
  });

  const handleDropped = (ev: CustomEvent<DroppedEvent<BlockType, {}>>) => {
    if ($current !== undefined) {
      return;
    }

    const { dropped } = ev.detail.data;

    const parent: ImmediateParent = {
      type: "immediate",
      id: owner.id,
    };

    reparentBlock(parent, dropped);
  };

  const handleDropping = (ev: CustomEvent<DroppingEvent>) => {
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
