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

<div class="relative flex h-full w-full items-stretch overflow-hidden">
  <Toolbox />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="grid-pattern relative flex-auto bg-[#F9F8FC]"
    on:click={handleClick}
    use:dropzone={{ accepts: isBlock, data: "canvas" }}
    on:dropped={handleDrop}
  >
    {#each $test.roots as root (root.block.id)}
      <Root {root}>
        <AnyBlock block={root.block} />
      </Root>
    {/each}
  </div>
</div>

<style>
  .grid-pattern::before {
    content: " ";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background-repeat: repeat;
    opacity: 0.1;
    background-size: 80px;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADCSURBVHgB7dyxCYBAEATAwwq1/wbki1BfMRDDR14PZ+DARDYRs90IAAAAAAAAgLupXqk31xujP/nv5h/B63kl+pP/QP4Q7a7vLtGf/Hfzj1/Q/hWW81n+v/IBAAAAAAAAAAAAAAAAgGT08+0D6Odnz7cPIL+Zfr59AAAAAAAAAAAAAAAAAAAgEf18+wD6+dnz7QPIb6afbx8AAAAAAAAAAAAAAAAAAEhEP98+gH5+9nz7APKb6efbBwAAAAAAAAA+awMQDJt5iCyvlQAAAABJRU5ErkJggg==);
  }
</style>
