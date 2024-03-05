<script lang="ts" context="module">
  import { loadContent, storeContent } from "$lib/files";
  import type { ScriptFile } from "$lib/stores/editor";
  import * as monaco from "monaco-editor";
  import * as scripts from "$lib/example-scripts";
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import TestToolbar from "./TestToolbar.svelte";
  import { runScriptInCloud, runScriptLocally, getCloudTests, type Project, type CloudTest } from "$lib/backend-client";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Card from "$lib/components/ui/card";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import { Button } from "$lib/components/ui/button";
  import { open } from "@tauri-apps/api/shell";
  import { toast } from "svelte-sonner";

  export let file: ScriptFile;

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;

  let script = "";
  let cloud_tests: Array<CloudTest> = [];
  let cloudTestDialogOpen = false;

  async function loadCloudTests() {
    // TODO: we need to know the current active project
    const project: Project = { name: "default", test_collections: [] };
    cloud_tests = await getCloudTests(project);
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
        <DropdownMenu.Item on:click={() => handleExScript(scripts.BASIC_AUTHENTICATION)}
          >Basic Authentication</DropdownMenu.Item
        >
        <DropdownMenu.Item on:click={() => handleExScript(scripts.DIGEST_AUTHENTICATION)}
          >Digest Authentication</DropdownMenu.Item
        >
      </DropdownMenu.Group>
      <DropdownMenu.Group>
        <DropdownMenu.Label>API CRUD operations</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item on:click={() => handleExScript(scripts.CORE_K6_API)}
          >Core k6 APIs example</DropdownMenu.Item
        >
      </DropdownMenu.Group>
      <DropdownMenu.Group>
        <DropdownMenu.Label>Cookies</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item on:click={() => handleExScript(scripts.COOKIES_HEADER)}
          >Accessing a cookie set in response headers</DropdownMenu.Item
        >
        <DropdownMenu.Item on:click={() => handleExScript(scripts.COOKIES_LOG_RESPONSE)}
          >Logging all cookies in response</DropdownMenu.Item
        >
        <DropdownMenu.Item on:click={() => handleExScript(scripts.COOKIES_SET_JAR)}
          >Setting a cookie in VU cookie jar</DropdownMenu.Item
        >
      </DropdownMenu.Group>
      <DropdownMenu.Group>
        <DropdownMenu.Label>Correlation</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item on:click={() => handleExScript(scripts.EXTRACT_JSON)}
          >Extracting values from JSON response</DropdownMenu.Item
        >
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
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
                <Button class="bottom-0"on:click={() => {setCloudScriptInEditor(test.script)}}>Use</Button>
                </Card.Content>
              </Card.Root>
            {/each}
            </div>
          This action cannot be undone. This will permanently delete your account
          and remove your data from our servers.
        </Dialog.Description>
      </Dialog.Header>
    </Dialog.Content>
  </Dialog.Root>
    <div class="full-w flex-auto" bind:this={container}></div>
  </div>
