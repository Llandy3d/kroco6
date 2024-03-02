<script lang="ts">
  import {
    type OpenFile,
    openFiles,
    currentFile,
    type ScriptFile,
    type BlockFile,
    newFile,
  } from "$lib/stores/editor";
  import { RadioGroup } from "bits-ui";
  import { PlusIcon, X } from "lucide-svelte";
  import { nanoid } from "nanoid";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

  const handleCurrentFileChange = (handle: string) => {
    $currentFile = $openFiles.find((file) => file.handle === handle) ?? null;
  };

  const handleClose = (file: OpenFile) => () => {
    $openFiles = $openFiles.filter((f) => f.handle !== file.handle);

    if ($currentFile?.handle === file.handle) {
      $currentFile = null;
    }
  };

  const handleNewBlocksFile = () => {
    newFile("block");
  };

  const handleNewScriptFile = () => {
    newFile("script");
  };
</script>

<nav class="flex h-10 items-center px-4 text-sm">
  <RadioGroup.Root
    class="flex"
    value={$currentFile?.handle}
    onValueChange={handleCurrentFileChange}
  >
    {#each $openFiles as file (file.handle)}
      <RadioGroup.Item
        value={file.handle}
        class="flex items-center gap-1 px-2 py-2 hover:bg-slate-200 data-[state='checked']:font-bold data-[state='checked']:shadow-md"
      >
        <div>
          {file.name}
          {#if file.path.type === "new"}
            *
          {/if}
        </div>
        <button class="hover:scale-125" on:click={handleClose(file)}><X size={14} /></button>
      </RadioGroup.Item>
    {/each}
  </RadioGroup.Root>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger class="p-1 hover:bg-slate-200">
      <PlusIcon size={14} />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Item on:click={handleNewBlocksFile}>Blocks</DropdownMenu.Item>
      <DropdownMenu.Item on:click={handleNewScriptFile}>Script</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
  <!-- <button class="p-1 hover:bg-slate-200"></button> -->
</nav>

<style>
</style>
