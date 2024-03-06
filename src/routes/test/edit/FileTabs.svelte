<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { currentFile, newFile, openFiles, type OpenFile } from "$lib/stores/editor";
  import { RadioGroup } from "bits-ui";
  import { PlusIcon, XCircle } from "lucide-svelte";

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
    newFile({
      type: "block",
    });
  };

  const handleNewScriptFile = () => {
    newFile({
      type: "script",
    });
  };
</script>

<nav class="flex h-10 items-center gap-2 bg-secondary px-4 text-sm font-light">
  <RadioGroup.Root
    class="flex gap-1"
    value={$currentFile?.handle}
    onValueChange={handleCurrentFileChange}
  >
    {#each $openFiles as file (file.handle)}
      <RadioGroup.Item
        value={file.handle}
        class="flex items-center gap-2 border-b-4 px-2 py-2 hover:bg-slate-200 data-[state='checked']:border-primary"
      >
        <div>
          {file.name}
          {#if file.path.type === "new"}
            *
          {/if}
        </div>
        <button class="hover:scale-125" on:click={handleClose(file)}
          ><XCircle size={16} class="text-slate-400" /></button
        >
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
