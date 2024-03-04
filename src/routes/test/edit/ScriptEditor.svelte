<script lang="ts" context="module">
  import { loadContent, storeContent } from "$lib/files";
  import type { ScriptFile } from "$lib/stores/editor";
  import * as monaco from "monaco-editor";
  import { SCRIPT_MAP } from "$lib/example-scripts";
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import TestToolbar from "./TestToolbar.svelte";
  import { runScriptInCloud, runScriptLocally } from "$lib/backend-client";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

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

  function handleExScript(name: string) {
    const script = SCRIPT_MAP[name];
    if (script === undefined) {
      console.log(`Example script ${name} not found`);
      return
    }

    editor.setValue(script);
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
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>Script examples</DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Group>
        <DropdownMenu.Label>Authentication/Authorization</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item on:click={() => handleExScript("BASIC_AUTHENTICATION")}>Basic Authentication</DropdownMenu.Item>
        <DropdownMenu.Item on:click={() => handleExScript("DIGEST_AUTHENTICATION")}>Digest Authentication</DropdownMenu.Item>
      </DropdownMenu.Group>
      <DropdownMenu.Group>
        <DropdownMenu.Label>API CRUD operations</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item on:click={() => handleExScript("CORE_K6_API")}>Core k6 APIs example</DropdownMenu.Item>
      </DropdownMenu.Group>
      <DropdownMenu.Group>
        <DropdownMenu.Label>Cookies</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item on:click={() => handleExScript("COOKIES_HEADER")}>Accessing a cookie set in response headers</DropdownMenu.Item>
        <DropdownMenu.Item on:click={() => handleExScript("COOKIES_LOG_RESPONSE")}>Logging all cookies in response</DropdownMenu.Item>
        <DropdownMenu.Item on:click={() => handleExScript("COOKIES_SET_JAR")}>Setting a cookie in VU cookie jar</DropdownMenu.Item>
      </DropdownMenu.Group>
      <DropdownMenu.Group>
        <DropdownMenu.Label>Correlation</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item on:click={() => handleExScript("EXTRACT_JSON")}>Extracting values from JSON response</DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
  <div class="full-w flex-auto" bind:this={container}></div>
</div>
