<script lang="ts">
  import "../app.pcss";
  import { Toaster } from "$lib/components/ui/sonner";
  import { ModeWatcher } from "mode-watcher";
  import Sidebar from "./Sidebar.svelte";
  import { onMount } from "svelte";

  import { projects } from "$lib/stores/projects";
  import { listProjects, type EnvironmentsData, loadEnvironments } from "$lib/backend-client";

  let environmentsData: EnvironmentsData = { environments: [] };

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

  <div class="flex flex-auto flex-col">
    <slot />
  </div>
</div>
