<script lang="ts">
  import { Test, listTests, type EnvironmentsData } from "$lib/backend-client";
  import EnvironmentList from "$lib/components/EnvironmentList.svelte";
  import TestList from "$lib/components/TestList.svelte";
  import Logo from "$lib/components/ui/illustrations/Logo.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import { activeProject } from "$lib/stores/projects";
  import { setMode } from "mode-watcher";
  import { onMount } from "svelte";
  import ProjectSelector from "./ProjectSelector.svelte";
  import SidebarSection from "./SidebarSection.svelte";

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

  onMount(() => {
    setMode("light");
  });

  async function loadProjectTests() {
    activeProjectTests = await listTests($activeProject);
  }
</script>

<div class="flex h-screen flex-col gap-4 p-4 text-center">
  <Logo class="self-center" />
  <Separator />
  <ProjectSelector />

  <SidebarSection title={`Tests (${activeProjectTests.length})`}>
    <TestList tests={activeProjectTests} />
  </SidebarSection>
  <SidebarSection title="Environments">
    <EnvironmentList bind:environments />
  </SidebarSection>
</div>
