<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";
  import { AlertOctagon, Puzzle, FileCode } from "lucide-svelte";
  import { FilePlus } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { goto } from "$app/navigation";
  import { newFile } from "$lib/stores/editor";

  let createTestDialogOpen = false;
  let testType: "block" | "script" = "block";
  let testName: string = "New Test";

  function handleNewTest() {
    newFile(testType, testName);

    goto("/test/edit");
  }
</script>

<div class="flex justify-center py-20">
  <Button variant="outline" class="my-4 py-8" on:click={() => (createTestDialogOpen = true)}>
    <FilePlus class="mr-2 h-12 w-12" />
    Create a new test
  </Button>
</div>

<Dialog.Root bind:open={createTestDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create a new test</Dialog.Title>
      <Dialog.Description>Create either a new test with blocks or via script.</Dialog.Description>
    </Dialog.Header>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="name" class="text-right">Name</Label>
      <Input id="name" class="col-span-3" bind:value={testName} />
    </div>
    <ToggleGroup.Root type="single" bind:value={testType}>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <ToggleGroup.Item value="block" aria-label="Toggle blocks" class="py-8">
            <Puzzle class="h-12 w-12" />
          </ToggleGroup.Item>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Use the blocks interface</p>
        </Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <ToggleGroup.Item value="script" aria-label="Toggle script" class="py-8">
            <FileCode class="h-12 w-12" />
          </ToggleGroup.Item>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Use the script editor</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </ToggleGroup.Root>
    <Dialog.Footer>
      <Button on:click={handleNewTest}>Create</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
