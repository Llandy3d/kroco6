<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { currentFile, newFile, openFiles, type OpenFile } from "$lib/stores/editor";
  import { Tabs } from "bits-ui";
  import { PlusIcon, XCircle } from "lucide-svelte";
  import EmptyEditor from "./EmptyEditor.svelte";
  import ScriptEditor from "./ScriptEditor.svelte";
  import BlocksEditor from "./blocks/BlocksEditor.svelte";

  const handleCurrentFileChange = (handle: string | undefined) => {
    $currentFile = $openFiles.find((file) => file.handle === handle) ?? null;
  };

  const handleClose = (file: OpenFile) => () => {
    const openIndex = $openFiles.findIndex((f) => f.handle === file.handle);

    $openFiles = $openFiles.filter((f) => f.handle !== file.handle);

    if ($currentFile?.handle === file.handle) {
      $currentFile = $openFiles[openIndex] ?? null;
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

<Tabs.Root
  value={$currentFile?.handle ?? "empty"}
  class="flex flex-auto flex-col"
  onValueChange={handleCurrentFileChange}
>
  <Tabs.List class="flex h-10 items-center gap-2 bg-secondary text-sm font-light">
    {#each $openFiles as file (file.handle)}
      <Tabs.Trigger
        value={file.handle}
        class="flex items-center gap-2 border-b-4 px-2 py-2 hover:bg-slate-200 data-[state=active]:border-primary"
      >
        <span>
          {file.name}
          {#if file.path.type === "new"}
            *
          {/if}
        </span>
        <button class="hover:scale-125" on:click={handleClose(file)}
          ><XCircle size={16} class="text-slate-400" /></button
        >
      </Tabs.Trigger>
    {/each}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class="p-2 hover:bg-slate-200">
        <PlusIcon size={14} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item on:click={handleNewBlocksFile}>Blocks</DropdownMenu.Item>
        <DropdownMenu.Item on:click={handleNewScriptFile}>Script</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Tabs.List>
  {#each $openFiles as file (file.handle)}
    <Tabs.Content value={file.handle} class="flex-auto bg-white ">
      <div class="flex h-full flex-col">
        {#if file === null}
          <EmptyEditor />
        {:else if file.type === "block"}
          <BlocksEditor {file} />
        {:else if file.type === "script"}
          <ScriptEditor {file} />
        {/if}
      </div>
    </Tabs.Content>
  {/each}
  <Tabs.Content value={"empty"} class="flex-auto bg-white">
    <div class="flex h-full flex-col">
      <EmptyEditor />
    </div>
  </Tabs.Content>
</Tabs.Root>
