<script lang="ts" context="module">
  import { loadContent, storeContent } from "$lib/files";
  import type { ScriptFile } from "$lib/store/editor";
  import * as monaco from "monaco-editor";
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  export let file: ScriptFile;

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;

  let script = "";

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

<div class="full-w flex-auto" bind:this={container}></div>
