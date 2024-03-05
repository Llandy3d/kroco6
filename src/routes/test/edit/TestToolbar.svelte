<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api";
  import { PlayCircle, UploadCloud, Settings } from "lucide-svelte";

  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { saveToken } from "$lib/backend-client";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { Content } from "$lib/components/ui/accordion";
  import { saveProjectConfig, loadProjectConfig, type Project, type ProjectConfig } from "$lib/backend-client";

  let modalOpen = false;
  let projectConfig: ProjectConfig;

  $: canRunTestsInCloud = projectConfig.cloud_token !== "" && projectConfig.cloud_project_id !== "";

  onMount(async () => {
    // TODO: we need to know the current active project
    const project: Project = {"name": "default", "test_collections": []};
    try {
      projectConfig = await loadProjectConfig(project);
    } catch (error) {
      projectConfig = {"cloud_token": "", "cloud_project_id": ""};
    }
  });

  function onSaveSettings() {
    // NOTE: used to set the env variable
    saveToken(projectConfig.cloud_token);
    // TODO: we need to know the current active project
    const project: Project = {"name": "default", "test_collections": []};
    saveProjectConfig(project, projectConfig);
    modalOpen = false;
  }

  export let runTest: () => void;
  export let runTestInCloud: (projectId: string) => void;
</script>

<div class="flex justify-between rounded-none bg-secondary p-1 shadow-md">
  <div>
    <slot name="left" />
  </div>
  <div class="flex items-center gap-2">
    <Button size="sm" variant="secondary" on:click={runTest}>
      <PlayCircle size={14} class="mr-2 h-4 w-4" />
      Run
    </Button>

    <Tooltip.Root open={canRunTestsInCloud ? false : undefined}>
      <Tooltip.Trigger>
        <Button
          size="sm"
          variant="secondary"
          on:click={() => runTestInCloud(projectId)}
          disabled={!canRunTestsInCloud}
        >
          <UploadCloud size={14} class="mr-2 h-4 w-4" />
          Run in Cloud
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom">
        You need to configure a token and project id to run tests in the cloud.
      </Tooltip.Content>
    </Tooltip.Root>

    <Button
      class="rounded-full"
      size="sm"
      variant="ghost"
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
        <Dialog.Description
          >Authenticate with k6 Cloud to run tests in the cloud.</Dialog.Description
        >
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
