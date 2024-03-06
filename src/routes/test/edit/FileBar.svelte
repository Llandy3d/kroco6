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

<nav class="flex h-10 items-center px-4 text-sm">
  <RadioGroup.Root
    class="flex"
    value={$currentFile?.handle}
    onValueChange={handleCurrentFileChange}
  >
    {#each $openFiles as file (file.handle)}
      <RadioGroup.Item value={file.handle} class="pt-2 hover:bg-slate-200">
        <div class="flex items-center gap-2 px-4">
          <div>
            {file.name}
            {file.path.type === "new" && "*"}
          </div>
          <button class="hover:scale-125" on:click={handleClose(file)}><XCircle size={14} /></button
          >
        </div>
        <div
          class={`${file.handle === $currentFile?.handle ? "bg-[#7d64ff]" : "bg-slate-300"} m-1 h-1 rounded-sm`}
        ></div></RadioGroup.Item
      >
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
