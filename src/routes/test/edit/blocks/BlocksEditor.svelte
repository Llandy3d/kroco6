<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import type { BlockFile } from "$lib/stores/editor";
  import { onDestroy, onMount } from "svelte";
  import Canvas from "./Canvas.svelte";
  import ScriptPreview from "./ScriptPreview.svelte";
  import { blockTest, loadBlockTest } from "$lib/stores/test";
  import { loadContent, storeContent } from "$lib/files";
  import Library from "../library/Library.svelte";
  import { EMPTY_BLOCK_TEST, type BlockTest } from "$lib/stores/test/types";
  import { runScriptInCloud, runScriptLocally } from "$lib/backend-client";
  import { convertToScript } from "$lib/convert";
  import { invoke } from "@tauri-apps/api";
  import TestToolbar from "../TestToolbar.svelte";

  let tab = "library";

  export let file: BlockFile;

  async function runTestLocally() {
    try {
      const script = await convertToScript($blockTest);
      const response = await runScriptLocally(script);

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function runTestInCloud(projectId: string) {
    try {
      const script = await convertToScript($blockTest);
      const response = await runScriptInCloud({ script, projectId });

      const match = response.match(/output: (https?:\/\/[^\s]+)/);

      if (match === null) {
        throw new Error("No URL found in output");
      }

      open(match[1]);
    } catch (error) {
      console.error(error);
    }
  }

  onMount(() => {
    // We store the block test in sessionStorage, so that changes are preserved
    // when the user switches between tabs.
    let content = loadContent(file);

    try {
      const blockTest = JSON.parse(content) as BlockTest;

      loadBlockTest(blockTest);
    } catch (e) {
      loadBlockTest(EMPTY_BLOCK_TEST);

      console.error(e);
    }
  });

  onDestroy(() => {
    storeContent(file, $blockTest);
  });
</script>

<div class="flex flex-auto">
  <Tabs.Root class="flex flex-auto flex-col" bind:value={tab}>
    <TestToolbar runTest={runTestLocally} {runTestInCloud}>
      <svelte:fragment slot="left">
        <Tabs.List>
          <Tabs.Trigger value="library">Library</Tabs.Trigger>
          <Tabs.Trigger value="build">Build</Tabs.Trigger>
          <Tabs.Trigger value="script">Script</Tabs.Trigger>
        </Tabs.List>
      </svelte:fragment>
    </TestToolbar>
    <Tabs.Content value="library" class="mt-0 flex-auto">
      <Library />
    </Tabs.Content>
    <Tabs.Content value="build" class="flex-auto">
      <Canvas />
    </Tabs.Content>
    <Tabs.Content value="script" class="flex-auto">
      <ScriptPreview />
    </Tabs.Content>
  </Tabs.Root>
</div>