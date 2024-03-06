<script lang="ts" context="module">
  import { loadContent, storeContent } from "$lib/files";
  import { currentFile, updateFile, type ScriptFile } from "$lib/stores/editor";
  import * as monaco from "monaco-editor";
</script>

<script lang="ts">
  import {
    Test,
    createTest,
    getCloudTests,
    runScriptInCloud,
    runScriptLocally,
    saveTest,
    type CloudTest,
  } from "$lib/backend-client";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import { activeProject } from "$lib/stores/projects";
  import { open } from "@tauri-apps/api/shell";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import ScriptExamples from "./ScriptExamples.svelte";
  import TestToolbar from "./TestToolbar.svelte";

  export let file: ScriptFile;

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;

  let script = "";
  let cloud_tests: Array<CloudTest> = [];
  let cloudTestDialogOpen = false;

  async function loadCloudTests() {
    cloud_tests = await getCloudTests($activeProject);
  }

  function setCloudScriptInEditor(script: string | null) {
    if (script !== null) {
      editor.setValue(script);
    }
    cloudTestDialogOpen = false;
  }

  async function runTestLocally() {
    try {
      const response = await runScriptLocally(script);

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function runTestInCloud(projectId: string) {
    try {
      const results = await runScriptInCloud({ script, projectId });
      open(results);
    } catch (error) {
      toast.error("Error running test in cloud. Check your configuration.");
      console.error(error);
    }
  }

  function handleExScript(script: string) {
    editor.setValue(script);
  }

  async function handleSaveTest() {
    if (!$currentFile) return;

    if ($currentFile.path.type === "new") {
      await createTest($activeProject, new Test($currentFile.name, "Javascript", script));
      updateFile($currentFile.handle, { path: { type: "existing", path: "", original: "" } });
    } else {
      await saveTest($activeProject, $currentFile.name, script);
    }
  }

  onMount(() => {
    script = loadContent(file);

    editor = monaco.editor.create(container, {
      value: script,
      language: "javascript",
    });

    editor.onDidChangeModelContent(() => {
      script = editor.getValue();
    });
  });

  onDestroy(() => {
    storeContent(file, script);

    editor.dispose();
  });
</script>

<div class="flex flex-auto flex-col bg-white">
  <TestToolbar runTest={runTestLocally} {runTestInCloud} saveTest={handleSaveTest} />
  <ScriptExamples onSelectExample={handleExScript} />
  <Dialog.Root bind:open={cloudTestDialogOpen}>
    <Dialog.Trigger on:click={() => loadCloudTests()}>Open</Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Choose a test</Dialog.Title>
        <Dialog.Description>
          <div class="grid grid-cols-4">
            {#each cloud_tests as test}
              <Card.Root>
                <Card.Content>
                  <HoverCard.Root>
                    <HoverCard.Trigger>{test.name}</HoverCard.Trigger>
                    <HoverCard.Content>
                      {test.script}
                    </HoverCard.Content>
                  </HoverCard.Root>
                  <Button
                    class="bottom-0"
                    on:click={() => {
                      setCloudScriptInEditor(test.script);
                    }}>Use</Button
                  >
                </Card.Content>
              </Card.Root>
            {/each}
          </div>
          This action cannot be undone. This will permanently delete your account and remove your data
          from our servers.
        </Dialog.Description>
      </Dialog.Header>
    </Dialog.Content>
  </Dialog.Root>
  <div class="full-w flex-auto" bind:this={container}></div>
</div>
