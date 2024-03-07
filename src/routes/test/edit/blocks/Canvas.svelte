<script lang="ts">
  import { dropOnCanvas } from "$lib/stores/blocks";
  import type { Block } from "$lib/stores/blocks/model/loose";
  import { isBlock } from "$lib/stores/blocks/utils";
  import { getCurrentTest } from "../blockEditorContext";
  import AnyBlock from "./AnyBlock.svelte";
  import Root from "./Root.svelte";
  import Toolbox from "./Toolbox.svelte";
  import { dropzone, type DroppedEvent } from "./primitives/dnd";

  const test = getCurrentTest();

  function handleDrop({ detail }: CustomEvent<DroppedEvent<Block, {}>>) {
    const { dropped } = detail.data;

    $test = dropOnCanvas($test, dropped, {
      top: detail.top,
      left: detail.left,
    });
  }

  function handleClick() {}
</script>

<div
  class="relative flex h-full w-full items-stretch overflow-hidden"
  use:dropzone={{ accepts: isBlock, data: "canvas" }}
  on:dropped={handleDrop}
>
  <Toolbox />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="grid-pattern flex-auto" on:click={handleClick}>
    {#each $test.roots as root (root.block.id)}
      <Root {root}>
        <AnyBlock block={root.block} />
      </Root>
    {/each}
  </div>
</div>

<style>
  .grid-pattern {
    background-size: 16px 16px;
    background-image: radial-gradient(circle, #eee 1px, rgba(0, 0, 0, 0) 1px);
  }
</style>
