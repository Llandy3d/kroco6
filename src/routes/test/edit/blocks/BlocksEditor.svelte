<script lang="ts">
  import { runScriptInCloud, runScriptLocally } from "$lib/backend-client";
  import * as Tabs from "$lib/components/ui/tabs";
  import { loadContent, storeContent } from "$lib/files";
  import { loadTest, test } from "$lib/stores/blocks";
  import { EMPTY_BLOCK_TEST } from "$lib/stores/blocks/constants";
  import { convertToScript } from "$lib/stores/blocks/convert";
  import { parse } from "$lib/stores/blocks/model/strict";
  import type { BlockFile } from "$lib/stores/editor";
  import { EMPTY_ENVIRONMENT, currentEnvironment } from "$lib/stores/projects";
  import { open } from "@tauri-apps/api/shell";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import TestToolbar from "../TestToolbar.svelte";
  import Library from "../library/Library.svelte";
  import Canvas from "./Canvas.svelte";
  import ScriptPreview from "./ScriptPreview.svelte";

  let tab = "library";

  export let file: BlockFile;

  async function runTestLocally() {
    try {
      const script = await convertToScript($currentEnvironment ?? EMPTY_ENVIRONMENT, $test);
      const response = await runScriptLocally(script);

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function runTestInCloud(projectId: string) {
    if ($currentEnvironment === null) {
      toast.error(
        "No environment selected. Please select an environment to run the test in cloud.",
      );

      return;
    }

    try {
      const script = await convertToScript($currentEnvironment ?? EMPTY_ENVIRONMENT, $test);
      const results = await runScriptInCloud({ script, projectId });

      open(results);
    } catch (error) {
      toast.error("Error running test in cloud. Check your configuration.");
      console.error(error);
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
