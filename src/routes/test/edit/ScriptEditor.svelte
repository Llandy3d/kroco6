<script lang="ts" context="module">
  import { loadContent, storeContent } from "$lib/files";
  import { currentFile, updateFile, type ScriptFile } from "$lib/stores/editor";
  import * as monaco from "monaco-editor";
</script>

<script lang="ts">
  import {
    Test,
    createTest,
    runScriptInCloud,
    runScriptLocally,
    saveTest,
  } from "$lib/backend-client";

  import { Button } from "$lib/components/ui/button";
  import { activeProject } from "$lib/stores/projects";
  import { refetchTests } from "$lib/stores/tests";
  import { open } from "@tauri-apps/api/shell";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import ImportDialog from "./ImportDialog.svelte";
  import ScriptExamples from "./ScriptExamples.svelte";
  import TestToolbar from "./TestToolbar.svelte";

  export let file: ScriptFile;

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;

  let script = "";
  let cloudTestDialogOpen = false;

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
      refetchTests($activeProject);
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
  <div class="flex gap-2">
    <ScriptExamples onSelectExample={handleExScript} />
    <Button
      size="sm"
      variant="ghost"
      on:click={() => {
        cloudTestDialogOpen = true;
      }}>Import script</Button
    >
  </div>
  <ImportDialog bind:open={cloudTestDialogOpen} {setCloudScriptInEditor} />
  <div class="full-w flex-auto" bind:this={container}></div>
</div>
