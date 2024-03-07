<script lang="ts">
  import { Loader2, PlayCircle, Settings, UploadCloud } from "lucide-svelte";
  import { onMount } from "svelte";

  import {
    loadProjectConfig,
    saveProjectConfig,
    saveToken,
    type ProjectConfig,
  } from "$lib/backend-client";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { activeProject } from "$lib/stores/projects";
  import SaveTestButton from "./SaveTestButton.svelte";

  let modalOpen = false;
  let cloudRunPending = false;
  let projectConfig: ProjectConfig;

  $: canRunTestsInCloud =
    !cloudRunPending && projectConfig?.cloud_token !== "" && projectConfig?.cloud_project_id !== "";

  onMount(async () => {
    try {
      projectConfig = await loadProjectConfig($activeProject);
    } catch (error) {
      projectConfig = { cloud_token: "", cloud_project_id: "" };
    }
  });

  function onSaveSettings() {
    // NOTE: used to set the env variable
    saveToken(projectConfig.cloud_token);
    saveProjectConfig($activeProject, projectConfig);
    modalOpen = false;
  }

  export let runTest: () => void;
  export let runTestInCloud: (projectId: string) => Promise<void>;
  export let saveTest: () => void;

  async function onRunTestInCloud(projectId: string) {
    cloudRunPending = true;
    await runTestInCloud(projectId);
    cloudRunPending = false;
  }
</script>

<div class="flex justify-between rounded-none border-b-[1px] p-4">
  <div>
    <slot name="left" />
  </div>
  <div class="flex items-center gap-2">
    <slot name="right" />

    <SaveTestButton {saveTest} />

    <Tooltip.Root open={canRunTestsInCloud ? false : undefined}>
      <Tooltip.Trigger>
        <Button
          variant="outline"
          class="border-2 border-primary font-bold text-primary"
          on:click={() => {
            if (projectConfig) {
              onRunTestInCloud(projectConfig.cloud_project_id);
            }
          }}
          disabled={!canRunTestsInCloud}
        >
          {#if cloudRunPending}
            <Loader2 size={14} class="mr-2 h-4 w-4 animate-spin" />
          {:else}
            <UploadCloud size={14} class="mr-2 h-4 w-4" />
          {/if}
          Run in the Cloud
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom">
        {#if cloudRunPending}
          Cloud run in progress
        {:else}
          You need to configure a token and project id to run tests in the cloud.
        {/if}
      </Tooltip.Content>
    </Tooltip.Root>

    <Button on:click={runTest}>
      <PlayCircle size={14} class="mr-2 h-4 w-4" />
      Run locally
    </Button>

    <Button
      class="rounded-full"
      variant="ghost"
      size="icon"
      on:click={() => {
        modalOpen = true;
      }}
    >
      <Settings size={16} />
    </Button>
  </div>

  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Content class="overflow-hidden shadow-lg">
      <Dialog.Header>
        <Dialog.Title>Enter k6 cloud token</Dialog.Title>
        <Dialog.Description>
          Authenticate with k6 Cloud to run tests in the cloud.
        </Dialog.Description>
      </Dialog.Header>
      <Label for="k6-cloud-token">Cloud token</Label>
      <Input id="k6-cloud-token" bind:value={projectConfig.cloud_token} />

      <Label for="k6-cloud-project-id">Project Id</Label>
      <Input id="k6-cloud-project-id" bind:value={projectConfig.cloud_project_id} />

      <Dialog.Footer>
        <Button type="submit" on:click={onSaveSettings}>Submit</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>
