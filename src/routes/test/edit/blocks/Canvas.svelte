<script lang="ts">
  import { dropOnCanvas, test } from "$lib/stores/blocks";
  import type { Block } from "$lib/stores/blocks/model/loose";
  import { isBlock } from "$lib/stores/blocks/utils";
  import AnyBlock from "./AnyBlock.svelte";
  import Root from "./Root.svelte";
  import Toolbox from "./Toolbox.svelte";
  import { dropzone, type DroppedEvent } from "./primitives/dnd";

  function handleDrop({ detail }: CustomEvent<DroppedEvent<Block, {}>>) {
    const { dropped } = detail.data;

    dropOnCanvas(dropped, {
      top: detail.top,
      left: detail.left,
    });
  }

  function handleClick() {}
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
    {#each $test.roots as root (root.block.id)}
      <Root {root}>
        <AnyBlock block={root.block} />
      </Root>
    {/each}
  </div>
</div>
