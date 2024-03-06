<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { Separator } from "$lib/components/ui/separator";
  import { activeProject, projects } from "$lib/stores/projects";
  import { cn } from "$lib/utils";
  import { Check, ChevronDown, PlusCircle } from "lucide-svelte";
  import { tick } from "svelte";
  import CreateProjectDialog from "./CreateProjectDialog.svelte";

  let open = false;
  let createDialogOpen = false;

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  async function closeAndFocusTrigger(triggerId: string) {
    open = false;
    await tick();
    document.getElementById(triggerId)?.focus();
  }
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild let:builder>
    <Button
      builders={[builder]}
      variant="outline"
      role="combobox"
      aria-expanded={open}
      class="self-strech flex justify-between"
    >
      {$activeProject}
      <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="rounded-none p-0" sameWidth>
    <Command.Root>
      <Command.Input placeholder="Search project..." />
      <Command.Empty>No project found.</Command.Empty>
      <Command.Group>
        {#each $projects as project}
          <Command.Item
            value={project.name}
            onSelect={(currentValue) => {
              $activeProject = currentValue;

              closeAndFocusTrigger(ids.trigger);
            }}
          >
            <Check
              class={cn("mr-2 h-4 w-4", $activeProject !== project.name && "text-transparent")}
            />
            {project.name}
          </Command.Item>
        {/each}
      </Command.Group>
      <Separator />
      <Command.Group>
        <Command.Item
          onSelect={() => {
            createDialogOpen = true;
            open = false;
          }}
        >
          <PlusCircle class="mr-2" size={16} />
          Create a new project
        </Command.Item>
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
<CreateProjectDialog bind:open={createDialogOpen} />
