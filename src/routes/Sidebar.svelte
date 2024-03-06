<script lang="ts">
  import { PlusCircle, FlaskConical } from "lucide-svelte";
  import { Check, ChevronsUpDown, Container } from "lucide-svelte";
  import { onMount, tick } from "svelte";

  import { goto } from "$app/navigation";
  import {
    type Environment as IEnvironment,
    createProject,
    listTests,
    type EnvironmentsData,
    Test,
  } from "$lib/backend-client";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { activeProject, projects } from "$lib/stores/projects";
  import { Separator } from "$lib/components/ui/separator";
  import { cn } from "$lib/utils";
  import EnvironmentList from "$lib/components/EnvironmentList.svelte";
  import TestList from "$lib/components/TestList.svelte";

  // envs holds the active environment and the list of environments
  // that the user can switch between.
  //
  // This is provided to us by the backend tauri app, and is assumed to
  // be loaded, and most likely bounded from by the parent loading this
  // specific component.
  export let environmentsData: EnvironmentsData = { active: "default", environments: [] };
  $: environments = environmentsData?.environments;

  let open = false;
  let createProjectValue = "";

  let showCreateDialog = false;

  $: selectedProject =
    $projects.find((f) => f.name === $activeProject)?.name ?? "Select a project...";

  let activeProjectTests: Test[] = [];

  listTests($activeProject).then((tests) => {
    activeProjectTests = tests;
  });

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

<div class="flex h-screen flex-col bg-gray-500 py-4 text-center">
  <h2>Projects</h2>

  <Popover.Root bind:open let:ids>
    <Popover.Trigger asChild let:builder>
      <Button
        builders={[builder]}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        class="self-strech m-2 flex justify-between"
      >
        {selectedProject}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
              showCreateDialog = true;
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

  <Separator />

  <Button variant="ghost" class="my-2" on:click={() => goto("/")}>
    <FlaskConical class="mr-2 h-4 w-4" />Project's Tests
  </Button>

  <TestList tests={activeProjectTests} />

  <Separator />

  <Button variant="ghost" class="my-2">
    <Container class="mr-2 h-4 w-4" /> Environments
  </Button>

  <EnvironmentList bind:environments />
</div>

<AlertDialog.Root bind:open={showCreateDialog}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Create new project</AlertDialog.Title>
      <AlertDialog.Description>
        <Input
          class="w-full"
          type="text"
          placeholder="Project name"
          bind:value={createProjectValue}
        />
      </AlertDialog.Description>
    </AlertDialog.Header>

    <AlertDialog.Footer>
      <AlertDialog.Cancel>Close</AlertDialog.Cancel>
      <Button type="submit" on:click={onCreateProject}>Create</Button>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
