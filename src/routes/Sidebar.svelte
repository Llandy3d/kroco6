<script lang="ts">
  import { Container } from "lucide-svelte";

  import { Test, listTests, type EnvironmentsData } from "$lib/backend-client";
  import EnvironmentList from "$lib/components/EnvironmentList.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import TestList from "$lib/components/TestList.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { activeProject } from "$lib/stores/projects";
  import ProjectSelector from "./ProjectSelector.svelte";

  // envs holds the active environment and the list of environments
  // that the user can switch between.
  //
  // This is provided to us by the backend tauri app, and is assumed to
  // be loaded, and most likely bounded from by the parent loading this
  // specific component.
  export let environmentsData: EnvironmentsData = { active: "default", environments: [] };
  $: environments = environmentsData?.environments;

  let activeProjectTests: Test[] = [];
  $: $activeProject, loadProjectTests();

  async function loadProjectTests() {
    activeProjectTests = await listTests($activeProject);
  }
</script>

<div class="flex h-screen flex-col gap-4 p-4 text-center">
  <Logo class="self-center" />
  <Separator />
  <ProjectSelector />

  <h2 class="text-left uppercase">Tests ({activeProjectTests.length})</h2>
  <TestList tests={activeProjectTests} />

  <Separator />

  <Button variant="ghost" class="my-2">
    <Container class="mr-2 h-4 w-4" /> Environments
  </Button>

  <EnvironmentList bind:environments />
</div>
