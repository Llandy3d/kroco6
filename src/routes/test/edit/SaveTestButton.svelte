<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import Label from "$lib/components/ui/label/label.svelte";
  import * as Popover from "$lib/components/ui/popover";
  import { currentFile } from "$lib/stores/editor";
  import { Save } from "lucide-svelte";

  let testName = $currentFile?.name;

  function handleNameAndSave() {
    if ($currentFile === null) {
      return;
    }

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
      <Button variant="ghost" size="icon" class="rounded-full">
        <Save size={14} />
      </Button>
    </Popover.Trigger>
    <Popover.Content>
      <div class="flex flex-col gap-2">
        <Label for="k6-test-name">Test name</Label>
        <Input id="k6-test-name" bind:value={testName} class="mb-2" />

        <Button size="sm" on:click={handleNameAndSave}>Save changes</Button>
      </div>
    </Popover.Content>
  </Popover.Root>
{:else}
  <Button variant="ghost" size="icon" class="rounded-full" on:click={saveTest}>
    <Save size={14} />
  </Button>
{/if}
