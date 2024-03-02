<script lang="ts">
  import type { Block as BlockType } from "$lib/stores/test/types";

  import Root from "./blocks/Root.svelte";
  import { dropzone, type DroppedEvent } from "./blocks/primitives/dnd";
  import { reparentBlock, roots, selected } from "$lib/stores/test";
  import AnyBlock from "./blocks/AnyBlock.svelte";
  import Toolbox from "./blocks/Toolbox.svelte";

  const handleDrop = ({ detail }: CustomEvent<DroppedEvent<BlockType, {}>>) => {
    const dropped = detail.data.dropped;

    const parent = {
      type: "canvas",
      top: detail.top,
      left: detail.left,
    } as const;

    reparentBlock(parent, dropped);
  };

  const handleClick = () => {
    selected.set(null);
  };
</script>

<div
  class="relative flex h-full w-full overflow-hidden"
  use:dropzone={{ data: {} }}
  on:dropped={handleDrop}
>
  <Toolbox />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="flex-auto" on:click={handleClick}>
    {#each $roots as root (root.id)}
      <Root {root}>
        <AnyBlock block={root} />
      </Root>
    {/each}
  </div>
</div>
