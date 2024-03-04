<script lang="ts">
  import { isBlock, type Block, type Parent } from "$lib/stores/test/types";

  import Root from "./Root.svelte";
  import { dropzone, type DroppedEvent } from "./primitives/dnd";
  import { reparentBlock, roots, selected } from "$lib/stores/test";
  import Toolbox from "./Toolbox.svelte";
  import AnyBlock from "./AnyBlock.svelte";

  function handleDrop({ detail }: CustomEvent<DroppedEvent<Block, {}>>) {
    const dropped = detail.data.dropped;

    const parent: Parent = {
      type: "canvas",
      top: detail.top,
      left: detail.left,
    };

    reparentBlock(parent, dropped);
  }

  function handleClick() {
    selected.set(null);
  }
</script>

<div
  class="relative flex h-full w-full overflow-hidden"
  use:dropzone={{ accepts: isBlock, data: "canvas" }}
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
