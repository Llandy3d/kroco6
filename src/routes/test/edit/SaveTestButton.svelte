<script lang="ts">
  import { Trigger } from "$lib/components/ui/accordion";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import Label from "$lib/components/ui/label/label.svelte";
  import * as Popover from "$lib/components/ui/popover";
  import { currentFile } from "$lib/stores/editor";
  import { Save } from "lucide-svelte";

  let testName = $currentFile?.name;

  function handleNameAndSave() {
    if ($currentFile === null) return;
    $currentFile.name = testName ?? "New test";
    saveTest();
  }

  export let saveTest: () => void;
</script>

{#if $currentFile === null}
  <div></div>
{:else if $currentFile.path.type === "new"}
  <Popover.Root>
    <Popover.Trigger>
      <Button size="sm" variant="secondary">
        <Save size={14} class="mr-2 h-4 w-4" />
        Save
      </Button>
    </Popover.Trigger>
    <Popover.Content>
      <div class="flex flex-col gap-2">
        <Label for="k6-test-name">Test name</Label>
        <Input id="k6-test-name" bind:value={testName} />

        <Button size="sm" variant="secondary" on:click={handleNameAndSave}>Save changes</Button>
      </div>
    </Popover.Content>
  </Popover.Root>
{:else}
  <Button size="sm" variant="secondary" on:click={saveTest}>
    <Save size={14} class="mr-2 h-4 w-4" />
    Save
  </Button>
{/if}
