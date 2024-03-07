<script lang="ts">
  import {
    Test,
    createTest,
    runScriptInCloud,
    runScriptLocally,
    saveTest,
  } from "$lib/backend-client";
  import { Button } from "$lib/components/ui/button";
  import { EMPTY_BLOCK_TEST } from "$lib/stores/blocks/constants";
  import { convertToScript } from "$lib/stores/blocks/convert";
  import { parse } from "$lib/stores/blocks/model/strict";
  import { currentFile, newFile, updateFile, type BlockFile } from "$lib/stores/editor";
  import { EMPTY_ENVIRONMENT, currentEnvironment } from "$lib/stores/projects";

  import { activeProject } from "$lib/stores/projects";
  import { open } from "@tauri-apps/api/shell";
  import { Tabs } from "bits-ui";
  import { Book, Code, FileCode2, Layers } from "lucide-svelte";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import TestToolbar from "../TestToolbar.svelte";
  import { setBlockEditorContext } from "../blockEditorContext";
  import Library from "../library/Library.svelte";
  import Canvas from "./Canvas.svelte";
  import ScriptPreview from "./ScriptPreview.svelte";
  import TabButton from "./TabButton.svelte";

  let tab = "build";

  export let file: BlockFile;

  const { test } = setBlockEditorContext(EMPTY_BLOCK_TEST);

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

  async function handleConvertToScript() {
    try {
      const script = await convertToScript($currentEnvironment ?? EMPTY_ENVIRONMENT, $test);

      newFile({
        type: "script",
        initial: script,
      });
    } catch {
      toast.error("The script could not be generated because the blocks contain errors.");
    }
  }

  async function handleSaveTest() {
    if (!$currentFile) return;

    await saveTest("default", $currentFile.name, JSON.stringify($test));

    if ($currentFile.path.type === "new") {
      updateFile($currentFile.handle, { path: { type: "existing", path: "", original: "" } });
    }

    if ($currentFile.path.type === "new") {
      await createTest(
        $activeProject,
        new Test($currentFile.name, "Blocks", JSON.stringify($test)),
      );
      updateFile($currentFile.handle, { path: { type: "existing", path: "", original: "" } });
    } else {
      await saveTest($activeProject, $currentFile.name, JSON.stringify($test));
    }
  }

  onMount(() => {
    let content = file.path.type === "new" ? file.path.initial : file.path.original;

    try {
      const parsed = parse(JSON.parse(content));

      if (!parsed.success) {
        console.log("Failed to parse block test", parsed.issues);

        test.set(EMPTY_BLOCK_TEST);

        return;
      }

      test.set(parsed.output);
    } catch (e) {
      test.set(EMPTY_BLOCK_TEST);

      console.error(e);
    }
  });
</script>

<div class="flex flex-auto">
  <Tabs.Root class="flex flex-auto flex-col" bind:value={tab}>
    <TestToolbar runTest={runTestLocally} {runTestInCloud} saveTest={handleSaveTest}>
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
