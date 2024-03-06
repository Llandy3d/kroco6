<script lang="ts">
  import { runScriptInCloud, runScriptLocally } from "$lib/backend-client";
  import { Button } from "$lib/components/ui/button";
  import { loadContent, storeContent } from "$lib/files";
  import { loadTest, test } from "$lib/stores/blocks";
  import { EMPTY_BLOCK_TEST } from "$lib/stores/blocks/constants";
  import { convertToScript } from "$lib/stores/blocks/convert";
  import { parse } from "$lib/stores/blocks/model/strict";
  import { newFile, type BlockFile } from "$lib/stores/editor";
  import { open } from "@tauri-apps/api/shell";
  import { Tabs } from "bits-ui";
  import { Book, Code, FileCode2, Layers } from "lucide-svelte";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import TestToolbar from "../TestToolbar.svelte";
  import Library from "../library/Library.svelte";
  import Canvas from "./Canvas.svelte";
  import ScriptPreview from "./ScriptPreview.svelte";
  import TabButton from "./TabButton.svelte";

  let tab = "build";

  export let file: BlockFile;

  async function runTestLocally() {
    try {
      const script = await convertToScript($test);
      const response = await runScriptLocally(script);

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function runTestInCloud(projectId: string) {
    try {
      const script = await convertToScript($test);
      const results = await runScriptInCloud({ script, projectId });

      open(results);
    } catch (error) {
      toast.error("Error running test in cloud. Check your configuration.");
      console.error(error);
    }
  }

  async function handleConvertToScript() {
    try {
      const script = await convertToScript($test);

      newFile({
        type: "script",
        initial: script,
      });
    } catch {
      toast.error("The script could not be generated because the blocks contain errors.");
    }
  }

  onMount(() => {
    // We store the block test in sessionStorage, so that changes are preserved
    // when the user switches between tabs.
    let content = loadContent(file);

    try {
      const test = parse(JSON.parse(content));

      if (!test.success) {
        console.log("Failed to parse block test", test.issues);

        loadTest(EMPTY_BLOCK_TEST);

        return;
      }

      loadTest(test.output);
    } catch (e) {
      loadTest(EMPTY_BLOCK_TEST);

      console.error(e);
    }
  });

  onDestroy(() => {
    storeContent(file, $test);
  });
</script>

<div class="flex flex-auto">
  <Tabs.Root class="flex flex-auto flex-col" bind:value={tab}>
    <TestToolbar runTest={runTestLocally} {runTestInCloud}>
      <svelte:fragment slot="left">
        <Tabs.List class="bg-default flex rounded-none shadow-none">
          <TabButton value="build"><Layers size={14} /> Build</TabButton>
          <TabButton value="library"><Book size={14} /> Library</TabButton>
          <TabButton value="script"><Code size={14} /> Script</TabButton>
        </Tabs.List>
      </svelte:fragment>
      <svelte:fragment slot="right">
        <Button class="hidden" size="sm" variant="secondary" on:click={handleConvertToScript}>
          <FileCode2 size={14} class="mr-2 h-4 w-4" />
          Convert to script
        </Button>
      </svelte:fragment>
    </TestToolbar>
    <Tabs.Content value="build" class="flex-auto">
      <Canvas />
    </Tabs.Content>
    <Tabs.Content value="library" class="mt-0 flex-auto">
      <Library />
    </Tabs.Content>
    <Tabs.Content value="script" class="flex-auto">
      <ScriptPreview />
    </Tabs.Content>
  </Tabs.Root>
</div>
