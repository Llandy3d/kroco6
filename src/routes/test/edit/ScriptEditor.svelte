<script lang="ts" context="module">
  import { loadContent, storeContent } from "$lib/files";
  import type { ScriptFile } from "$lib/stores/editor";
  import * as monaco from "monaco-editor";
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import TestToolbar from "./TestToolbar.svelte";
  import { runScriptInCloud, runScriptLocally } from "$lib/backend-client";

  export let file: ScriptFile;

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;

  let script = "";

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

<div class="flex flex-auto flex-col">
  <TestToolbar runTest={runTestLocally} {runTestInCloud} />
  <div class="full-w flex-auto" bind:this={container}></div>
</div>
