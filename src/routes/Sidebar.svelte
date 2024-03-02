<script lang="ts">
  import { PlusCircle, FlaskConical } from "lucide-svelte";
  import { Check, ChevronsUpDown } from "lucide-svelte";
  import { tick } from "svelte";

  import { goto } from "$app/navigation";
  import { createProject } from "$lib/backend-client";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Badge } from "$lib/components/ui/badge";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { projects } from "$lib/stores/projects";
  import { Separator } from "$lib/components/ui/separator";
  import { cn } from "$lib/utils";

  let open = false;
  let value = "default-project";
  let createProjectValue = "";

  $: selectedValue = $projects.find((f) => f.name === value)?.name ?? "Select a project...";

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  async function onCreateProject() {
    const createdProject = await createProject(createProjectValue);
    projects.update((p) => [...p, createdProject]);
    createProjectValue = "";
  }
</script>

<div class="h-screen flex-col bg-gray-500 py-4 text-center">
  <Badge class="block">Projects</Badge>

  <Popover.Root bind:open let:ids>
    <Popover.Trigger asChild let:builder>
      <Button
        builders={[builder]}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        class="my-2"
      >
        {selectedValue}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="w-[200px] p-0">
      <Command.Root>
        <Command.Input placeholder="Search project..." />
        <Command.Empty>No project found.</Command.Empty>
        <Command.Group>
          {#each $projects as project}
            <Command.Item
              value={project.name}
              onSelect={(currentValue) => {
                value = currentValue;
                closeAndFocusTrigger(ids.trigger);
              }}
            >
              <Check class={cn("mr-2 h-4 w-4", value !== project.name && "text-transparent")} />
              {project.name}
            </Command.Item>
          {/each}
        </Command.Group>
        <Separator />
        <Command.Group>
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Command.Item>
                <PlusCircle class="mr-1" />
                Create a new project
              </Command.Item>
            </AlertDialog.Trigger>

            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Subscription required!</AlertDialog.Title>
                <AlertDialog.Description>
                  <div class="flex w-full max-w-sm items-center space-x-2">
                    <Input type="text" placeholder="project name" bind:value={createProjectValue} />
                    <Button type="submit" on:click={onCreateProject}>Create</Button>
                  </div>
                </AlertDialog.Description>
              </AlertDialog.Header>

              <AlertDialog.Footer>
                <AlertDialog.Cancel>Close</AlertDialog.Cancel>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Command.Group>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>

  <Separator />

  <Button variant="ghost" class="my-2" on:click={() => goto("/")}>
    <FlaskConical class="mr-2 h-4 w-4" /> Go to tests
  </Button>
</div>
