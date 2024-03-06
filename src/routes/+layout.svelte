<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner";
  import { onMount } from "svelte";
  import "../app.pcss";
  import Sidebar from "./Sidebar.svelte";

  import { listProjects, loadEnvironments, type EnvironmentsData } from "$lib/backend-client";
  import { projects } from "$lib/stores/projects";

  let environmentsData: EnvironmentsData = {
    active: "",
    environments: [],
  };

  onMount(async () => {
    const projectsList = await listProjects();
    projects.update(() => projectsList);

    environmentsData = await loadEnvironments();
    console.log(`loaded envs:`, JSON.stringify(environmentsData, null, 2));
  });
</script>

<Toaster />

<div class="flex">
  <div class="w-72">
    <Sidebar bind:environmentsData />
  </div>

  <div class="flex flex-auto flex-col bg-secondary p-2">
    <slot />
  </div>
</div>
