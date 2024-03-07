<script lang="ts">
  import { getCloudTests, type CloudTest } from "$lib/backend-client";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { activeProject } from "$lib/stores/projects";
  import { AlertTriangle } from "lucide-svelte";
  import ScriptPreview from "./ScriptPreview.svelte";

  let loading = false;
  let cloudTests: CloudTest[] = [];

  async function loadCloudTests() {
    loading = true;
    const allCloudTests = await getCloudTests($activeProject);
    cloudTests = allCloudTests.filter((test) => test.script !== null);
    loading = false;
  }

  $: {
    if (open) {
      loadCloudTests();
    }
  }

  export let open: boolean;
  export let setCloudScriptInEditor: (script: string) => void;
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Import Test from the Cloud</Dialog.Title>
      <Dialog.Description>
        <Alert.Root variant="destructive" class="mt-2">
          <AlertTriangle class="h-4 w-4" />
          <Alert.Title>Heads up!</Alert.Title>
          <Alert.Description
            >Importing a new script will overwrite your existing script. It is recommended to save
            your work before continuing since this action cannot be undone.</Alert.Description
          >
        </Alert.Root>
      </Dialog.Description>
    </Dialog.Header>
    <div class="max-h-[400px] overflow-auto">
      {#each cloudTests as test (test.id)}
        <div class="flex items-center gap-2 border-b">
          <ScriptPreview {test} />
          <div class="flex-1 text-ellipsis">{test.name}</div>
          <Button
            variant="link"
            size="sm"
            on:click={() => {
              setCloudScriptInEditor(test.script ?? "");
            }}>Import</Button
          >
        </div>
      {:else}
        {#if loading}
          <div>Loading...</div>
        {:else}
          <div>No tests found</div>
        {/if}
      {/each}
    </div>
  </Dialog.Content>
</Dialog.Root>
